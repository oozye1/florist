'use client'

import { Gift } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SubscriptionsPage() {
  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">My Subscriptions</h2>
      <div className="text-center py-16">
        <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-6">
          You don&apos;t have any active subscriptions. Start receiving fresh
          flowers regularly!
        </p>
        <Link href="/subscriptions">
          <Button>Browse Subscription Plans</Button>
        </Link>
      </div>
    </div>
  )
}
