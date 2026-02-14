import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { isAdminConfigured } from '@/lib/firebase/admin'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

function generateOrderNumber(): string {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `LB-${y}${m}${d}-${rand}`
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata || {}

    if (!isAdminConfigured()) {
      console.error('Stripe webhook received but Firebase Admin not configured — not saved!')
      return NextResponse.json({ received: true, warning: 'Firebase Admin not configured' })
    }

    try {
      const { adminDb } = await import('@/lib/firebase/admin')

      // ── Gift Card Purchase ──
      if (metadata.type === 'gift_card') {
        const amount = parseFloat(metadata.amount || '0')
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        const seg = () =>
          Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
        const code = `LB-${seg()}-${seg()}`

        await adminDb.collection('gift_cards').add({
          code,
          initialBalance: amount,
          currentBalance: amount,
          purchaserId: '',
          senderName: metadata.senderName || '',
          senderEmail: metadata.senderEmail || '',
          recipientName: metadata.recipientName || '',
          recipientEmail: metadata.recipientEmail || '',
          message: metadata.message || '',
          isActive: true,
          stripeSessionId: session.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        console.log(`Gift card ${code} created for £${amount} (session ${session.id})`)
        return NextResponse.json({ received: true })
      }

      // ── Subscription Purchase ──
      if (metadata.type === 'subscription' || session.mode === 'subscription') {
        const planId = metadata.planId || ''
        const stripeSubscriptionId = session.subscription as string

        await adminDb.collection('subscriptions').add({
          userId: metadata.userId || '',
          planId,
          status: 'active',
          stripeSubscriptionId: stripeSubscriptionId || '',
          startedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        console.log(`Subscription created for plan ${planId} (session ${session.id})`)
        return NextResponse.json({ received: true })
      }

      // ── Regular Order ──
      let items: Array<{
        productId: string
        name: string
        variantName?: string
        price: number
        quantity: number
        imageUrl: string
      }> = []

      try {
        items = JSON.parse(metadata.itemsJson || '[]')
      } catch {
        console.error('Failed to parse items from metadata')
      }

      const orderItems = items.map((item) => ({
        productId: item.productId,
        productName: item.name,
        productImage: item.imageUrl,
        variantName: item.variantName || undefined,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      }))

      const subtotal = orderItems.reduce((sum, i) => sum + i.totalPrice, 0)
      const totalPaid = (session.amount_total || 0) / 100
      const discountTotal = (session.total_details?.amount_discount || 0) / 100

      // Redeem gift card if one was used
      const giftCardCode = metadata.giftCardCode
      const giftCardAmount = parseFloat(metadata.giftCardAmount || '0')
      if (giftCardCode && giftCardAmount > 0) {
        try {
          const { redeemGiftCard } = await import('@/lib/firebase/services/gift-cards')
          await redeemGiftCard(giftCardCode, giftCardAmount)
          console.log(`Redeemed £${giftCardAmount} from gift card ${giftCardCode}`)
        } catch (err) {
          console.error('Failed to redeem gift card:', err)
        }
      }

      const orderData = {
        orderNumber: generateOrderNumber(),
        status: 'confirmed',
        paymentStatus: 'paid',
        stripeSessionId: session.id,
        stripePaymentIntentId: (session.payment_intent as string) || '',
        items: orderItems,
        subtotal,
        deliveryFee: totalPaid - subtotal + discountTotal + giftCardAmount,
        discountAmount: discountTotal,
        giftCardCode: giftCardCode || undefined,
        giftCardAmount: giftCardAmount || undefined,
        total: totalPaid,
        deliveryType: 'next_day',
        deliveryDate: '',
        billingName: metadata.billingName || '',
        billingEmail: metadata.billingEmail || session.customer_email || '',
        billingPhone: metadata.billingPhone || undefined,
        billingAddress: {
          line1: '',
          city: '',
          postcode: '',
          country: 'GB',
        },
        recipientName: metadata.recipientName || '',
        recipientPhone: metadata.recipientPhone || undefined,
        deliveryAddress: {
          line1: metadata.deliveryLine1 || '',
          line2: metadata.deliveryLine2 || undefined,
          city: metadata.deliveryCity || '',
          postcode: metadata.deliveryPostcode || '',
          country: 'GB',
        },
        deliveryInstructions: metadata.deliveryInstructions || undefined,
        couponCode: metadata.couponCode || undefined,
        loyaltyPointsUsed: 0,
        loyaltyPointsEarned: Math.floor(totalPaid),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await adminDb.collection('orders').add(orderData)
      console.log(`Order ${orderData.orderNumber} created for session ${session.id}`)
    } catch (err) {
      console.error('Failed to process webhook:', err)
    }
  }

  // Handle subscription cancellation from Stripe
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription

    if (isAdminConfigured()) {
      try {
        const { adminDb } = await import('@/lib/firebase/admin')
        const snapshot = await adminDb
          .collection('subscriptions')
          .where('stripeSubscriptionId', '==', subscription.id)
          .limit(1)
          .get()

        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            status: 'cancelled',
            cancelledAt: new Date(),
            updatedAt: new Date(),
          })
          console.log(`Subscription ${subscription.id} cancelled via webhook`)
        }
      } catch (err) {
        console.error('Failed to cancel subscription from webhook:', err)
      }
    }
  }

  return NextResponse.json({ received: true })
}
