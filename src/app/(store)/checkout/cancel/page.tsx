import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout Cancelled',
  robots: { index: false },
}

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
        <XCircle className="w-10 h-10 text-red-500" />
      </div>

      <h1 className="font-serif text-3xl mb-4">Order Cancelled</h1>
      <p className="text-muted-foreground mb-8">
        Your order was not completed. Don&apos;t worry — your cart items are
        still saved. You can return to checkout whenever you&apos;re ready.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/cart">
          <Button>
            <ArrowLeft className="w-4 h-4" />
            Return to Cart
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
