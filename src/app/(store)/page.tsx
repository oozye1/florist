import type { Metadata } from 'next'
import HeroSection from '@/components/store/HeroSection'
import USPStrip from '@/components/store/USPStrip'
import FeaturedProducts from '@/components/store/FeaturedProducts'
import OccasionGrid from '@/components/store/OccasionGrid'
import TestimonialCarousel from '@/components/store/TestimonialCarousel'
import NewsletterSignup from '@/components/store/NewsletterSignup'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { getProducts } from '@/lib/firebase/services/products'
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

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

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
      <HeroSection />
      <USPStrip />
      <FeaturedProducts products={featuredProducts} />
      <OccasionGrid />
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
            {[
              { name: 'Weekly Blooms', price: '£29.99/week', desc: 'A fresh bouquet every week to brighten your home' },
              { name: 'Fortnightly Delight', price: '£34.99/fortnight', desc: 'Beautiful flowers delivered every two weeks', popular: true },
              { name: 'Monthly Surprise', price: '£39.99/month', desc: 'A luxurious seasonal arrangement each month' },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? 'border-secondary bg-secondary/5 shadow-md'
                    : 'border-border bg-white hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-serif text-xl mb-2">{plan.name}</h3>
                <p className="text-2xl font-bold text-primary mb-3">{plan.price}</p>
                <p className="text-muted-foreground text-sm mb-6">{plan.desc}</p>
                <a
                  href="/subscriptions"
                  className="inline-block w-full text-center py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                >
                  Subscribe
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      <TestimonialCarousel />
      <NewsletterSignup />
    </>
  )
}
