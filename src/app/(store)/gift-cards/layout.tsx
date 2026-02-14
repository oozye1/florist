import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Gift Cards | The Perfect Flower Gift for Any Occasion',
  description: `Send a ${SITE_NAME} gift card from £25 to £200. Let them choose their own luxury floral arrangement. Delivered instantly by email — perfect for birthdays, thank yous, and last-minute gifts.`,
  alternates: {
    canonical: `${SITE_URL}/gift-cards`,
  },
  openGraph: {
    title: `Flower Gift Cards | ${SITE_NAME}`,
    description: 'Send a digital gift card and let them choose their perfect bouquet. From £25.',
  },
}

export default function GiftCardsLayout({ children }: { children: React.ReactNode }) {
  return children
}
