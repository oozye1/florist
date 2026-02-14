import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProductBySlug, getProducts } from '@/lib/firebase/services/products'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import AddToCartSection from '@/components/store/AddToCartSection'
import ProductImageGallery from '@/components/store/ProductImageGallery'
import ProductCard from '@/components/store/ProductCard'
import { Star, Truck, Shield, Clock, ChevronRight } from 'lucide-react'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

async function findProduct(slug: string) {
  try {
    const product = await getProductBySlug(slug)
    if (product) return product
  } catch {
    // Firestore not configured
  }
  return null
}

export async function generateStaticParams() {
  try {
    const products = await getProducts({ active: true })
    return products.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await findProduct(slug)
  if (!product) return { title: 'Product Not Found' }

  return {
    title: product.seoTitle || `${product.name} - ${product.categoryName}`,
    description: product.seoDescription || product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.map((img) => ({
        url: img.url,
        alt: img.alt,
      })),
      type: 'website',
    },
    alternates: {
      canonical: `${SITE_URL}/products/${slug}`,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await findProduct(slug)

  if (!product || !product.isActive) notFound()

  // Related products
  let allProducts: import('@/types').Product[] = []
  try {
    allProducts = await getProducts({ category: product.category })
  } catch {
    // Firestore not available
  }
  const related = allProducts.filter(
    (p) =>
      p.id !== product.id &&
      p.isActive &&
      (p.category === product.category ||
        p.occasions.some((o) => product.occasions.includes(o)))
  ).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'GBP',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.averageRating,
        reviewCount: product.reviewCount,
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <Link href="/products" className="hover:text-primary">Shop</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-primary"
          >
            {product.categoryName}
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <ProductImageGallery images={product.images} productName={product.name} />

          {/* Product Info */}
          <div>
            <span className="text-sm font-medium text-secondary uppercase tracking-wide">
              {product.categoryName}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl mt-2 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.averageRating)
                          ? 'fill-secondary text-secondary'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.averageRating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {product.compareAtPrice && (
                <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  Save {formatPrice(product.compareAtPrice - product.price)}
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Add to Cart Section */}
            <AddToCartSection product={product} />

            {/* USPs */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t">
              {product.allowsSameDay && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Same Day Delivery</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-primary" />
                <span>Free Over £50</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span>7-Day Freshness</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="mt-8 space-y-0 border-t">
              {[
                {
                  title: "What's Included",
                  content: product.longDescription || product.description,
                },
                {
                  title: 'Care Instructions',
                  content:
                    'Trim stems at an angle and place in fresh water immediately. Change water every 2-3 days and keep away from direct sunlight and heat sources. Remove any leaves below the waterline. Your flowers should last 7+ days with proper care.',
                },
                {
                  title: 'Delivery Information',
                  content: `${product.allowsSameDay ? 'Same-day delivery available when ordered before 2pm. ' : ''}Next-day delivery guaranteed when ordered before midnight. Free standard delivery on orders over £50. All arrangements are hand-delivered by our team.`,
                },
              ].map((item) => (
                <details key={item.title} className="border-b group">
                  <summary className="flex items-center justify-between py-4 cursor-pointer text-sm font-medium hover:text-primary transition-colors">
                    {item.title}
                    <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="text-sm text-muted-foreground pb-4 leading-relaxed">
                    {item.content}
                  </p>
                </details>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-serif text-2xl md:text-3xl mb-8">
              You May Also Love
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
