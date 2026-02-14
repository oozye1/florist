'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Calendar,
  Eye,
  ChevronRight,
  ChevronLeft,
  Package,
  Download,
  ShoppingBag,
  PoundSterling,
  Clock,
  CalendarDays,
  Filter,
} from 'lucide-react'
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import { getAllOrders } from '@/lib/firebase/services/orders'
import { safeTimestamp, relativeTime, exportOrdersToCSV, downloadCSV } from '@/lib/admin-utils'
import { Button } from '@/components/ui/button'
import type { Order, OrderStatus, PaymentStatus } from '@/types'

// --------------------------------------------------
// Constants
// --------------------------------------------------

const STATUS_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

const ITEMS_PER_PAGE = 20

// --------------------------------------------------
// Loading skeleton
// --------------------------------------------------

function OrdersTableSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary bar skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-2 p-4 border-b border-gray-200">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-9 w-20 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="p-4 flex gap-3">
          <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
          <div className="h-10 w-40 bg-gray-200 rounded-lg" />
          <div className="h-10 w-40 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {Array.from({ length: 8 }).map((_, i) => (
                  <th key={i} className="px-6 py-3.5">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-100 rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminOrdersPage() {
  const { data: orders, loading, error } = useFirestoreQuery<Order[]>(() => getAllOrders())
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Compute summary stats
  const summaryStats = useMemo(() => {
    if (!orders) return { total: 0, revenue: 0, pending: 0, today: 0 }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const revenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0)

    const pending = orders.filter((o) => o.status === 'pending').length

    const today = orders.filter((o) => {
      const d = safeTimestamp(o.createdAt)
      return d >= todayStart
    }).length

    return { total: orders.length, revenue, pending, today }
  }, [orders])

  // Count by status for tab badges
  const statusCounts = useMemo(() => {
    if (!orders) return {} as Record<string, number>
    const counts: Record<string, number> = { all: orders.length }
    for (const order of orders) {
      counts[order.status] = (counts[order.status] || 0) + 1
    }
    return counts
  }, [orders])

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!orders) return []

    return orders.filter((order) => {
      // Status tab
      if (activeTab !== 'all' && order.status !== activeTab) return false

      // Search
      if (search) {
        const q = search.toLowerCase()
        if (
          !order.orderNumber.toLowerCase().includes(q) &&
          !order.billingName.toLowerCase().includes(q)
        ) {
          return false
        }
      }

      // Payment status
      if (paymentFilter !== 'all' && order.paymentStatus !== paymentFilter) return false

      // Date range
      if (dateFrom) {
        const orderDate = safeTimestamp(order.createdAt)
        const fromDate = new Date(dateFrom)
        if (orderDate < fromDate) return false
      }
      if (dateTo) {
        const orderDate = safeTimestamp(order.createdAt)
        const toDate = new Date(dateTo + 'T23:59:59')
        if (orderDate > toDate) return false
      }

      return true
    })
  }, [orders, activeTab, search, paymentFilter, dateFrom, dateTo])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE))
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredOrders, currentPage])

  // Reset page when filters change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handlePaymentFilterChange = (value: string) => {
    setPaymentFilter(value)
    setCurrentPage(1)
  }

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    setCurrentPage(1)
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    const csv = exportOrdersToCSV(filteredOrders)
    downloadCSV(csv, 'orders-export.csv')
  }

  // Loading state
  if (loading) {
    return <OrdersTableSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all customer orders</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-12 text-center shadow-sm">
          <p className="text-red-600 font-medium">Failed to load orders</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summaryStats.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
              <PoundSterling className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(summaryStats.revenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Pending Orders</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-yellow-50 text-yellow-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summaryStats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Today&apos;s Orders</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summaryStats.today}</p>
        </div>
      </div>

      {/* Status filter tabs + search filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {STATUS_TABS.map((tab) => {
            const count = statusCounts[tab.key] || 0
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold',
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Filters row */}
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order # or customer name..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Date from */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="From"
            />
          </div>

          {/* Date to */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="To"
            />
          </div>

          {/* Payment status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={paymentFilter}
              onChange={(e) => handlePaymentFilterChange(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none bg-white"
            >
              <option value="all">All Payments</option>
              {Object.entries(PAYMENT_STATUSES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Payment
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.map((order) => {
                const statusInfo = ORDER_STATUSES[order.status]
                const paymentInfo = PAYMENT_STATUSES[order.paymentStatus]
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-gray-900 hover:text-primary transition-colors"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{order.billingName}</td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                      {order.billingEmail}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {relativeTime(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Package className="h-3.5 w-3.5 text-gray-400" />
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          paymentInfo?.color
                        )}
                      >
                        {paymentInfo?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          statusInfo?.color
                        )}
                      >
                        {statusInfo?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}

              {/* Empty state */}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">No orders found</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          {search || dateFrom || dateTo || paymentFilter !== 'all' || activeTab !== 'all'
                            ? 'Try adjusting your filters or search term.'
                            : 'Orders will appear here once customers start placing them.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of{' '}
              {filteredOrders.length} orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, and pages around current
                    if (page === 1 || page === totalPages) return true
                    if (Math.abs(page - currentPage) <= 1) return true
                    return false
                  })
                  .reduce<(number | string)[]>((acc, page, idx, arr) => {
                    if (idx > 0) {
                      const prevPage = arr[idx - 1]
                      if (typeof prevPage === 'number' && page - prevPage > 1) {
                        acc.push('...')
                      }
                    }
                    acc.push(page)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    typeof item === 'string' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-sm text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={cn(
                          'h-8 min-w-[32px] px-2 rounded text-sm font-medium transition-colors',
                          currentPage === item
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
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
