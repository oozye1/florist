'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { SEED_PRODUCTS } from '@/lib/seed-data'
import type { Product } from '@/types'

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>(SEED_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Load products from Firestore on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const { getAllProducts } = await import('@/lib/firebase/services/products')
        const products = await getAllProducts()
        if (products.length > 0) setAllProducts(products)
      } catch {
        // fallback to seed data
      }
    }
    loadProducts()
  }, [])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setResults([])
      setSelectedIndex(-1)
    }
  }, [open])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Search through products
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value)
      setSelectedIndex(-1)

      if (!value.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      const q = value.toLowerCase()
      const matches = allProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q) ||
            p.flowerTypes.some((f) => f.toLowerCase().includes(q)) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        )
        .slice(0, 8)

      setResults(matches)
      setLoading(false)
    },
    [allProducts]
  )

  const navigateToProduct = (slug: string) => {
    onClose()
    router.push(`/products/${slug}`)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault()
      navigateToProduct(results[selectedIndex].slug)
    }
  }

  // Close on Escape key globally
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative mx-auto max-w-2xl mt-[10vh] px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for flowers, bouquets, occasions..."
              className="flex-1 py-4 text-base outline-none placeholder:text-gray-400"
            />
            {query && (
              <button
                onClick={() => handleSearch('')}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5"
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-sm">No products found for &ldquo;{query}&rdquo;</p>
                <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <ul className="py-2">
                {results.map((product, idx) => {
                  const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0]
                  return (
                    <li key={product.id}>
                      <button
                        onClick={() => navigateToProduct(product.slug)}
                        className={`w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-gray-50 transition-colors ${
                          idx === selectedIndex ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {primaryImage && (
                            <Image
                              src={primaryImage.url}
                              alt={primaryImage.alt}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">{product.categoryName}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-900 flex-shrink-0">
                          {formatPrice(product.price)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {!query && (
              <div className="py-8 text-center">
                <p className="text-gray-400 text-sm">Start typing to search products...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
