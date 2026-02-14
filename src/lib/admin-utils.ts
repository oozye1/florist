import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
  subMonths,
  format,
  isWithinInterval,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  formatDistanceToNow,
} from 'date-fns'
import type { Order, Product, UserProfile } from '@/types'

// ============================================
// CSV Export
// ============================================

export function exportOrdersToCSV(orders: Order[]): string {
  const headers = [
    'Order Number',
    'Date',
    'Customer Name',
    'Customer Email',
    'Items',
    'Subtotal',
    'Delivery Fee',
    'Discount',
    'Total',
    'Payment Status',
    'Order Status',
    'Delivery Type',
    'Delivery Date',
    'Delivery Postcode',
    'Coupon Code',
  ]

  const rows = orders.map((o) => [
    o.orderNumber,
    format(safeTimestamp(o.createdAt), 'yyyy-MM-dd HH:mm'),
    o.billingName,
    o.billingEmail,
    o.items.map((i) => `${i.productName} x${i.quantity}`).join('; '),
    o.subtotal.toFixed(2),
    o.deliveryFee.toFixed(2),
    o.discountAmount.toFixed(2),
    o.total.toFixed(2),
    o.paymentStatus,
    o.status,
    o.deliveryType,
    o.deliveryDate || '',
    o.deliveryAddress?.postcode || '',
    o.couponCode || '',
  ])

  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }

  return [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ].join('\n')
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// ============================================
// Timestamp Helpers
// ============================================

export function safeTimestamp(ts: unknown): Date {
  if (!ts) return new Date(0)
  if (ts instanceof Date) return ts
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate()
  }
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    return new Date((ts as { seconds: number }).seconds * 1000)
  }
  if (typeof ts === 'string') return new Date(ts)
  return new Date(0)
}

export function relativeTime(ts: unknown): string {
  const date = safeTimestamp(ts)
  if (date.getTime() === 0) return 'Unknown'
  return formatDistanceToNow(date, { addSuffix: true })
}

// ============================================
// Period Helpers
// ============================================

export type PeriodKey = 'today' | '7days' | '30days' | 'month' | 'year'
export type Granularity = 'daily' | 'weekly' | 'monthly'

export function getPeriodRange(period: PeriodKey): { start: Date; end: Date } {
  const now = new Date()
  const end = now
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end }
    case '7days':
      return { start: subDays(now, 7), end }
    case '30days':
      return { start: subDays(now, 30), end }
    case 'month':
      return { start: startOfMonth(now), end }
    case 'year':
      return { start: subMonths(now, 12), end }
  }
}

export function getPreviousPeriodRange(period: PeriodKey): { start: Date; end: Date } {
  const { start, end } = getPeriodRange(period)
  const duration = end.getTime() - start.getTime()
  return {
    start: new Date(start.getTime() - duration),
    end: new Date(end.getTime() - duration),
  }
}

function filterByPeriod(orders: Order[], start: Date, end: Date): Order[] {
  return orders.filter((o) => {
    const d = safeTimestamp(o.createdAt)
    return isWithinInterval(d, { start, end })
  })
}

function paidOrders(orders: Order[]): Order[] {
  return orders.filter((o) => o.paymentStatus === 'paid')
}

// ============================================
// KPI Computation
// ============================================

export interface PeriodComparison {
  current: number
  previous: number
  changePercent: number
}

export function computePeriodComparison(
  orders: Order[],
  period: PeriodKey,
  metric: 'revenue' | 'count'
): PeriodComparison {
  const { start, end } = getPeriodRange(period)
  const prev = getPreviousPeriodRange(period)

  const currentOrders = paidOrders(filterByPeriod(orders, start, end))
  const previousOrders = paidOrders(filterByPeriod(orders, prev.start, prev.end))

  const current = metric === 'revenue'
    ? currentOrders.reduce((sum, o) => sum + o.total, 0)
    : currentOrders.length

  const previous = metric === 'revenue'
    ? previousOrders.reduce((sum, o) => sum + o.total, 0)
    : previousOrders.length

  const changePercent = previous === 0
    ? current > 0 ? 100 : 0
    : ((current - previous) / previous) * 100

  return { current, previous, changePercent }
}

// ============================================
// Chart Data
// ============================================

export interface ChartDataPoint {
  label: string
  value: number
  count?: number
}

export function computeRevenueByPeriod(
  orders: Order[],
  granularity: Granularity,
  period: PeriodKey = '30days'
): ChartDataPoint[] {
  const { start, end } = getPeriodRange(period)
  const paid = paidOrders(filterByPeriod(orders, start, end))

  let buckets: Date[]
  let formatStr: string
  let bucketFn: (d: Date) => string

  switch (granularity) {
    case 'daily':
      buckets = eachDayOfInterval({ start, end })
      formatStr = 'MMM d'
      bucketFn = (d) => format(d, 'yyyy-MM-dd')
      break
    case 'weekly':
      buckets = eachWeekOfInterval({ start, end })
      formatStr = 'MMM d'
      bucketFn = (d) => format(startOfWeek(d), 'yyyy-MM-dd')
      break
    case 'monthly':
      buckets = eachMonthOfInterval({ start, end })
      formatStr = 'MMM yyyy'
      bucketFn = (d) => format(startOfMonth(d), 'yyyy-MM')
      break
  }

  const revenueMap: Record<string, { revenue: number; count: number }> = {}
  buckets.forEach((b) => {
    const key = bucketFn(b)
    revenueMap[key] = { revenue: 0, count: 0 }
  })

  paid.forEach((o) => {
    const d = safeTimestamp(o.createdAt)
    const key = bucketFn(d)
    if (revenueMap[key]) {
      revenueMap[key].revenue += o.total
      revenueMap[key].count++
    }
  })

  return buckets.map((b) => {
    const key = bucketFn(b)
    return {
      label: format(b, formatStr),
      value: Math.round((revenueMap[key]?.revenue || 0) * 100) / 100,
      count: revenueMap[key]?.count || 0,
    }
  })
}

// ============================================
// Status Breakdown
// ============================================

export interface StatusBreakdown {
  status: string
  count: number
  color: string
  label: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#eab308',
  confirmed: '#3b82f6',
  preparing: '#a855f7',
  out_for_delivery: '#6366f1',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function computeOrdersByStatus(orders: Order[]): StatusBreakdown[] {
  const map: Record<string, number> = {}
  orders.forEach((o) => {
    map[o.status] = (map[o.status] || 0) + 1
  })
  return Object.entries(map).map(([status, count]) => ({
    status,
    count,
    color: STATUS_COLORS[status] || '#9ca3af',
    label: STATUS_LABELS[status] || status,
  }))
}

// ============================================
// Top Products
// ============================================

export interface TopProductEntry {
  productId: string
  productName: string
  productImage: string
  category: string
  unitsSold: number
  revenue: number
}

export function computeTopProducts(
  orders: Order[],
  products: Product[],
  limit = 5
): TopProductEntry[] {
  const productMap = new Map(products.map((p) => [p.id, p]))
  const agg: Record<string, { name: string; image: string; category: string; units: number; revenue: number }> = {}

  paidOrders(orders).forEach((o) => {
    o.items.forEach((item) => {
      if (!agg[item.productId]) {
        const prod = productMap.get(item.productId)
        agg[item.productId] = {
          name: item.productName || prod?.name || 'Unknown',
          image: item.productImage || prod?.images?.[0]?.url || '',
          category: prod?.categoryName || '',
          units: 0,
          revenue: 0,
        }
      }
      agg[item.productId].units += item.quantity
      agg[item.productId].revenue += item.totalPrice
    })
  })

  return Object.entries(agg)
    .map(([id, data]) => ({
      productId: id,
      productName: data.name,
      productImage: data.image,
      category: data.category,
      unitsSold: data.units,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

// ============================================
// Low Stock
// ============================================

export function computeLowStockProducts(products: Product[], threshold = 20): Product[] {
  return products
    .filter((p) => p.isActive && (p.stockQuantity ?? 0) <= threshold)
    .sort((a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0))
}

// ============================================
// Customer Growth
// ============================================

export function computeCustomerGrowth(
  users: UserProfile[],
  granularity: Granularity = 'monthly',
  period: PeriodKey = 'year'
): ChartDataPoint[] {
  const { start, end } = getPeriodRange(period)

  let buckets: Date[]
  let formatStr: string
  let bucketFn: (d: Date) => string

  switch (granularity) {
    case 'daily':
      buckets = eachDayOfInterval({ start, end })
      formatStr = 'MMM d'
      bucketFn = (d) => format(d, 'yyyy-MM-dd')
      break
    case 'weekly':
      buckets = eachWeekOfInterval({ start, end })
      formatStr = 'MMM d'
      bucketFn = (d) => format(startOfWeek(d), 'yyyy-MM-dd')
      break
    case 'monthly':
      buckets = eachMonthOfInterval({ start, end })
      formatStr = 'MMM'
      bucketFn = (d) => format(startOfMonth(d), 'yyyy-MM')
      break
  }

  const countMap: Record<string, number> = {}
  buckets.forEach((b) => {
    countMap[bucketFn(b)] = 0
  })

  users.forEach((u) => {
    const d = safeTimestamp(u.createdAt)
    const key = bucketFn(d)
    if (countMap[key] !== undefined) {
      countMap[key]++
    }
  })

  // Make cumulative
  let cumulative = users.filter((u) => safeTimestamp(u.createdAt) < start).length
  return buckets.map((b) => {
    const key = bucketFn(b)
    cumulative += countMap[key] || 0
    return {
      label: format(b, formatStr),
      value: cumulative,
    }
  })
}

// ============================================
// Category Performance
// ============================================

export interface CategoryPerformance {
  category: string
  revenue: number
  unitsSold: number
}

export function computeCategoryPerformance(
  orders: Order[],
  products: Product[]
): CategoryPerformance[] {
  const productMap = new Map(products.map((p) => [p.id, p]))
  const agg: Record<string, { revenue: number; units: number }> = {}

  paidOrders(orders).forEach((o) => {
    o.items.forEach((item) => {
      const prod = productMap.get(item.productId)
      const cat = prod?.categoryName || 'Other'
      if (!agg[cat]) agg[cat] = { revenue: 0, units: 0 }
      agg[cat].revenue += item.totalPrice
      agg[cat].units += item.quantity
    })
  })

  return Object.entries(agg)
    .map(([category, data]) => ({
      category,
      revenue: Math.round(data.revenue * 100) / 100,
      unitsSold: data.units,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

// ============================================
// Average Order Value Trend
// ============================================

export function computeAOVTrend(
  orders: Order[],
  granularity: Granularity = 'monthly',
  period: PeriodKey = 'year'
): ChartDataPoint[] {
  const { start, end } = getPeriodRange(period)
  const paid = paidOrders(filterByPeriod(orders, start, end))

  let buckets: Date[]
  let formatStr: string
  let bucketFn: (d: Date) => string

  switch (granularity) {
    case 'daily':
      buckets = eachDayOfInterval({ start, end })
      formatStr = 'MMM d'
      bucketFn = (d) => format(d, 'yyyy-MM-dd')
      break
    case 'weekly':
      buckets = eachWeekOfInterval({ start, end })
      formatStr = 'MMM d'
      bucketFn = (d) => format(startOfWeek(d), 'yyyy-MM-dd')
      break
    case 'monthly':
      buckets = eachMonthOfInterval({ start, end })
      formatStr = 'MMM'
      bucketFn = (d) => format(startOfMonth(d), 'yyyy-MM')
      break
  }

  const bucketData: Record<string, { total: number; count: number }> = {}
  buckets.forEach((b) => {
    bucketData[bucketFn(b)] = { total: 0, count: 0 }
  })

  paid.forEach((o) => {
    const d = safeTimestamp(o.createdAt)
    const key = bucketFn(d)
    if (bucketData[key]) {
      bucketData[key].total += o.total
      bucketData[key].count++
    }
  })

  return buckets.map((b) => {
    const key = bucketFn(b)
    const d = bucketData[key]
    return {
      label: format(b, formatStr),
      value: d && d.count > 0 ? Math.round((d.total / d.count) * 100) / 100 : 0,
    }
  })
}
