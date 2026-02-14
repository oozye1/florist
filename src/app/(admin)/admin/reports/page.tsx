'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  PoundSterling,
  ShoppingBag,
  Calendar,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import { getAllOrders } from '@/lib/firebase/services/orders'
import { getAllProducts } from '@/lib/firebase/services/products'
import { getAllUsers } from '@/lib/firebase/services/users'
import {
  computePeriodComparison,
  computeRevenueByPeriod,
  computeOrdersByStatus,
  computeTopProducts,
  computeCategoryPerformance,
  computeCustomerGrowth,
  computeAOVTrend,
  exportOrdersToCSV,
  downloadCSV,
  type PeriodKey,
  type Granularity,
} from '@/lib/admin-utils'
import type { Order, Product, UserProfile } from '@/types'

// --------------------------------------------------
// Constants
// --------------------------------------------------

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7days', label: '7 Days' },
  { key: '30days', label: '30 Days' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'Year' },
]

const GRANULARITY_OPTIONS: { key: Granularity; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
]

const CHART_TYPE_OPTIONS: { key: RevenueChartType; label: string }[] = [
  { key: 'area', label: 'Area' },
  { key: 'bar', label: 'Bar' },
  { key: 'line', label: 'Line' },
]

type RevenueChartType = 'area' | 'bar' | 'line'

const PRIMARY_GREEN = '#1a472a'
const LIGHT_GREEN = '#2d6a4f'

const TOOLTIP_STYLE = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [period, setPeriod] = useState<PeriodKey>('30days')
  const [granularity, setGranularity] = useState<Granularity>('daily')
  const [revenueChartType, setRevenueChartType] = useState<RevenueChartType>('area')

  const { data: orders, loading: ordersLoading } = useFirestoreQuery<Order[]>(() => getAllOrders(), [])
  const { data: products, loading: productsLoading } = useFirestoreQuery<Product[]>(() => getAllProducts(), [])
  const { data: users, loading: usersLoading } = useFirestoreQuery<UserProfile[]>(() => getAllUsers(), [])

  useEffect(() => { setMounted(true) }, [])

  const loading = ordersLoading || productsLoading || usersLoading
  const allOrders = orders || []
  const allProducts = products || []
  const allUsers = users || []

  // --------------------------------------------------
  // KPI computations
  // --------------------------------------------------

  const revenueComp = useMemo(
    () => computePeriodComparison(allOrders, period, 'revenue'),
    [allOrders, period]
  )
  const ordersComp = useMemo(
    () => computePeriodComparison(allOrders, period, 'count'),
    [allOrders, period]
  )

  const customersCurrentPeriod = allUsers.length
  const avgOrderValue = ordersComp.current > 0 ? revenueComp.current / ordersComp.current : 0
  const prevAOV = ordersComp.previous > 0 ? revenueComp.previous / ordersComp.previous : 0
  const aovChange = prevAOV > 0 ? ((avgOrderValue - prevAOV) / prevAOV) * 100 : avgOrderValue > 0 ? 100 : 0

  const statCards = [
    {
      title: 'Revenue',
      value: formatPrice(revenueComp.current),
      change: revenueComp.changePercent,
      icon: PoundSterling,
      bgIcon: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Orders',
      value: ordersComp.current.toLocaleString(),
      change: ordersComp.changePercent,
      icon: ShoppingBag,
      bgIcon: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Customers',
      value: customersCurrentPeriod.toLocaleString(),
      change: 0,
      icon: Users,
      bgIcon: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Avg Order Value',
      value: formatPrice(avgOrderValue),
      change: aovChange,
      icon: Calendar,
      bgIcon: 'bg-orange-50 text-orange-600',
    },
  ]

  // --------------------------------------------------
  // Chart data
  // --------------------------------------------------

  const revenueChart = useMemo(
    () => computeRevenueByPeriod(allOrders, granularity, period),
    [allOrders, granularity, period]
  )
  const statusBreakdown = useMemo(
    () => computeOrdersByStatus(allOrders),
    [allOrders]
  )
  const categoryPerformance = useMemo(
    () => computeCategoryPerformance(allOrders, allProducts),
    [allOrders, allProducts]
  )
  const topProducts = useMemo(
    () => computeTopProducts(allOrders, allProducts, 10),
    [allOrders, allProducts]
  )
  const customerGrowth = useMemo(
    () => computeCustomerGrowth(allUsers, granularity, period),
    [allUsers, granularity, period]
  )
  const aovTrend = useMemo(
    () => computeAOVTrend(allOrders, granularity, period),
    [allOrders, granularity, period]
  )

  // --------------------------------------------------
  // CSV export
  // --------------------------------------------------

  function handleExportCSV() {
    if (allOrders.length === 0) {
      toast.error('No orders to export')
      return
    }
    try {
      const csv = exportOrdersToCSV(allOrders)
      downloadCSV(csv, `orders-report-${period}.csv`)
      toast.success('CSV exported successfully')
    } catch {
      toast.error('Failed to export CSV')
    }
  }

  // --------------------------------------------------
  // Loading skeleton
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-7 bg-gray-200 rounded w-56 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-80 mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
          <div className="h-[350px] bg-gray-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
              <div className="h-[280px] bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-8">
      {/* Header row: title + controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports &amp; Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Deep-dive into store performance, revenue trends, and customer insights.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Period selector + Granularity toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Period selector */}
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

          {/* Granularity toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            {GRANULARITY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setGranularity(opt.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  granularity === opt.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
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
              <div className="flex items-center gap-1 mt-2">
                {card.change !== 0 ? (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(card.change).toFixed(1)}% vs previous period
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No comparison data</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart 1: Revenue over time (full width) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Over Time</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {granularity.charAt(0).toUpperCase() + granularity.slice(1)} revenue breakdown
              </p>
            </div>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            {CHART_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setRevenueChartType(opt.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  revenueChartType === opt.key
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[350px]">
          {mounted && revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {revenueChartType === 'area' ? (
                <AreaChart data={revenueChart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY_GREEN} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={PRIMARY_GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `\u00A3${(v / 1000).toFixed(0)}k` : `\u00A3${v}`
                    }
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [formatPrice(value as number), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={PRIMARY_GREEN}
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              ) : revenueChartType === 'bar' ? (
                <BarChart data={revenueChart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `\u00A3${(v / 1000).toFixed(0)}k` : `\u00A3${v}`
                    }
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [formatPrice(value as number), 'Revenue']}
                  />
                  <Bar dataKey="value" fill={PRIMARY_GREEN} radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              ) : (
                <LineChart data={revenueChart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `\u00A3${(v / 1000).toFixed(0)}k` : `\u00A3${v}`
                    }
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [formatPrice(value as number), 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={PRIMARY_GREEN}
                    strokeWidth={3}
                    dot={{ fill: PRIMARY_GREEN, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No revenue data for this period
            </div>
          )}
        </div>
      </div>

      {/* Chart 2 + Chart 3: Orders by status & Category performance (half width each) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Orders by status (donut) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Orders by Status</h2>
          </div>
          <div className="h-[280px]">
            {mounted && statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="label"
                  >
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value, name) => [`${value} orders`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No orders yet
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </div>
        </div>

        {/* Chart 3: Category performance (horizontal bar) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Category Performance</h2>
          </div>
          <div className="h-[280px]">
            {mounted && categoryPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryPerformance}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `\u00A3${(v / 1000).toFixed(0)}k` : `\u00A3${v}`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [formatPrice(value as number), 'Revenue']}
                  />
                  <Bar
                    dataKey="revenue"
                    fill={LIGHT_GREEN}
                    radius={[0, 6, 6, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart 4: Top products table (full width) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Best performing products by revenue (top 10)
          </p>
        </div>
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.map((product, idx) => (
                  <tr
                    key={product.productId}
                    className={`hover:bg-gray-50 transition-colors ${
                      idx % 2 === 1 ? 'bg-gray-50/50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.productImage && (
                          <div className="h-9 w-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={product.productImage}
                              alt={product.productName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{product.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {product.unitsSold.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatPrice(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            No sales data available yet.
          </div>
        )}
      </div>

      {/* Chart 5 + Chart 6: Customer growth & AOV trend (half width each) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 5: Customer growth */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Customer Growth</h2>
          </div>
          <div className="h-[280px]">
            {mounted && customerGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerGrowth} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [`${value} customers`, 'Total']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    dot={{ fill: '#7c3aed', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No customer data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 6: AOV trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PoundSterling className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Average Order Value Trend</h2>
          </div>
          <div className="h-[280px]">
            {mounted && aovTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aovTrend} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `\u00A3${v}`}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [formatPrice(value as number), 'AOV']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ea580c"
                    strokeWidth={2.5}
                    dot={{ fill: '#ea580c', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No AOV data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
