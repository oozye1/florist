import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { OCCASIONS } from '@/lib/constants'
import { getProducts } from '@/lib/firebase/services/products'
import ProductCard from '@/components/store/ProductCard'

interface OccasionPageProps {
  params: Promise<{ occasion: string }>
}

export async function generateStaticParams() {
  return OCCASIONS.map((occasion) => ({
    occasion: occasion.slug,
  }))
}

export async function generateMetadata({
  params,
}: OccasionPageProps): Promise<Metadata> {
  const { occasion: slug } = await params
  const occasion = OCCASIONS.find((o) => o.slug === slug)

  if (!occasion) {
    return { title: 'Occasion Not Found' }
  }

  return {
    title: `${occasion.name} Flowers`,
    description: occasion.description,
    openGraph: {
      title: `${occasion.name} Flowers | Love Blooms Florist`,
      description: occasion.description,
      images: [{ url: occasion.image, alt: `${occasion.name} flowers` }],
    },
  }
}

export default async function OccasionPage({ params }: OccasionPageProps) {
  const { occasion: slug } = await params
  const occasion = OCCASIONS.find((o) => o.slug === slug)

  if (!occasion) {
    notFound()
  }

  let filteredProducts: import('@/types').Product[] = []
  try {
    filteredProducts = await getProducts({ occasion: slug })
  } catch {
    // Firestore not available
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary/5 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-primary md:text-5xl">
            {occasion.name} Flowers
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {occasion.description}
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        {filteredProducts.length > 0 ? (
          <>
            <p className="mb-8 text-sm text-muted-foreground">
              Showing {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'arrangement' : 'arrangements'} for{' '}
              {occasion.name.toLowerCase()}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="mb-2 font-serif text-xl font-semibold text-foreground">
              No arrangements found
            </p>
            <p className="text-muted-foreground">
              We are currently updating our {occasion.name.toLowerCase()} collection.
              Please check back soon or{' '}
              <a href="/contact" className="font-medium text-primary hover:underline">
                contact us
              </a>{' '}
              for a bespoke arrangement.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
