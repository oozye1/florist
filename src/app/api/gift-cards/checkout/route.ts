import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

interface GiftCardCheckoutBody {
  amount: number
  senderName: string
  senderEmail: string
  recipientName: string
  recipientEmail: string
  message: string
}

export async function POST(req: NextRequest) {
  try {
    const body: GiftCardCheckoutBody = await req.json()
    const { amount, senderName, senderEmail, recipientName, recipientEmail, message } = body

    if (!amount || amount < 5 || amount > 500) {
      return NextResponse.json({ error: 'Amount must be between £5 and £500' }, { status: 400 })
    }

    if (!senderEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const stripe = getStripe()
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: senderEmail,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Love Blooms Gift Card — £${amount}`,
              description: recipientName ? `For ${recipientName}` : 'Digital gift card',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'gift_card',
        amount: String(amount),
        senderName,
        senderEmail,
        recipientName: recipientName || '',
        recipientEmail: recipientEmail || '',
        message: message || '',
      },
      success_url: `${origin}/gift-cards/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/gift-cards`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Gift card checkout error:', error)
    const msg = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
