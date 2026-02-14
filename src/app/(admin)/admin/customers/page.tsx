'use client'

import { useState, useMemo } from 'react'
import { Search, Users, Mail, Calendar, Crown } from 'lucide-react'
import { formatDate } from '@/lib/utils'

// --------------------------------------------------
// Sample customer data
// --------------------------------------------------

interface Customer {
  id: string
  name: string
  email: string
  role: 'customer' | 'vip' | 'admin'
  loyaltyPoints: number
  joinDate: string
  totalOrders: number
  totalSpent: number
}

const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    name: 'Emily Thompson',
    email: 'emily.thompson@email.com',
    role: 'vip',
    loyaltyPoints: 2450,
    joinDate: '2025-03-15',
    totalOrders: 18,
    totalSpent: 1847.82,
  },
  {
    id: 'cust-002',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    role: 'customer',
    loyaltyPoints: 820,
    joinDate: '2025-06-22',
    totalOrders: 7,
    totalSpent: 623.93,
  },
  {
    id: 'cust-003',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    role: 'vip',
    loyaltyPoints: 3100,
    joinDate: '2024-11-08',
    totalOrders: 24,
    totalSpent: 2891.76,
  },
  {
    id: 'cust-004',
    name: 'David Clarke',
    email: 'david.clarke@email.com',
    role: 'customer',
    loyaltyPoints: 340,
    joinDate: '2025-09-01',
    totalOrders: 3,
    totalSpent: 194.97,
  },
  {
    id: 'cust-005',
    name: 'Olivia Brown',
    email: 'olivia.brown@email.com',
    role: 'customer',
    loyaltyPoints: 1560,
    joinDate: '2025-01-14',
    totalOrders: 12,
    totalSpent: 1129.88,
  },
  {
    id: 'cust-006',
    name: 'Charlotte Davis',
    email: 'charlotte.davis@email.com',
    role: 'admin',
    loyaltyPoints: 0,
    joinDate: '2024-08-20',
    totalOrders: 0,
    totalSpent: 0,
  },
]

const ROLE_STYLES: Record<string, { label: string; color: string }> = {
  customer: { label: 'Customer', color: 'bg-blue-100 text-blue-800' },
  vip: { label: 'VIP', color: 'bg-purple-100 text-purple-800' },
  admin: { label: 'Admin', color: 'bg-gray-100 text-gray-800' },
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('')

  const filteredCustomers = useMemo(() => {
    if (!search) return SAMPLE_CUSTOMERS
    const q = search.toLowerCase()
    return SAMPLE_CUSTOMERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your customer base ({SAMPLE_CUSTOMERS.length} total customers)
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
          <p className="text-2xl font-bold text-gray-900">{SAMPLE_CUSTOMERS.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">VIP Customers</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
              <Crown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {SAMPLE_CUSTOMERS.filter((c) => c.role === 'vip').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Avg Loyalty Points</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
              <Crown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(
              SAMPLE_CUSTOMERS.reduce((sum, c) => sum + c.loyaltyPoints, 0) /
                SAMPLE_CUSTOMERS.filter((c) => c.role !== 'admin').length
            ).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
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

      {/* Customers table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Loyalty Points
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Orders
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Join Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer, idx) => {
                const roleInfo = ROLE_STYLES[customer.role]
                return (
                  <tr
                    key={customer.id}
                    className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {customer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <span className="font-medium text-gray-900">{customer.name}</span>
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
                    <td className="px-6 py-4 text-gray-700">{customer.totalOrders}</td>

                    {/* Join Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(customer.joinDate)}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-muted-foreground text-sm">No customers found matching your search.</p>
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
