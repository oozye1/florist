'use client'

import { useState, useMemo } from 'react'
import { Search, Users, Crown, ArrowUpDown, Mail, ShieldCheck } from 'lucide-react'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import { getAllUsers } from '@/lib/firebase/services/users'
import { getAllOrders } from '@/lib/firebase/services/orders'
import { formatPrice, cn, getInitials } from '@/lib/utils'
import { safeTimestamp, relativeTime } from '@/lib/admin-utils'
import type { UserProfile, Order } from '@/types'

// --------------------------------------------------
// Role styles
// --------------------------------------------------

const ROLE_STYLES: Record<string, { label: string; color: string }> = {
  customer: { label: 'Customer', color: 'bg-blue-100 text-blue-800' },
  admin: { label: 'Admin', color: 'bg-gray-100 text-gray-800' },
}

const ROLE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'customer', label: 'Customer' },
  { key: 'admin', label: 'Admin' },
]

type SortKey = 'fullName' | 'email' | 'loyaltyPoints' | 'orders' | 'spent' | 'joined'
type SortDir = 'asc' | 'desc'

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminCustomersPage() {
  const { data: users, loading: loadingUsers } = useFirestoreQuery<UserProfile[]>(getAllUsers, [])
  const { data: orders, loading: loadingOrders } = useFirestoreQuery<Order[]>(getAllOrders, [])

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('joined')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const loading = loadingUsers || loadingOrders

  // Compute per-customer stats from orders
  const customerStats = useMemo(() => {
    const stats: Record<string, { totalOrders: number; totalSpent: number; lastOrderDate: Date | null }> = {}
    if (!orders) return stats
    orders.forEach((order) => {
      const uid = order.userId || order.billingEmail
      if (!uid) return
      if (!stats[uid]) {
        stats[uid] = { totalOrders: 0, totalSpent: 0, lastOrderDate: null }
      }
      stats[uid].totalOrders += 1
      if (order.paymentStatus === 'paid') {
        stats[uid].totalSpent += order.total
      }
      const orderDate = safeTimestamp(order.createdAt)
      if (!stats[uid].lastOrderDate || orderDate > stats[uid].lastOrderDate) {
        stats[uid].lastOrderDate = orderDate
      }
    })
    return stats
  }, [orders])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filteredAndSorted = useMemo(() => {
    if (!users) return []

    let result = users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !u.fullName.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })

    result = [...result].sort((a, b) => {
      const statsA = customerStats[a.uid] || { totalOrders: 0, totalSpent: 0 }
      const statsB = customerStats[b.uid] || { totalOrders: 0, totalSpent: 0 }
      let cmp = 0
      switch (sortKey) {
        case 'fullName':
          cmp = a.fullName.localeCompare(b.fullName)
          break
        case 'email':
          cmp = a.email.localeCompare(b.email)
          break
        case 'loyaltyPoints':
          cmp = a.loyaltyPoints - b.loyaltyPoints
          break
        case 'orders':
          cmp = statsA.totalOrders - statsB.totalOrders
          break
        case 'spent':
          cmp = statsA.totalSpent - statsB.totalSpent
          break
        case 'joined':
          cmp = safeTimestamp(a.createdAt).getTime() - safeTimestamp(b.createdAt).getTime()
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [users, search, roleFilter, sortKey, sortDir, customerStats])

  const totalCustomers = users?.length ?? 0
  const adminCount = users?.filter((u) => u.role === 'admin').length ?? 0
  const avgLoyalty =
    totalCustomers > 0
      ? Math.round(
          (users?.reduce((sum, u) => sum + u.loyaltyPoints, 0) ?? 0) /
            Math.max(totalCustomers - adminCount, 1)
        )
      : 0

  const SortHeader = ({ label, sortKeyVal }: { label: string; sortKeyVal: SortKey }) => (
    <button
      onClick={() => handleSort(sortKeyVal)}
      className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-gray-700 transition-colors"
    >
      {label}
      <ArrowUpDown
        className={cn(
          'h-3 w-3',
          sortKey === sortKeyVal ? 'text-primary' : 'text-gray-300'
        )}
      />
    </button>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading customer data...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
              <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm animate-pulse">
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your customer base ({totalCustomers} total customers)
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Total Customers</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Admin Users</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Avg Loyalty Points</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
              <Crown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgLoyalty.toLocaleString()}</p>
        </div>
      </div>

      {/* Role filter tabs + search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {ROLE_TABS.map((tab) => {
            const count =
              tab.key === 'all'
                ? totalCustomers
                : users?.filter((u) => u.role === tab.key).length ?? 0
            return (
              <button
                key={tab.key}
                onClick={() => setRoleFilter(tab.key)}
                className={`
                  flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${
                    roleFilter === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                    roleFilter === tab.key
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

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Customers table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3.5">
                  <SortHeader label="Customer" sortKeyVal="fullName" />
                </th>
                <th className="text-left px-6 py-3.5">
                  <SortHeader label="Email" sortKeyVal="email" />
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-3.5">
                  <SortHeader label="Loyalty Points" sortKeyVal="loyaltyPoints" />
                </th>
                <th className="text-left px-6 py-3.5">
                  <SortHeader label="Orders" sortKeyVal="orders" />
                </th>
                <th className="text-left px-6 py-3.5">
                  <SortHeader label="Total Spent" sortKeyVal="spent" />
                </th>
                <th className="text-left px-6 py-3.5">
                  <SortHeader label="Joined" sortKeyVal="joined" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSorted.map((customer, idx) => {
                const roleInfo = ROLE_STYLES[customer.role] || ROLE_STYLES.customer
                const stats = customerStats[customer.uid] || {
                  totalOrders: 0,
                  totalSpent: 0,
                }
                return (
                  <tr
                    key={customer.uid}
                    className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    {/* Name with avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {getInitials(customer.fullName)}
                        </div>
                        <span className="font-medium text-gray-900">{customer.fullName}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {customer.email}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}
                      >
                        {roleInfo.label}
                      </span>
                    </td>

                    {/* Loyalty Points */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {customer.loyaltyPoints.toLocaleString()}
                      </span>
                    </td>

                    {/* Orders */}
                    <td className="px-6 py-4 text-gray-700">{stats.totalOrders}</td>

                    {/* Total Spent */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatPrice(stats.totalSpent)}
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {relativeTime(customer.createdAt)}
                    </td>
                  </tr>
                )
              })}

              {filteredAndSorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-muted-foreground text-sm">
                      No customers found matching your criteria.
                    </p>
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
