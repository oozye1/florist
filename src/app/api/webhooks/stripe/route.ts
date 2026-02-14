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
      console.error('Stripe webhook received but Firebase Admin not configured — order not saved!')
      return NextResponse.json({ received: true, warning: 'Order not saved — Firebase Admin not configured' })
    }

    try {
      const { adminDb } = await import('@/lib/firebase/admin')

      // Parse items from metadata
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

      const orderData = {
        orderNumber: generateOrderNumber(),
        status: 'confirmed',
        paymentStatus: 'paid',
        stripeSessionId: session.id,
        stripePaymentIntentId: (session.payment_intent as string) || '',
        items: orderItems,
        subtotal,
        deliveryFee: totalPaid - subtotal + discountTotal,
        discountAmount: discountTotal,
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
      console.error('Failed to create order from webhook:', err)
    }
  }

  return NextResponse.json({ received: true })
}
