'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RefreshCw, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import { getUserSubscriptions, getSubscriptionPlan } from '@/lib/firebase/services/subscriptions'
import { formatPrice } from '@/lib/utils'
import { relativeTime } from '@/lib/admin-utils'
import { toast } from 'sonner'
import type { SubscriptionPlan } from '@/types'

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default function AccountSubscriptionsPage() {
  const { user } = useAuth()
  const { data: subscriptions, loading, refetch } = useFirestoreQuery(
    () => (user ? getUserSubscriptions(user.uid) : Promise.resolve([])),
    [user?.uid]
  )
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan>>({})
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)

  // Fetch plan details for each subscription
  if (subscriptions && subscriptions.length > 0) {
    subscriptions.forEach((sub) => {
      if (!plans[sub.planId]) {
        getSubscriptionPlan(sub.planId).then((plan) => {
          if (plan) setPlans((prev) => ({ ...prev, [sub.planId]: plan }))
        })
      }
    })
  }

  async function handleCancel(subscriptionId: string) {
    setCancellingId(subscriptionId)
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel')

      toast.success('Subscription cancelled successfully')
      setConfirmCancelId(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel subscription')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="font-serif text-2xl mb-6">My Subscriptions</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  const activeSubscriptions = subscriptions?.filter((s) => s.status !== 'cancelled') || []
  const cancelledSubscriptions = subscriptions?.filter((s) => s.status === 'cancelled') || []

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div>
        <h2 className="font-serif text-2xl mb-6">My Subscriptions</h2>
        <div className="text-center py-16">
          <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">
            You don&apos;t have any active subscriptions. Start receiving fresh flowers regularly!
          </p>
          <Link href="/subscriptions">
            <Button>Browse Subscription Plans</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">My Subscriptions</h2>

      {activeSubscriptions.length > 0 && (
        <div className="space-y-4 mb-8">
          {activeSubscriptions.map((sub) => {
            const plan = plans[sub.planId]
            return (
              <div key={sub.id} className="bg-white rounded-xl border border-border p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-lg">{plan?.name || 'Subscription'}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[sub.status]}`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {plan && (
                        <p>{formatPrice(plan.price)} / {FREQUENCY_LABELS[plan.frequency]?.toLowerCase() || plan.frequency}</p>
                      )}
                      <p>Started {relativeTime(sub.startedAt || sub.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {confirmCancelId === sub.id ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setConfirmCancelId(null)} disabled={cancellingId === sub.id}>
                          Keep
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleCancel(sub.id)}
                          disabled={cancellingId === sub.id}
                        >
                          {cancellingId === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Cancel'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmCancelId(sub.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {cancelledSubscriptions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Past Subscriptions</h3>
          <div className="space-y-3">
            {cancelledSubscriptions.map((sub) => {
              const plan = plans[sub.planId]
              return (
                <div key={sub.id} className="bg-gray-50 rounded-xl border border-border p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{plan?.name || 'Subscription'}</p>
                      <p className="text-sm text-muted-foreground">
                        Cancelled {relativeTime(sub.cancelledAt || sub.createdAt)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES.cancelled}`}>
                      Cancelled
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/subscriptions">
          <Button variant="outline">Browse More Plans</Button>
        </Link>
      </div>
    </div>
  )
}
