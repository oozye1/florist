import { Truck, Clock, ShieldCheck, Heart, Gift, Star, Zap, Shield, MapPin, CreditCard, Package, Flower2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { USPItem } from '@/types'

const ICON_MAP: Record<string, LucideIcon> = {
  Truck, Clock, ShieldCheck, Heart, Gift, Star, Zap, Shield, MapPin, CreditCard, Package, Flower2,
}

const DEFAULT_USPS: USPItem[] = [
  { icon: 'Truck', text: 'Free UK Delivery Over £50' },
  { icon: 'Clock', text: 'Same Day Delivery' },
  { icon: 'ShieldCheck', text: '7-Day Freshness Guarantee' },
  { icon: 'Heart', text: 'Handcrafted With Love' },
]

interface USPStripProps {
  items?: USPItem[]
}

export default function USPStrip({ items }: USPStripProps) {
  const usps = items && items.length > 0 ? items : DEFAULT_USPS

  return (
    <section className="bg-primary/5 py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-primary/15">
          {usps.map((usp) => {
            const Icon = ICON_MAP[usp.icon] || Heart
            return (
              <div
                key={usp.text}
                className="flex items-center justify-center gap-3 px-4 py-2 text-center"
              >
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {usp.text}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
