import type { Metadata } from 'next'
import Link from 'next/link'
import { UK_LOCATIONS, SITE_URL, SITE_NAME } from '@/lib/constants'
import { SEED_PRODUCTS } from '@/lib/seed-data'
import ProductCard from '@/components/store/ProductCard'
import { Button } from '@/components/ui/button'
import { MapPin, Truck, Clock, Shield } from 'lucide-react'

interface LocationPageProps {
  params: Promise<{ location: string }>
}

export async function generateStaticParams() {
  return UK_LOCATIONS.map((l) => ({ location: l.slug }))
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { location } = await params
  const loc = UK_LOCATIONS.find((l) => l.slug === location)
  const name = loc?.name || 'Your Area'

  return {
    title: `Flower Delivery in ${name} | Same Day & Next Day`,
    description: `Order luxury flower delivery in ${name}. Hand-crafted bouquets, same-day delivery available. Free delivery over £50. From ${SITE_NAME}.`,
    alternates: {
      canonical: `${SITE_URL}/flower-delivery/${location}`,
    },
  }
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { location } = await params
  const loc = UK_LOCATIONS.find((l) => l.slug === location)
  const name = loc?.name || 'Your Area'

  // Show 8 featured products
  const products = SEED_PRODUCTS.filter((p) => p.isActive && p.isFeatured).slice(0, 8)

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <MapPin className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h1 className="font-serif text-4xl md:text-5xl mb-4">
            Flower Delivery in {name}
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Beautiful, hand-crafted floral arrangements delivered to your door
            in {name}. Order before 2pm for same-day delivery or choose a
            date that suits you.
          </p>
          <Link href="/products" className="mt-8 inline-block">
            <Button size="lg" variant="secondary">
              Shop {name} Flowers
            </Button>
          </Link>
        </div>
      </section>

      {/* USPs */}
      <section className="py-12 px-4 border-b">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Free Over £50</p>
            <p className="text-xs text-muted-foreground">to {name}</p>
          </div>
          <div>
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Same Day</p>
            <p className="text-xs text-muted-foreground">Order by 2pm</p>
          </div>
          <div>
            <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Freshness Guarantee</p>
            <p className="text-xs text-muted-foreground">7 days minimum</p>
          </div>
          <div>
            <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Hand Delivered</p>
            <p className="text-xs text-muted-foreground">With care</p>
          </div>
        </div>
      </section>

      {/* About delivery in this area */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="font-serif text-2xl md:text-3xl mb-6">
          Flower Delivery Services in {name}
        </h2>
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p>
            Love Blooms Florist offers premium flower delivery throughout{' '}
            {name} and the surrounding areas. Every arrangement is
            hand-crafted by our expert florists using the freshest seasonal
            blooms, ensuring your gift arrives looking absolutely stunning.
          </p>
          <p>
            Whether you need same-day delivery for a last-minute surprise or
            want to schedule flowers for a special occasion, we&apos;ve got you
            covered. Our {name} delivery service runs Monday to Saturday,
            with next-day delivery available seven days a week.
          </p>
          <p>
            From romantic roses and birthday bouquets to sympathy flowers and
            wedding arrangements, we offer a wide range of floral gifts
            perfect for any occasion. All orders over £50 qualify for free
            delivery to {name}.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="font-serif text-2xl md:text-3xl mb-8 text-center">
          Popular Flowers for Delivery in {name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/products">
            <Button variant="outline" size="lg">
              View Full Collection
            </Button>
          </Link>
        </div>
      </section>

      {/* Other Locations */}
      <section className="bg-muted py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl text-center mb-8">
            We Also Deliver To
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {UK_LOCATIONS.filter((l) => l.slug !== location).map((l) => (
              <Link
                key={l.slug}
                href={`/flower-delivery/${l.slug}`}
                className="text-sm text-primary bg-white px-4 py-2 rounded-full border border-border hover:border-primary transition-colors"
              >
                {l.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
