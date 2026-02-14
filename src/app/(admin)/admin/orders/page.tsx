'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Calendar,
  Eye,
  ChevronRight,
  Package,
} from 'lucide-react'
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/constants'
import { formatPrice, formatDate } from '@/lib/utils'

// --------------------------------------------------
// Sample orders
// --------------------------------------------------

interface SampleOrder {
  id: string
  orderNumber: string
  customer: string
  items: number
  total: number
  deliveryDate: string
  status: string
  payment: string
  createdAt: string
}

const SAMPLE_ORDERS: SampleOrder[] = [
  {
    id: 'ord-001',
    orderNumber: 'LB-20260214-001',
    customer: 'Emily Thompson',
    items: 2,
    total: 154.98,
    deliveryDate: '2026-02-14',
    status: 'confirmed',
    payment: 'paid',
    createdAt: '2026-02-14',
  },
  {
    id: 'ord-002',
    orderNumber: 'LB-20260214-002',
    customer: 'James Wilson',
    items: 1,
    total: 89.99,
    deliveryDate: '2026-02-14',
    status: 'preparing',
    payment: 'paid',
    createdAt: '2026-02-14',
  },
  {
    id: 'ord-003',
    orderNumber: 'LB-20260213-015',
    customer: 'Sarah Mitchell',
    items: 3,
    total: 249.99,
    deliveryDate: '2026-02-14',
    status: 'out_for_delivery',
    payment: 'paid',
    createdAt: '2026-02-13',
  },
  {
    id: 'ord-004',
    orderNumber: 'LB-20260213-012',
    customer: 'David Clarke',
    items: 1,
    total: 64.99,
    deliveryDate: '2026-02-15',
    status: 'pending',
    payment: 'unpaid',
    createdAt: '2026-02-13',
  },
  {
    id: 'ord-005',
    orderNumber: 'LB-20260212-008',
    customer: 'Olivia Brown',
    items: 2,
    total: 129.99,
    deliveryDate: '2026-02-13',
    status: 'delivered',
    payment: 'paid',
    createdAt: '2026-02-12',
  },
  {
    id: 'ord-006',
    orderNumber: 'LB-20260211-004',
    customer: 'William Taylor',
    items: 1,
    total: 249.99,
    deliveryDate: '2026-02-12',
    status: 'delivered',
    payment: 'paid',
    createdAt: '2026-02-11',
  },
  {
    id: 'ord-007',
    orderNumber: 'LB-20260211-003',
    customer: 'Charlotte Davis',
    items: 4,
    total: 197.96,
    deliveryDate: '2026-02-12',
    status: 'cancelled',
    payment: 'refunded',
    createdAt: '2026-02-11',
  },
  {
    id: 'ord-008',
    orderNumber: 'LB-20260210-011',
    customer: 'George Evans',
    items: 1,
    total: 54.99,
    deliveryDate: '2026-02-11',
    status: 'delivered',
    payment: 'paid',
    createdAt: '2026-02-10',
  },
  {
    id: 'ord-009',
    orderNumber: 'LB-20260210-007',
    customer: 'Amelia White',
    items: 2,
    total: 144.98,
    deliveryDate: '2026-02-14',
    status: 'confirmed',
    payment: 'paid',
    createdAt: '2026-02-10',
  },
  {
    id: 'ord-010',
    orderNumber: 'LB-20260209-002',
    customer: 'Henry Johnson',
    items: 1,
    total: 79.99,
    deliveryDate: '2026-02-14',
    status: 'preparing',
    payment: 'paid',
    createdAt: '2026-02-09',
  },
]

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filteredOrders = useMemo(() => {
    return SAMPLE_ORDERS.filter((order) => {
      // Status tab
      if (activeTab !== 'all' && order.status !== activeTab) return false
      // Search
      if (
        search &&
        !order.orderNumber.toLowerCase().includes(search.toLowerCase()) &&
        !order.customer.toLowerCase().includes(search.toLowerCase())
      )
        return false
      // Date range
      if (dateFrom && order.createdAt < dateFrom) return false
      if (dateTo && order.createdAt > dateTo) return false
      return true
    })
  }, [activeTab, search, dateFrom, dateTo])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and track all customer orders
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {STATUS_TABS.map((tab) => {
            const count = tab.key === 'all'
              ? SAMPLE_ORDERS.length
              : SAMPLE_ORDERS.filter((o) => o.status === tab.key).length
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-500'
                  }`}
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
              placeholder="Search by order # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Date from */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
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
              onChange={(e) => setDateTo(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              placeholder="To"
            />
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
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Delivery Date
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Payment
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const statusInfo = ORDER_STATUSES[order.status]
                const paymentInfo = PAYMENT_STATUSES[order.payment]
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
                    <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Package className="h-3.5 w-3.5 text-gray-400" />
                        {order.items} {order.items === 1 ? 'item' : 'items'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(order.deliveryDate)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}
                      >
                        {statusInfo?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentInfo?.color}`}
                      >
                        {paymentInfo?.label}
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

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <p className="text-muted-foreground text-sm">No orders found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
