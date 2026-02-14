import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: { index: false },
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; session_id?: string; type?: string }>
}) {
  const { order, session_id, type } = await searchParams
  const isSubscription = type === 'subscription'

  let orderRef = order
  if (!orderRef && session_id && !isSubscription) {
    try {
      const { getOrderByStripeSession } = await import('@/lib/firebase/services/orders')
      const found = await getOrderByStripeSession(session_id)
      if (found) orderRef = found.orderNumber
    } catch {
      // Firestore not available
    }
  }

  if (isSubscription) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <RefreshCw className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="font-serif text-4xl mb-4">Subscription Active!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your flower subscription has been set up successfully. Fresh blooms are on their way!
        </p>

        <div className="bg-white rounded-xl border border-border p-8 mb-8 text-left">
          <h2 className="font-serif text-xl mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            What happens next?
          </h2>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-medium">Subscription Confirmed</p>
                <p className="text-sm text-muted-foreground">
                  Your recurring flower delivery has been set up and is ready to go.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-medium">First Delivery</p>
                <p className="text-sm text-muted-foreground">
                  Our florists will prepare your first arrangement and deliver it to your door.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-7 h-7 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-medium">Regular Deliveries</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive fresh flowers on your chosen schedule. Manage or cancel anytime from your account.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/account/subscriptions">
            <Button variant="outline">
              Manage Subscription
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>

      <h1 className="font-serif text-4xl mb-4">Thank You!</h1>
      <p className="text-xl text-muted-foreground mb-2">
        Your order has been confirmed.
      </p>
      {orderRef && (
        <p className="text-sm text-muted-foreground mb-8">
          Order reference: <span className="font-mono font-bold">{orderRef}</span>
        </p>
      )}

      <div className="bg-white rounded-xl border border-border p-8 mb-8 text-left">
        <h2 className="font-serif text-xl mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          What happens next?
        </h2>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </span>
            <div>
              <p className="font-medium">Order Confirmed</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ve received your order and our florists are getting ready.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-7 h-7 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </span>
            <div>
              <p className="font-medium">Being Prepared</p>
              <p className="text-sm text-muted-foreground">
                Your arrangement is being hand-crafted by our expert florists.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-7 h-7 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </span>
            <div>
              <p className="font-medium">Out for Delivery</p>
              <p className="text-sm text-muted-foreground">
                Your flowers are on their way! We&apos;ll deliver them with care.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/account/orders">
          <Button variant="outline">
            Track Your Order
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
