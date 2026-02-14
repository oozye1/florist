'use client'

import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Package, Heart, Star, MapPin, ChevronRight } from 'lucide-react'

export default function AccountDashboard() {
  const { user, profile } = useAuth()

  return (
    <div>
      <div className="bg-white rounded-xl border border-border p-6 mb-8">
        <h2 className="font-serif text-2xl mb-2">
          Welcome back, {profile?.fullName || user?.displayName || 'there'}!
        </h2>
        <p className="text-muted-foreground">
          Manage your orders, addresses, and preferences all in one place.
        </p>
      </div>

      {/* Loyalty Points */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Your Loyalty Points</p>
            <p className="text-4xl font-bold mt-1">
              {profile?.loyaltyPoints || 100}
            </p>
            <p className="text-sm opacity-80 mt-1">
              Worth {((profile?.loyaltyPoints || 100) / 100).toFixed(2)} in
              rewards
            </p>
          </div>
          <Star className="w-12 h-12 opacity-30" />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            title: 'Recent Orders',
            description: 'Track your orders and view history',
            href: '/account/orders',
            icon: Package,
          },
          {
            title: 'Saved Addresses',
            description: 'Manage your delivery addresses',
            href: '/account/addresses',
            icon: MapPin,
          },
          {
            title: 'Wishlist',
            description: 'View your saved favourites',
            href: '/account/wishlist',
            icon: Heart,
          },
          {
            title: 'Rewards',
            description: 'Earn and redeem loyalty points',
            href: '/account/rewards',
            icon: Star,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
