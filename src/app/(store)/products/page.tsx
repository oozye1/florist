import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts } from '@/lib/firebase/services/products'
import { CATEGORIES, OCCASIONS } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import ProductCard from '@/components/store/ProductCard'
import SortSelect from '@/components/store/SortSelect'
import type { CategorySlug } from '@/types'

export const metadata: Metadata = {
  title: 'Shop All Flowers & Bouquets',
  description:
    'Browse our complete collection of luxury hand-crafted bouquets, roses, plants, hampers and letterbox flowers. Same-day delivery available across the UK.',
}

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    occasion?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const { category, occasion, minPrice, maxPrice, sort, page } = params
  const currentPage = parseInt(page || '1', 10)
  const perPage = 12

  // Fetch products from Firestore
  let allProducts: import('@/types').Product[] = []
  try {
    allProducts = await getProducts({
      category: category as CategorySlug | undefined,
      occasion: occasion || undefined,
    })
  } catch {
    // Firestore not available
  }

  let filtered = allProducts.filter((p) => p.isActive)

  if (category) {
    filtered = filtered.filter((p) => p.category === category)
  }
  if (occasion) {
    filtered = filtered.filter((p) => p.occasions.includes(occasion))
  }
  if (minPrice) {
    filtered = filtered.filter((p) => p.price >= parseFloat(minPrice))
  }
  if (maxPrice) {
    filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice))
  }

  // Sort
  switch (sort) {
    case 'price_asc':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      filtered.sort((a, b) => b.averageRating - a.averageRating)
      break
    case 'newest':
      filtered.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
      break
    default:
      // Default: featured first, then by rating
      filtered.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return b.averageRating - a.averageRating
      })
  }

  // Paginate
  const totalPages = Math.ceil(filtered.length / perPage)
  const products = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const activeCategory = CATEGORIES.find((c) => c.slug === category)
  const activeOccasion = OCCASIONS.find((o) => o.slug === occasion)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">
          {activeCategory?.name || activeOccasion?.name || 'All Flowers'}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-serif text-lg mb-3">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className={`text-sm hover:text-primary transition-colors ${
                      !category ? 'text-primary font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    All Flowers
                  </Link>
                </li>
                {CATEGORIES.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`text-sm hover:text-primary transition-colors ${
                        category === cat.slug
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-serif text-lg mb-3">Occasions</h3>
              <ul className="space-y-2">
                {OCCASIONS.map((occ) => (
                  <li key={occ.slug}>
                    <Link
                      href={`/products?occasion=${occ.slug}`}
                      className={`text-sm hover:text-primary transition-colors ${
                        occasion === occ.slug
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {occ.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-serif text-lg mb-3">Price Range</h3>
              <ul className="space-y-2">
                {[
                  { label: 'Under £40', min: '0', max: '40' },
                  { label: '£40 - £70', min: '40', max: '70' },
                  { label: '£70 - £100', min: '70', max: '100' },
                  { label: 'Over £100', min: '100', max: '' },
                ].map((range) => (
                  <li key={range.label}>
                    <Link
                      href={`/products?${category ? `category=${category}&` : ''}minPrice=${range.min}${range.max ? `&maxPrice=${range.max}` : ''}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {range.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl">
                {activeCategory?.name || activeOccasion?.name || 'All Flowers'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {filtered.length} arrangement{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <SortSelect defaultValue={sort || ''} />
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No flowers found matching your criteria.
              </p>
              <Link
                href="/products"
                className="text-primary font-medium mt-4 inline-block hover:underline"
              >
                View all flowers
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/products?${new URLSearchParams({
                    ...(category ? { category } : {}),
                    ...(occasion ? { occasion } : {}),
                    ...(sort ? { sort } : {}),
                    page: p.toString(),
                  }).toString()}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? 'bg-primary text-white'
                      : 'border border-input hover:bg-muted'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
