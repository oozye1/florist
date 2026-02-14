'use client'

import { useState, useMemo } from 'react'
import { Plus, Trash2, Tag, ChevronDown, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/input'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/firebase/services/coupons'
import { formatPrice } from '@/lib/utils'
import { safeTimestamp, relativeTime } from '@/lib/admin-utils'
import { couponSchema, type CouponFormData } from '@/lib/validations/admin'
import type { Coupon } from '@/types'

// --------------------------------------------------
// Constants
// --------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  percentage: 'Percentage',
  fixed_amount: 'Fixed Amount',
  free_delivery: 'Free Delivery',
}

const TYPE_STYLES: Record<string, string> = {
  percentage: 'bg-blue-100 text-blue-800',
  fixed_amount: 'bg-emerald-100 text-emerald-800',
  free_delivery: 'bg-purple-100 text-purple-800',
}

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expired', label: 'Expired' },
]

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminCouponsPage() {
  const { data: coupons, loading, refetch } = useFirestoreQuery<Coupon[]>(getAllCoupons, [])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumOrder: 0,
      maxUses: 0,
      isActive: true,
      expiresAt: '',
    },
  })

  const discountType = watch('discountType')

  const onSubmit = async (data: CouponFormData) => {
    setSubmitting(true)
    try {
      await createCoupon({
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountType === 'free_delivery' ? 0 : data.discountValue,
        minimumOrder: data.minimumOrder,
        maxUses: data.maxUses,
        isActive: data.isActive,
        expiresAt: data.expiresAt || undefined,
      } as Parameters<typeof createCoupon>[0])
      toast.success(`Coupon ${data.code} created successfully.`)
      reset()
      setShowForm(false)
      refetch()
    } catch {
      toast.error('Failed to create coupon.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await updateCoupon(coupon.id, { isActive: !coupon.isActive })
      refetch()
    } catch {
      toast.error('Failed to update coupon.')
    }
  }

  const handleDelete = async (couponId: string) => {
    try {
      await deleteCoupon(couponId)
      toast.success('Coupon deleted.')
      setDeleteConfirmId(null)
      refetch()
    } catch {
      toast.error('Failed to delete coupon.')
    }
  }

  const filteredCoupons = useMemo(() => {
    if (!coupons) return []
    const now = new Date()
    return coupons.filter((c) => {
      if (activeTab === 'active') {
        if (!c.isActive) return false
        if (c.expiresAt && safeTimestamp(c.expiresAt) < now) return false
        return true
      }
      if (activeTab === 'expired') {
        return (c.expiresAt && safeTimestamp(c.expiresAt) < now) || !c.isActive
      }
      return true
    })
  }, [coupons, activeTab])

  const formatCouponValue = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case 'percentage':
        return `${coupon.discountValue}%`
      case 'fixed_amount':
        return formatPrice(coupon.discountValue)
      case 'free_delivery':
        return 'Free'
      default:
        return '-'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading coupons...</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage discount codes and promotions ({coupons?.length ?? 0} coupons)
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'default'}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Coupon'}
        </Button>
      </div>

      {/* Add coupon form */}
      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Coupon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Code */}
            <div className="space-y-1.5">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="e.g. SUMMER20"
                className="uppercase"
                error={errors.code?.message}
              />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Summer sale discount"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label htmlFor="discountType">Type</Label>
              <div className="relative">
                <select
                  id="discountType"
                  {...register('discountType')}
                  className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm appearance-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-pointer"
                >
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed_amount">Fixed Amount Off</option>
                  <option value="free_delivery">Free Delivery</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Value */}
            <div className="space-y-1.5">
              <Label htmlFor="discountValue">
                Value {discountType === 'percentage' ? '(%)' : discountType === 'fixed_amount' ? '(\u00A3)' : ''}
              </Label>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                {...register('discountValue')}
                placeholder={discountType === 'free_delivery' ? 'N/A' : '0'}
                disabled={discountType === 'free_delivery'}
                error={errors.discountValue?.message}
              />
            </div>

            {/* Min Order */}
            <div className="space-y-1.5">
              <Label htmlFor="minimumOrder">Min Order (\u00A3)</Label>
              <Input
                id="minimumOrder"
                type="number"
                step="0.01"
                {...register('minimumOrder')}
                placeholder="0"
              />
            </div>

            {/* Max Uses */}
            <div className="space-y-1.5">
              <Label htmlFor="maxUses">Max Uses</Label>
              <Input
                id="maxUses"
                type="number"
                {...register('maxUses')}
                placeholder="Unlimited"
              />
            </div>

            {/* Expires At */}
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                {...register('expiresAt')}
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button type="submit" isLoading={submitting}>
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {FILTER_TABS.map((tab) => (
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
            </button>
          ))}
        </div>
      </div>

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
                  Description
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
                  Usage
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
              {filteredCoupons.map((coupon, idx) => {
                const usagePercent =
                  coupon.maxUses && coupon.maxUses > 0
                    ? Math.min((coupon.timesUsed / coupon.maxUses) * 100, 100)
                    : 0
                return (
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

                    {/* Description */}
                    <td className="px-6 py-4 text-gray-700 max-w-[200px] truncate">
                      {coupon.description || '-'}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[coupon.discountType] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {TYPE_LABELS[coupon.discountType] || coupon.discountType}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCouponValue(coupon)}
                    </td>

                    {/* Min Order */}
                    <td className="px-6 py-4 text-gray-700">
                      {coupon.minimumOrder && coupon.minimumOrder > 0
                        ? formatPrice(coupon.minimumOrder)
                        : '-'}
                    </td>

                    {/* Usage with progress */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="text-sm">
                          <span className="font-medium text-gray-900">{coupon.timesUsed}</span>
                          {coupon.maxUses && coupon.maxUses > 0 && (
                            <span className="text-muted-foreground"> / {coupon.maxUses}</span>
                          )}
                        </span>
                        {coupon.maxUses && coupon.maxUses > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleActive(coupon)} className="cursor-pointer">
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
                )
              })}

              {filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <p className="text-muted-foreground text-sm">
                      No coupons found. Click &quot;Add Coupon&quot; to create one.
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
