'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import { getAllProducts, deleteProduct, updateProduct } from '@/lib/firebase/services/products'
import { formatPrice, cn } from '@/lib/utils'
import { safeTimestamp, relativeTime } from '@/lib/admin-utils'
import { CATEGORIES } from '@/lib/constants'
import type { Product, CategorySlug } from '@/types'

// ============================================
// Constants
// ============================================

const ITEMS_PER_PAGE = 20

type SortField = 'name' | 'price' | 'stock' | 'created'
type SortDirection = 'asc' | 'desc'
type StockFilter = 'all' | 'in_stock' | 'out_of_stock' | 'low_stock'

// ============================================
// Component
// ============================================

export default function AdminProductsPage() {
  const { data: products, loading, refetch } = useFirestoreQuery<Product[]>(
    () => getAllProducts()
  )

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  // ============================================
  // Filtering, Sorting, Pagination
  // ============================================

  const filteredProducts = useMemo(() => {
    if (!products) return []

    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
      const stock = product.stockQuantity ?? 0
      let matchesStock = true
      if (stockFilter === 'in_stock') matchesStock = stock > 20
      else if (stockFilter === 'out_of_stock') matchesStock = stock <= 0
      else if (stockFilter === 'low_stock') matchesStock = stock > 0 && stock <= 20

      return matchesSearch && matchesCategory && matchesStock
    })
  }, [products, search, categoryFilter, stockFilter])

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]
    sorted.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'stock':
          comparison = (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0)
          break
        case 'created': {
          const aTime = safeTimestamp(a.createdAt).getTime()
          const bTime = safeTimestamp(b.createdAt).getTime()
          comparison = aTime - bTime
          break
        }
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [filteredProducts, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE))
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // ============================================
  // Handlers
  // ============================================

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }
    try {
      await deleteProduct(productId)
      toast.success('Product deleted successfully')
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
      refetch()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProducts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedProducts.map((p) => p.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.size === 0) return

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} product(s)? This action cannot be undone.`)) {
        return
      }
    }

    setBulkLoading(true)
    try {
      const promises = Array.from(selectedIds).map((id) => {
        if (action === 'delete') return deleteProduct(id)
        return updateProduct(id, { isActive: action === 'activate' })
      })
      await Promise.all(promises)

      const label =
        action === 'delete'
          ? 'deleted'
          : action === 'activate'
            ? 'activated'
            : 'deactivated'
      toast.success(`${selectedIds.size} product(s) ${label} successfully`)
      setSelectedIds(new Set())
      refetch()
    } catch {
      toast.error(`Failed to ${action} products`)
    } finally {
      setBulkLoading(false)
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-0 group-hover:opacity-30" />
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    )
  }

  const getStockColor = (quantity: number) => {
    if (quantity <= 0) return 'text-red-600 bg-red-50'
    if (quantity <= 20) return 'text-amber-600 bg-amber-50'
    return 'text-green-600 bg-green-50'
  }

  // ============================================
  // Loading skeleton
  // ============================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-56 bg-gray-100 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="h-10 flex-1 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-10 w-40 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-10 w-40 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-10 w-10 bg-gray-100 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-12 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // Empty state
  // ============================================

  if (!products || products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your product catalogue</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">No products yet</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
              Get started by adding your first product to the catalogue.
            </p>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add your first product
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product catalogue ({products.length} product{products.length !== 1 ? 's' : ''})
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as StockFilter)
              setCurrentPage(1)
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock (&gt;20)</option>
            <option value="low_stock">Low Stock (1-20)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              isLoading={bulkLoading}
              onClick={() => handleBulkAction('activate')}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={bulkLoading}
              onClick={() => handleBulkAction('deactivate')}
            >
              <XCircle className="h-3.5 w-3.5" />
              Deactivate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={bulkLoading}
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="group inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Product
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('price')}
                    className="group inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Price
                    <SortIcon field="price" />
                  </button>
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('stock')}
                    className="group inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Stock
                    <SortIcon field="stock" />
                  </button>
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('created')}
                    className="group inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Created
                    <SortIcon field="created" />
                  </button>
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.map((product) => {
                const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0]
                const stock = product.stockQuantity ?? 0
                return (
                  <tr
                    key={product.id}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      selectedIds.has(product.id) && 'bg-primary/5'
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {primaryImage?.url ? (
                            <Image
                              src={primaryImage.url}
                              alt={primaryImage.alt || product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            /{product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {product.categoryName}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-900">{formatPrice(product.price)}</span>
                        {product.compareAtPrice && (
                          <span className="ml-1.5 text-xs text-muted-foreground line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                          getStockColor(stock)
                        )}
                      >
                        {stock <= 0 && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {stock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {product.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 w-fit">
                            Inactive
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-fit">
                            <Star className="h-3 w-3 fill-yellow-500" />
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-muted-foreground">
                        {relativeTime(product.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <p className="text-muted-foreground text-sm">
                      No products found matching your criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              {' '}-{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length)}
              {' '}of {sortedProducts.length} products
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true
                    if (page === 1 || page === totalPages) return true
                    if (Math.abs(page - currentPage) <= 1) return true
                    return false
                  })
                  .reduce<(number | 'dots')[]>((acc, page, i, arr) => {
                    if (i > 0 && page - (arr[i - 1] as number) > 1) {
                      acc.push('dots')
                    }
                    acc.push(page)
                    return acc
                  }, [])
                  .map((item, i) =>
                    item === 'dots' ? (
                      <span key={`dots-${i}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={cn(
                          'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
                          currentPage === item
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
