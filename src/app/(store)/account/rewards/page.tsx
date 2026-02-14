'use client'

import { useAuth } from '@/hooks/use-auth'
import { Star, Gift, ShoppingBag, UserPlus } from 'lucide-react'

const TRANSACTIONS = [
  { id: '1', points: 100, reason: 'Welcome bonus', date: '2026-01-15' },
  { id: '2', points: 90, reason: 'Order #LB-20260210-001', date: '2026-02-10' },
  { id: '3', points: 135, reason: 'Order #LB-20260213-002', date: '2026-02-13' },
  { id: '4', points: 50, reason: 'Product review', date: '2026-02-12' },
]

export default function RewardsPage() {
  const { profile } = useAuth()
  const points = profile?.loyaltyPoints || 375

  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">Loyalty Rewards</h2>

      {/* Points Balance */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 text-white mb-8">
        <p className="text-sm opacity-80">Your Points Balance</p>
        <p className="text-5xl font-bold mt-2">{points}</p>
        <p className="text-sm opacity-80 mt-2">
          = {(points / 100).toFixed(2)} discount available at checkout
        </p>
        <div className="mt-4 bg-white/10 rounded-lg px-4 py-2 inline-block">
          <p className="text-xs">100 points = &pound;1.00 off your next order</p>
        </div>
      </div>

      {/* How to Earn */}
      <div className="mb-8">
        <h3 className="font-serif text-lg mb-4">How to Earn Points</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: ShoppingBag, title: 'Place Orders', desc: 'Earn 1 point for every &pound;1 spent', points: '1pt/&pound;1' },
            { icon: Star, title: 'Write Reviews', desc: 'Share your experience and earn points', points: '50 pts' },
            { icon: UserPlus, title: 'Refer Friends', desc: 'Both you and your friend earn rewards', points: '200 pts' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-border p-5 text-center">
              <item.icon className="w-8 h-8 text-secondary mx-auto mb-3" />
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: item.desc }} />
              <p className="text-primary font-bold text-sm mt-2" dangerouslySetInnerHTML={{ __html: item.points }} />
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="font-serif text-lg mb-4">Points History</h3>
        <div className="bg-white rounded-xl border border-border divide-y">
          {TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium">{tx.reason}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
              <span className={`font-bold text-sm ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tx.points > 0 ? '+' : ''}{tx.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
