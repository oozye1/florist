'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  ShoppingBag,
  Users,
  PoundSterling,
  Eye,
  AlertTriangle,
  Crown,
  ArrowUpRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'

// --------------------------------------------------
// Hardcoded data
// --------------------------------------------------

const STAT_CARDS = [
  {
    title: 'Total Revenue',
    value: '£12,456.00',
    icon: PoundSterling,
    change: '+12.5% from last month',
    changeColor: 'text-green-600',
    bgIcon: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Orders',
    value: '156',
    icon: ShoppingBag,
    change: '23 pending',
    changeColor: 'text-yellow-600',
    bgIcon: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Customers',
    value: '1,247',
    icon: Users,
    change: '+48 this week',
    changeColor: 'text-green-600',
    bgIcon: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'Avg Order Value',
    value: '£79.85',
    icon: TrendingUp,
    change: '+3.2% from last month',
    changeColor: 'text-green-600',
    bgIcon: 'bg-orange-50 text-orange-600',
  },
]

const MONTHLY_REVENUE = [
  { month: 'Sep', revenue: 8200 },
  { month: 'Oct', revenue: 9100 },
  { month: 'Nov', revenue: 10800 },
  { month: 'Dec', revenue: 14500 },
  { month: 'Jan', revenue: 11200 },
  { month: 'Feb', revenue: 12456 },
]

const RECENT_ORDERS = [
  {
    id: 'ord-001',
    orderNumber: 'LB-20260214-001',
    customer: 'Emily Thompson',
    date: '2026-02-14',
    total: 89.99,
    status: 'confirmed',
  },
  {
    id: 'ord-002',
    orderNumber: 'LB-20260214-002',
    customer: 'James Wilson',
    date: '2026-02-14',
    total: 154.98,
    status: 'preparing',
  },
  {
    id: 'ord-003',
    orderNumber: 'LB-20260213-015',
    customer: 'Sarah Mitchell',
    date: '2026-02-13',
    total: 249.99,
    status: 'delivered',
  },
  {
    id: 'ord-004',
    orderNumber: 'LB-20260213-012',
    customer: 'David Clarke',
    date: '2026-02-13',
    total: 64.99,
    status: 'pending',
  },
  {
    id: 'ord-005',
    orderNumber: 'LB-20260212-008',
    customer: 'Olivia Brown',
    date: '2026-02-12',
    total: 129.99,
    status: 'confirmed',
  },
]

const LOW_STOCK = [
  { name: 'The Grand Gesture', stock: 10, category: 'Luxury' },
  { name: 'Peony Paradise', stock: 12, category: 'Luxury' },
  { name: 'Tropical Paradise', stock: 15, category: 'Luxury' },
]

const TOP_SELLING = [
  { name: 'Velvet Red Romance', sales: 127, revenue: 11429.73 },
  { name: 'Letterbox Sunshine', sales: 112, revenue: 3358.88 },
  { name: 'Spring Awakening', sales: 94, revenue: 5169.06 },
  { name: 'Blush Pink Elegance', sales: 89, revenue: 6674.11 },
  { name: 'Pastel Dreams', sales: 81, revenue: 5264.19 },
]

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminDashboardPage() {
  const [chartMounted, setChartMounted] = useState(false)

  // Ensure recharts renders only on client
  if (!chartMounted) {
    // Use a zero-timeout to push past SSR
    setTimeout(() => setChartMounted(true), 0)
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stat cards */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
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
              <p className={`text-xs mt-2 font-medium ${card.changeColor}`}>{card.change}</p>
            </div>
          )
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Revenue chart + Top selling */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Monthly revenue for the last 6 months</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              +12.5%
            </div>
          </div>

          <div className="h-[300px]">
            {chartMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 13, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value) => [formatPrice(value as number), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#e84393" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Loading chart...
              </div>
            )}
          </div>
        </div>

        {/* Top selling products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Top Selling</h2>
          </div>
          <div className="space-y-4">
            {TOP_SELLING.map((product, idx) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(product.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Recent orders + Low stock */}
      {/* ------------------------------------------------------------------ */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {RECENT_ORDERS.map((order) => {
                  const status = ORDER_STATUSES[order.status]
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                      <td className="px-6 py-4 text-gray-500">{order.date}</td>
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
        </div>

        {/* Low stock alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
          </div>
          <div className="space-y-4">
            {LOW_STOCK.map((product) => (
              <div
                key={product.name}
                className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/products"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Manage inventory
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
