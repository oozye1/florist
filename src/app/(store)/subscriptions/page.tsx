import type { Metadata } from 'next'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Check, Flower } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Flower Subscriptions | Fresh Blooms Delivered Regularly',
  description:
    'Subscribe to regular fresh flower deliveries. Choose weekly, fortnightly, or monthly plans. Save up to 25% with our subscription service.',
}

const PLANS = [
  {
    name: 'Weekly Blooms',
    frequency: 'Every week',
    price: 29.99,
    description: 'A fresh, hand-crafted bouquet delivered to your door every week.',
    features: [
      'Seasonal fresh flowers',
      'Free delivery',
      'Change or skip anytime',
      'Free flower food sachet',
    ],
    popular: false,
  },
  {
    name: 'Fortnightly Delight',
    frequency: 'Every 2 weeks',
    price: 34.99,
    description: 'Beautiful blooms delivered fortnightly — our most popular plan.',
    features: [
      'Premium seasonal flowers',
      'Free delivery',
      'Change or skip anytime',
      'Free vase with first delivery',
      'Exclusive varieties',
    ],
    popular: true,
  },
  {
    name: 'Monthly Surprise',
    frequency: 'Every month',
    price: 39.99,
    description: 'A luxurious, show-stopping arrangement delivered once a month.',
    features: [
      'Luxury designer arrangement',
      'Free delivery',
      'Change or skip anytime',
      'Premium vase included',
      'Exclusive seasonal specials',
      'Priority customer support',
    ],
    popular: false,
  },
]

export default function SubscriptionsPage() {
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
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${
                plan.popular
                  ? 'border-secondary bg-secondary/5 shadow-lg scale-105'
                  : 'border-border bg-white hover:border-primary/30'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <h3 className="font-serif text-2xl mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.frequency}
              </p>
              <p className="text-4xl font-bold text-primary mb-1">
                &pound;{plan.price.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                per delivery
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                Subscribe Now
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-muted py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl text-center mb-12">
            How It Works
          </h2>
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
