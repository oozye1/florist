import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Flower Subscriptions | Fresh Blooms Delivered Weekly, Fortnightly or Monthly',
  description: `Subscribe to ${SITE_NAME} and receive hand-crafted seasonal bouquets delivered to your door. Choose weekly, fortnightly or monthly deliveries. Save up to 25% vs one-off orders. Free delivery on all subscription plans.`,
  alternates: {
    canonical: `${SITE_URL}/subscriptions`,
  },
  openGraph: {
    title: `Flower Subscriptions | ${SITE_NAME}`,
    description: 'Fresh, seasonal bouquets delivered on your schedule. Save up to 25% with a flower subscription.',
  },
}

export default function SubscriptionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
