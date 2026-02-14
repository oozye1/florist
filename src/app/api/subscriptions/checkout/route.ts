import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

interface SubscriptionCheckoutBody {
  planId: string
  planName: string
  price: number
  frequency: 'weekly' | 'fortnightly' | 'monthly'
  email: string
  name: string
  userId?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: SubscriptionCheckoutBody = await req.json()
    const { planId, planName, price, frequency, email, name, userId } = body

    if (!planId || !email || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const stripe = getStripe()

    // Map frequency to Stripe recurring interval
    let interval: 'week' | 'month' = 'month'
    let intervalCount = 1
    if (frequency === 'weekly') {
      interval = 'week'
      intervalCount = 1
    } else if (frequency === 'fortnightly') {
      interval = 'week'
      intervalCount = 2
    } else {
      interval = 'month'
      intervalCount = 1
    }

    // Create a Stripe product and price on-the-fly
    const product = await stripe.products.create({
      name: `${planName} Subscription`,
      metadata: { planId, frequency },
    })

    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100),
      currency: 'gbp',
      recurring: { interval, interval_count: intervalCount },
    })

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      metadata: {
        type: 'subscription',
        planId,
        planName,
        frequency,
        customerName: name,
        userId: userId || '',
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
      cancel_url: `${origin}/subscriptions`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Subscription checkout error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
