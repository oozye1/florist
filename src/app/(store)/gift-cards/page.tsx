import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Gift, Heart, Mail, CreditCard } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Gift Cards | The Perfect Present',
  description:
    'Send a Love Blooms Florist gift card — the perfect present for any flower lover. Available in £25, £50, £75, and £100 denominations.',
}

const AMOUNTS = [25, 50, 75, 100]

export default function GiftCardsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-accent py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Gift className="w-12 h-12 text-secondary mx-auto mb-6" />
          <h1 className="font-serif text-4xl md:text-5xl mb-4">
            Gift Cards
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let them choose their own beautiful blooms. Our gift cards are
            delivered instantly by email and never expire.
          </p>
        </div>
      </section>

      {/* Choose Amount */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-serif text-2xl text-center mb-8">
          Choose an Amount
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
          {AMOUNTS.map((amount) => (
            <button
              key={amount}
              className="p-6 rounded-xl border-2 border-border bg-white hover:border-primary hover:shadow-md transition-all text-center group cursor-pointer"
            >
              <p className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">
                &pound;{amount}
              </p>
            </button>
          ))}
        </div>

        <div className="max-w-md mx-auto text-center">
          <Button size="xl" className="w-full">
            <CreditCard className="w-5 h-5" />
            Purchase Gift Card
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Mail, title: 'Instant Delivery', desc: 'Sent directly to their inbox within minutes.' },
              { icon: Heart, title: 'Personal Touch', desc: 'Add a heartfelt message to make it special.' },
              { icon: Gift, title: 'Never Expires', desc: 'No rush — they can redeem whenever they wish.' },
            ].map((item) => (
              <div key={item.title}>
                <item.icon className="w-8 h-8 text-secondary mx-auto mb-4" />
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
