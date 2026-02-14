'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  PoundSterling,
  Eye,
  AlertTriangle,
  Crown,
  ArrowUpRight,
  Plus,
  Ticket,
  FileText,
  Package,
  Star,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import { getAllOrders } from '@/lib/firebase/services/orders'
import { getAllProducts } from '@/lib/firebase/services/products'
import { getAllUsers } from '@/lib/firebase/services/users'
import { getPendingReviews } from '@/lib/firebase/services/reviews'
import {
  computePeriodComparison,
  computeRevenueByPeriod,
  computeOrdersByStatus,
  computeTopProducts,
  computeLowStockProducts,
  safeTimestamp,
  relativeTime,
  type PeriodKey,
  type Granularity,
} from '@/lib/admin-utils'
import type { Order, Product, UserProfile, Review } from '@/types'

const PERIOD_OPTIONS: { key: PeriodKey; label: string; granularity: Granularity }[] = [
  { key: 'today', label: 'Today', granularity: 'daily' },
  { key: '7days', label: '7 Days', granularity: 'daily' },
  { key: '30days', label: '30 Days', granularity: 'daily' },
  { key: 'month', label: 'This Month', granularity: 'daily' },
  { key: 'year', label: 'Year', granularity: 'monthly' },
]

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [period, setPeriod] = useState<PeriodKey>('30days')
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')

  const { data: orders, loading: ordersLoading } = useFirestoreQuery<Order[]>(() => getAllOrders(), [])
  const { data: products, loading: productsLoading } = useFirestoreQuery<Product[]>(() => getAllProducts(), [])
  const { data: users, loading: usersLoading } = useFirestoreQuery<UserProfile[]>(() => getAllUsers(), [])
  const { data: pendingReviews } = useFirestoreQuery<Review[]>(() => getPendingReviews(), [])

  useEffect(() => { setMounted(true) }, [])

  const loading = ordersLoading || productsLoading || usersLoading
  const allOrders = orders || []
  const allProducts = products || []
  const allUsers = users || []

  // Computations
  const granularity = PERIOD_OPTIONS.find((p) => p.key === period)?.granularity || 'daily'
  const revenueComp = computePeriodComparison(allOrders, period, 'revenue')
  const ordersComp = computePeriodComparison(allOrders, period, 'count')
  const pendingCount = allOrders.filter((o) => o.status === 'pending').length
  const newUsersThisPeriod = computePeriodComparison(
    allOrders, period, 'count' // We'll compute users separately below
  )
  const avgOrderValue = ordersComp.current > 0 ? revenueComp.current / ordersComp.current : 0
  const prevAOV = newUsersThisPeriod.previous > 0 ? revenueComp.previous / newUsersThisPeriod.previous : 0
  const aovChange = prevAOV > 0 ? ((avgOrderValue - prevAOV) / prevAOV) * 100 : avgOrderValue > 0 ? 100 : 0

  const revenueChart = computeRevenueByPeriod(allOrders, granularity, period)
  const statusBreakdown = computeOrdersByStatus(allOrders)
  const topProducts = computeTopProducts(allOrders, allProducts, 5)
  const lowStock = computeLowStockProducts(allProducts, 20)
  const recentOrders = [...allOrders]
    .sort((a, b) => safeTimestamp(b.createdAt).getTime() - safeTimestamp(a.createdAt).getTime())
    .slice(0, 8)

  // Activity timeline (recent orders + reviews merged)
  const activityItems = [
    ...allOrders.slice(0, 20).map((o) => ({
      type: 'order' as const,
      label: `Order ${o.orderNumber}`,
      detail: `${o.billingName} — ${formatPrice(o.total)}`,
      time: safeTimestamp(o.createdAt),
      href: `/admin/orders/${o.id}`,
    })),
    ...(pendingReviews || []).slice(0, 10).map((r) => ({
      type: 'review' as const,
      label: `New review`,
      detail: `${r.userName} rated ${r.productName} ${r.rating}/5`,
      time: safeTimestamp(r.createdAt),
      href: '/admin/reviews',
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 8)

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(revenueComp.current),
      change: revenueComp.changePercent,
      icon: PoundSterling,
      bgIcon: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Orders',
      value: ordersComp.current.toString(),
      change: ordersComp.changePercent,
      subtitle: `${pendingCount} pending`,
      icon: ShoppingBag,
      bgIcon: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Customers',
      value: allUsers.length.toLocaleString(),
      change: 0,
      subtitle: `${allUsers.length} total`,
      icon: Users,
      bgIcon: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Avg Order Value',
      value: formatPrice(avgOrderValue),
      change: aovChange,
      icon: TrendingUp,
      bgIcon: 'bg-orange-50 text-orange-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page heading + period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                period === opt.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map((card) => {
            const Icon = card.icon
            const isPositive = card.change >= 0
            return (
              <div
                key={card.title}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.bgIcon}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <div className="flex items-center gap-2 mt-2">
                  {card.change !== 0 && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(card.change).toFixed(1)}%
                    </span>
                  )}
                  {card.subtitle && (
                    <span className="text-xs text-muted-foreground">{card.subtitle}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Revenue chart + Orders by status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {granularity.charAt(0).toUpperCase() + granularity.slice(1)} revenue breakdown
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    chartType === 'area' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Area
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    chartType === 'bar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Bar
                </button>
              </div>
              {revenueComp.changePercent !== 0 && (
                <span className={`flex items-center gap-0.5 text-sm font-medium ${revenueComp.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueComp.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(revenueComp.changePercent).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="h-[300px]">
            {mounted && revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={revenueChart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a472a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1a472a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false}
                      tickFormatter={(v: number) => v >= 1000 ? `£${(v / 1000).toFixed(0)}k` : `£${v}`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [formatPrice(value as number), 'Revenue']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#1a472a" strokeWidth={2} fill="url(#revenueGrad)" />
                  </AreaChart>
                ) : (
                  <BarChart data={revenueChart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false}
                      tickFormatter={(v: number) => v >= 1000 ? `£${(v / 1000).toFixed(0)}k` : `£${v}`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [formatPrice(value as number), 'Revenue']}
                    />
                    <Bar dataKey="value" fill="#1a472a" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                {loading ? 'Loading chart...' : 'No revenue data for this period'}
              </div>
            )}
          </div>
        </div>

        {/* Orders by status donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Orders by Status</h2>
          <div className="h-[220px]">
            {mounted && statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="label"
                  >
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                {loading ? 'Loading...' : 'No orders yet'}
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </div>
        </div>
      </div>

      {/* Recent orders + Low stock & Quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => {
                    const status = ORDER_STATUSES[order.status]
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-gray-700">{order.billingName}</td>
                        <td className="px-6 py-4 text-gray-500">{relativeTime(order.createdAt)}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status?.color}`}>
                            {status?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              {loading ? 'Loading orders...' : 'No orders yet. They\'ll appear here once customers start ordering.'}
            </div>
          )}
        </div>

        {/* Low stock + Quick actions */}
        <div className="space-y-6">
          {/* Low stock alerts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">Low Stock</h2>
              {lowStock.length > 0 && (
                <span className="ml-auto text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {lowStock.length}
                </span>
              )}
            </div>
            {lowStock.length > 0 ? (
              <div className="space-y-3">
                {lowStock.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      {product.stockQuantity ?? 0} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All products are well stocked.</p>
            )}
            <Link
              href="/admin/products"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Manage inventory
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Product', href: '/admin/products/new', icon: Plus, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
                { label: 'View Orders', href: '/admin/orders', icon: Package, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
                { label: 'New Coupon', href: '/admin/coupons', icon: Ticket, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
                { label: 'New Blog Post', href: '/admin/blog/new', icon: FileText, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${action.color}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top products + Activity timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top products */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Top Products by Revenue</h2>
          </div>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div key={product.productId} className="flex items-center gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {product.productImage && (
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={product.productImage} alt={product.productName} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.productName}</p>
                    <p className="text-xs text-muted-foreground">{product.category} &middot; {product.unitsSold} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(product.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sales data available yet.</p>
          )}
        </div>

        {/* Activity timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          {activityItems.length > 0 ? (
            <div className="space-y-4">
              {activityItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`flex-shrink-0 mt-0.5 h-8 w-8 rounded-full flex items-center justify-center ${
                    item.type === 'order' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    {item.type === 'order' ? <Package className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{relativeTime(item.time)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  )
}
