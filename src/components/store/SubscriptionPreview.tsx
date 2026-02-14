import Link from 'next/link'
import type { SubscriptionPlan } from '@/types'

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'week',
  fortnightly: 'fortnight',
  monthly: 'month',
}

interface SubscriptionPreviewProps {
  plans: SubscriptionPlan[]
}

export default function SubscriptionPreview({ plans }: SubscriptionPreviewProps) {
  if (!plans.length) return null

  // Show up to 3 plans, mark fortnightly as popular (or the middle plan)
  const displayPlans = plans.slice(0, 3)

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
          Flower Subscriptions
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Fresh, seasonal blooms delivered to your door. Choose weekly,
          fortnightly, or monthly — and save up to 25%.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {displayPlans.map((plan) => {
            const isPopular = plan.frequency === 'fortnightly'
            const freq = FREQUENCY_LABELS[plan.frequency] || plan.frequency
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-lg ${
                  isPopular
                    ? 'border-secondary bg-secondary/5 shadow-md'
                    : 'border-border bg-white hover:border-primary/30'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-serif text-xl mb-2">{plan.name}</h3>
                <p className="text-2xl font-bold text-primary mb-3">
                  £{plan.price.toFixed(2)}/{freq}
                </p>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                <Link
                  href="/subscriptions"
                  className="inline-block w-full text-center py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                >
                  Subscribe
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
