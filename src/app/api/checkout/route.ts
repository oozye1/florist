import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

interface CheckoutItem {
  productId: string
  variantId?: string
  name: string
  variantName?: string
  price: number
  imageUrl: string
  quantity: number
  giftMessage?: string
  slug: string
}

interface CheckoutBody {
  items: CheckoutItem[]
  deliveryFee: number
  discountAmount: number
  couponCode?: string
  billingName: string
  billingEmail: string
  billingPhone?: string
  recipientName: string
  recipientPhone?: string
  deliveryAddress: {
    line1: string
    line2?: string
    city: string
    postcode: string
  }
  deliveryInstructions?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json()
    const { items, deliveryFee, discountAmount, couponCode, billingName, billingEmail } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!billingEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Build Stripe line items
    const stripe = getStripe()

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.variantName ? `${item.name} — ${item.variantName}` : item.name,
          images: item.imageUrl ? [item.imageUrl] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses pence
      },
      quantity: item.quantity,
    }))

    // Add delivery fee as a line item if > 0
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: { name: 'Delivery Fee' },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      })
    }

    // Build discounts array if coupon applied
    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = []
    if (discountAmount > 0) {
      // Create a one-off coupon in Stripe for the discount
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100),
        currency: 'gbp',
        duration: 'once',
        name: couponCode || 'Discount',
      })
      discounts.push({ coupon: stripeCoupon.id })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: billingEmail,
      line_items: lineItems,
      discounts: discounts.length > 0 ? discounts : undefined,
      metadata: {
        billingName,
        billingEmail,
        billingPhone: body.billingPhone || '',
        recipientName: body.recipientName,
        recipientPhone: body.recipientPhone || '',
        deliveryLine1: body.deliveryAddress.line1,
        deliveryLine2: body.deliveryAddress.line2 || '',
        deliveryCity: body.deliveryAddress.city,
        deliveryPostcode: body.deliveryAddress.postcode,
        deliveryInstructions: body.deliveryInstructions || '',
        couponCode: couponCode || '',
        itemsJson: JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            name: i.name,
            variantName: i.variantName,
            price: i.price,
            quantity: i.quantity,
            imageUrl: i.imageUrl,
          }))
        ),
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
