'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, Flower, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getActivePlans } from '@/lib/firebase/services/subscriptions'
import type { SubscriptionPlan } from '@/types'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Every week',
  fortnightly: 'Every 2 weeks',
  monthly: 'Every month',
}

const FALLBACK_PLANS: (Omit<SubscriptionPlan, 'id' | 'imageUrl' | 'isActive'> & { slug: string })[] = [
  {
    name: 'Weekly Blooms',
    slug: 'weekly-blooms',
    frequency: 'weekly',
    price: 29.99,
    description: 'A fresh, hand-crafted bouquet delivered to your door every week.',
  },
  {
    name: 'Fortnightly Delight',
    slug: 'fortnightly-delight',
    frequency: 'fortnightly',
    price: 34.99,
    description: 'Beautiful blooms delivered fortnightly — our most popular plan.',
  },
  {
    name: 'Monthly Surprise',
    slug: 'monthly-surprise',
    frequency: 'monthly',
    price: 39.99,
    description: 'A luxurious, show-stopping arrangement delivered once a month.',
  },
]

const PLAN_FEATURES: Record<string, string[]> = {
  weekly: [
    'Seasonal fresh flowers',
    'Free delivery',
    'Change or skip anytime',
    'Free flower food sachet',
  ],
  fortnightly: [
    'Premium seasonal flowers',
    'Free delivery',
    'Change or skip anytime',
    'Free vase with first delivery',
    'Exclusive varieties',
  ],
  monthly: [
    'Luxury designer arrangement',
    'Free delivery',
    'Change or skip anytime',
    'Premium vase included',
    'Exclusive seasonal specials',
    'Priority customer support',
  ],
}

export default function SubscriptionsPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [plans, setPlans] = useState<(SubscriptionPlan | typeof FALLBACK_PLANS[number])[]>(FALLBACK_PLANS)
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)

  useEffect(() => {
    getActivePlans().then((dbPlans) => {
      if (dbPlans.length > 0) setPlans(dbPlans)
    }).catch(() => {})
  }, [])

  async function handleSubscribe(plan: typeof plans[number]) {
    if (!user) {
      router.push('/login?redirect=/subscriptions')
      return
    }

    const planId = 'id' in plan ? plan.id : plan.slug
    setLoadingPlanId(planId)

    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          planName: plan.name,
          price: plan.price,
          frequency: plan.frequency,
          email: user.email,
          name: profile?.fullName || user.displayName || '',
          userId: user.uid,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout')

      if (data.url) window.location.href = data.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setLoadingPlanId(null)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Flower className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h1 className="font-serif text-4xl md:text-5xl mb-4">
            Flower Subscriptions
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Fresh, seasonal blooms delivered straight to your door. No
            commitment — skip or cancel anytime. Save up to 25% compared to
            one-off orders.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const planId = 'id' in plan ? plan.id : plan.slug
            const isPopular = plan.frequency === 'fortnightly'
            const features = PLAN_FEATURES[plan.frequency] || PLAN_FEATURES.monthly

            return (
              <div
                key={planId}
                className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${
                  isPopular
                    ? 'border-secondary bg-secondary/5 shadow-lg scale-105'
                    : 'border-border bg-white hover:border-primary/30'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}

                <h3 className="font-serif text-2xl mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {FREQUENCY_LABELS[plan.frequency] || plan.frequency}
                </p>
                <p className="text-4xl font-bold text-primary mb-1">
                  {formatPrice(plan.price)}
                </p>
                <p className="text-sm text-muted-foreground mb-6">per delivery</p>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className="w-full"
                  variant={isPopular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlanId === planId}
                >
                  {loadingPlanId === planId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-muted py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { step: '1', title: 'Choose Your Plan', desc: 'Pick the frequency and plan that suits your lifestyle.' },
              { step: '2', title: 'We Craft & Deliver', desc: 'Our florists create a beautiful arrangement just for you.' },
              { step: '3', title: 'Enjoy & Repeat', desc: 'Fresh flowers arrive regularly. Skip or cancel anytime.' },
            ].map((item) => (
              <div key={item.step}>
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-serif text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
