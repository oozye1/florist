'use client'

import { useState, useMemo } from 'react'
import { Plus, Trash2, Tag, ChevronDown, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

// --------------------------------------------------
// Types & sample data
// --------------------------------------------------

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_delivery'
  value: number
  minOrder: number
  maxUses: number
  usedCount: number
  isActive: boolean
}

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-001',
    code: 'WELCOME15',
    type: 'percentage',
    value: 15,
    minOrder: 30,
    maxUses: 500,
    usedCount: 247,
    isActive: true,
  },
  {
    id: 'coup-002',
    code: 'SPRING10',
    type: 'fixed',
    value: 10,
    minOrder: 50,
    maxUses: 200,
    usedCount: 89,
    isActive: true,
  },
  {
    id: 'coup-003',
    code: 'FREEDEL',
    type: 'free_delivery',
    value: 0,
    minOrder: 40,
    maxUses: 1000,
    usedCount: 412,
    isActive: true,
  },
]

const TYPE_LABELS: Record<string, string> = {
  percentage: 'Percentage',
  fixed: 'Fixed Amount',
  free_delivery: 'Free Delivery',
}

const TYPE_STYLES: Record<string, string> = {
  percentage: 'bg-blue-100 text-blue-800',
  fixed: 'bg-emerald-100 text-emerald-800',
  free_delivery: 'bg-purple-100 text-purple-800',
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // New coupon form state
  const [newCode, setNewCode] = useState('')
  const [newType, setNewType] = useState<'percentage' | 'fixed' | 'free_delivery'>('percentage')
  const [newValue, setNewValue] = useState('')
  const [newMinOrder, setNewMinOrder] = useState('')
  const [newMaxUses, setNewMaxUses] = useState('')
  const [newActive, setNewActive] = useState(true)

  const handleAddCoupon = () => {
    if (!newCode.trim()) {
      toast.error('Please enter a coupon code.')
      return
    }

    if (coupons.some((c) => c.code.toUpperCase() === newCode.trim().toUpperCase())) {
      toast.error('A coupon with this code already exists.')
      return
    }

    const coupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      type: newType,
      value: newType === 'free_delivery' ? 0 : parseFloat(newValue) || 0,
      minOrder: parseFloat(newMinOrder) || 0,
      maxUses: parseInt(newMaxUses) || 0,
      usedCount: 0,
      isActive: newActive,
    }

    setCoupons((prev) => [...prev, coupon])
    toast.success(`Coupon ${coupon.code} created successfully.`)

    // Reset form
    setNewCode('')
    setNewType('percentage')
    setNewValue('')
    setNewMinOrder('')
    setNewMaxUses('')
    setNewActive(true)
    setShowForm(false)
  }

  const handleDelete = (couponId: string) => {
    const coupon = coupons.find((c) => c.id === couponId)
    setCoupons((prev) => prev.filter((c) => c.id !== couponId))
    setDeleteConfirmId(null)
    toast.success(`Coupon ${coupon?.code} deleted.`)
  }

  const toggleActive = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === couponId ? { ...c, isActive: !c.isActive } : c
      )
    )
  }

  const formatCouponValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}%`
      case 'fixed':
        return formatPrice(coupon.value)
      case 'free_delivery':
        return 'Free'
      default:
        return '-'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage discount codes and promotions ({coupons.length} coupons)
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Coupon'}
        </button>
      </div>

      {/* Add coupon form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Coupon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Coupon Code</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER20"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <div className="relative">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'percentage' | 'fixed' | 'free_delivery')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed">Fixed Amount Off</option>
                  <option value="free_delivery">Free Delivery</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Value {newType === 'percentage' ? '(%)' : newType === 'fixed' ? '(£)' : ''}
              </label>
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={newType === 'free_delivery' ? 'N/A' : '0'}
                disabled={newType === 'free_delivery'}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* Min Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Order (£)</label>
              <input
                type="number"
                value={newMinOrder}
                onChange={(e) => setNewMinOrder(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Uses</label>
              <input
                type="number"
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value)}
                placeholder="Unlimited"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={newActive}
                    onChange={(e) => setNewActive(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      newActive ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        newActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleAddCoupon}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </button>
          </div>
        </div>
      )}

      {/* Coupons table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Code
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Value
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Min Order
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Max Uses
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Used
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
              {coupons.map((coupon, idx) => (
                <tr
                  key={coupon.id}
                  className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                >
                  {/* Code */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[coupon.type]}`}
                    >
                      {TYPE_LABELS[coupon.type]}
                    </span>
                  </td>

                  {/* Value */}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {formatCouponValue(coupon)}
                  </td>

                  {/* Min Order */}
                  <td className="px-6 py-4 text-gray-700">
                    {coupon.minOrder > 0 ? formatPrice(coupon.minOrder) : '-'}
                  </td>

                  {/* Max Uses */}
                  <td className="px-6 py-4 text-gray-700">
                    {coupon.maxUses > 0 ? coupon.maxUses.toLocaleString() : 'Unlimited'}
                  </td>

                  {/* Used */}
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{coupon.usedCount.toLocaleString()}</span>
                    {coupon.maxUses > 0 && (
                      <span className="text-muted-foreground ml-1">
                        / {coupon.maxUses.toLocaleString()}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(coupon.id)}
                      className="cursor-pointer"
                    >
                      {coupon.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {deleteConfirmId === coupon.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(coupon.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {coupons.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <p className="text-muted-foreground text-sm">No coupons created yet. Click &quot;Add Coupon&quot; to create one.</p>
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
