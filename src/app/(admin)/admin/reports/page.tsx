'use client'

import { useState } from 'react'
import {
  PoundSterling,
  ShoppingBag,
  TrendingUp,
  Users,
  Crown,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { formatPrice } from '@/lib/utils'

// --------------------------------------------------
// Hardcoded data
// --------------------------------------------------

const STAT_CARDS = [
  {
    title: 'Total Revenue',
    value: '£48,672.00',
    change: '+12.5% from last month',
    changeColor: 'text-green-600',
    icon: PoundSterling,
    bgIcon: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Total Orders',
    value: '624',
    change: '+8.3% from last month',
    changeColor: 'text-green-600',
    icon: ShoppingBag,
    bgIcon: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Avg Order Value',
    value: '£78.00',
    change: '+3.2% from last month',
    changeColor: 'text-green-600',
    icon: TrendingUp,
    bgIcon: 'bg-orange-50 text-orange-600',
  },
  {
    title: 'Total Customers',
    value: '1,247',
    change: '+48 this month',
    changeColor: 'text-green-600',
    icon: Users,
    bgIcon: 'bg-purple-50 text-purple-600',
  },
]

const MONTHLY_REVENUE = [
  { month: 'Mar', revenue: 6200, orders: 78 },
  { month: 'Apr', revenue: 7100, orders: 89 },
  { month: 'May', revenue: 8400, orders: 102 },
  { month: 'Jun', revenue: 7800, orders: 95 },
  { month: 'Jul', revenue: 9200, orders: 112 },
  { month: 'Aug', revenue: 8600, orders: 104 },
  { month: 'Sep', revenue: 8200, orders: 99 },
  { month: 'Oct', revenue: 9100, orders: 110 },
  { month: 'Nov', revenue: 10800, orders: 131 },
  { month: 'Dec', revenue: 14500, orders: 178 },
  { month: 'Jan', revenue: 11200, orders: 136 },
  { month: 'Feb', revenue: 12456, orders: 152 },
]

const TOP_PRODUCTS = [
  { rank: 1, name: 'Velvet Red Romance', category: 'Roses', sales: 127, revenue: 11429.73 },
  { rank: 2, name: 'Letterbox Sunshine', category: 'Letterbox', sales: 112, revenue: 3358.88 },
  { rank: 3, name: 'Spring Awakening', category: 'Mixed Bouquets', sales: 94, revenue: 5169.06 },
  { rank: 4, name: 'Blush Pink Elegance', category: 'Roses', sales: 89, revenue: 6674.11 },
  { rank: 5, name: 'Pastel Dreams', category: 'Mixed Bouquets', sales: 81, revenue: 5264.19 },
]

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminReportsPage() {
  const [chartMounted, setChartMounted] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  // Ensure recharts renders only on client
  if (!chartMounted) {
    setTimeout(() => setChartMounted(true), 0)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports &amp; Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your store performance and key metrics
        </p>
      </div>

      {/* Stat cards */}
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

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Monthly revenue for the last 12 months</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                chartType === 'bar'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                chartType === 'line'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Line Chart
            </button>
          </div>
        </div>

        <div className="h-[350px]">
          {chartMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 13, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
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
              ) : (
                <LineChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 13, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
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
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#e84393"
                    strokeWidth={3}
                    dot={{ fill: '#e84393', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Loading chart...
            </div>
          )}
        </div>
      </div>

      {/* Top products table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Best performing products by sales volume</p>
        </div>
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
                  Sales
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {TOP_PRODUCTS.map((product, idx) => (
                <tr
                  key={product.name}
                  className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center">
                      {product.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {product.sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {formatPrice(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
