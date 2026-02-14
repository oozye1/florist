import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId } = await req.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 })
    }

    // Get the subscription from Firestore to find the Stripe subscription ID
    const { getSubscription, cancelSubscription } = await import(
      '@/lib/firebase/services/subscriptions'
    )

    const subscription = await getSubscription(subscriptionId)
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Cancel on Stripe if we have a Stripe subscription ID
    if (subscription.stripeSubscriptionId) {
      try {
        const stripe = getStripe()
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
      } catch (err) {
        console.error('Failed to cancel Stripe subscription:', err)
        // Continue to cancel in Firestore even if Stripe fails
      }
    }

    // Cancel in Firestore
    await cancelSubscription(subscriptionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscription cancel error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
