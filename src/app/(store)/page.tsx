import type { Metadata } from 'next'
import HeroSection from '@/components/store/HeroSection'
import USPStrip from '@/components/store/USPStrip'
import FeaturedProducts from '@/components/store/FeaturedProducts'
import OccasionGrid from '@/components/store/OccasionGrid'
import SubscriptionPreview from '@/components/store/SubscriptionPreview'
import TestimonialCarousel from '@/components/store/TestimonialCarousel'
import NewsletterSignup from '@/components/store/NewsletterSignup'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { getProducts } from '@/lib/firebase/services/products'
import { getActivePlans } from '@/lib/firebase/services/subscriptions'
import { getHomepageContent } from '@/lib/firebase/services/homepage'
import { SEED_PRODUCTS } from '@/lib/seed-data'

export const metadata: Metadata = {
  title: `${SITE_NAME} | Luxury Flower Delivery UK`,
  description:
    'Hand-crafted luxury floral arrangements delivered across the UK. Same-day delivery available. Premium roses, bouquets & plants for every occasion.',
  alternates: {
    canonical: SITE_URL,
  },
}

async function getFeaturedProducts() {
  try {
    const products = await getProducts({ featured: true, maxResults: 8 })
    if (products.length > 0) return products
  } catch {
    // Firestore not configured — fall back to seed data
  }
  return SEED_PRODUCTS.filter((p) => p.isFeatured).slice(0, 8)
}

async function getSubscriptionPlans() {
  try {
    const plans = await getActivePlans()
    if (plans.length > 0) return plans
  } catch {
    // fall back
  }
  return []
}

async function getHomepageData() {
  try {
    return await getHomepageContent()
  } catch {
    return null
  }
}

export default async function HomePage() {
  const [featuredProducts, subscriptionPlans, homepageContent] = await Promise.all([
    getFeaturedProducts(),
    getSubscriptionPlans(),
    getHomepageData(),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FloristShop',
    name: SITE_NAME,
    description:
      'Hand-crafted luxury floral arrangements delivered across the UK.',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: '+44-800-123-4567',
    email: 'hello@lovebloomsflorist.co.uk',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Bloom Street',
      addressLocality: 'London',
      addressRegion: 'Greater London',
      postalCode: 'SW1A 1AA',
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.5074,
      longitude: -0.1278,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
    ],
    priceRange: '££',
    currenciesAccepted: 'GBP',
    paymentAccepted: 'Credit Card, Debit Card, Apple Pay, Google Pay',
    sameAs: [
      'https://www.instagram.com/lovebloomsflorist',
      'https://www.facebook.com/lovebloomsflorist',
      'https://www.pinterest.com/lovebloomsflorist',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection content={homepageContent?.hero} />
      <USPStrip items={homepageContent?.uspItems} />
      <FeaturedProducts products={featuredProducts} />
      <OccasionGrid occasions={homepageContent?.occasions} />
      <SubscriptionPreview plans={subscriptionPlans} />
      <TestimonialCarousel testimonials={homepageContent?.testimonials} />
      <NewsletterSignup content={homepageContent?.newsletter} />
    </>
  )
}
