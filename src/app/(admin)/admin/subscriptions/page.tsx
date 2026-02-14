'use client'

import { useState } from 'react'
import { Pencil, Trash2, Save, X, RefreshCw, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

// --------------------------------------------------
// Types & sample data
// --------------------------------------------------

interface SubscriptionPlan {
  id: string
  name: string
  frequency: 'weekly' | 'fortnightly' | 'monthly'
  price: number
  description: string
  features: string[]
  subscriberCount: number
  isActive: boolean
}

const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-001',
    name: 'Weekly Blooms',
    frequency: 'weekly',
    price: 29.99,
    description: 'Fresh seasonal flowers delivered to your door every week.',
    features: [
      'Seasonal mixed bouquet',
      'Free delivery',
      'Flower food included',
      'Care card with tips',
    ],
    subscriberCount: 47,
    isActive: true,
  },
  {
    id: 'plan-002',
    name: 'Fortnightly Florals',
    frequency: 'fortnightly',
    price: 34.99,
    description: 'A beautiful arrangement every two weeks to keep your home vibrant.',
    features: [
      'Premium seasonal bouquet',
      'Free delivery',
      'Flower food included',
      'Care card with tips',
      'Vase included (first delivery)',
    ],
    subscriberCount: 83,
    isActive: true,
  },
  {
    id: 'plan-003',
    name: 'Monthly Masterpiece',
    frequency: 'monthly',
    price: 39.99,
    description: 'Our finest luxury arrangement delivered monthly for that special touch.',
    features: [
      'Luxury designer bouquet',
      'Free next-day delivery',
      'Flower food included',
      'Care card with tips',
      'Premium vase included',
      'Handwritten card',
    ],
    subscriberCount: 126,
    isActive: true,
  },
]

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
}

const FREQUENCY_STYLES: Record<string, string> = {
  weekly: 'bg-blue-100 text-blue-800',
  fortnightly: 'bg-purple-100 text-purple-800',
  monthly: 'bg-emerald-100 text-emerald-800',
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const totalSubscribers = plans.reduce((sum, p) => sum + p.subscriberCount, 0)
  const monthlyRevenue = plans.reduce(
    (sum, p) => {
      const multiplier = p.frequency === 'weekly' ? 4.33 : p.frequency === 'fortnightly' ? 2.17 : 1
      return sum + p.price * p.subscriberCount * multiplier
    },
    0
  )

  const startEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id)
    setEditPrice(plan.price.toString())
    setEditActive(plan.isActive)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditPrice('')
    setEditActive(true)
  }

  const saveEdit = () => {
    if (!editingId) return
    const price = parseFloat(editPrice)
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price.')
      return
    }

    setPlans((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? { ...p, price, isActive: editActive }
          : p
      )
    )
    toast.success('Subscription plan updated successfully.')
    setEditingId(null)
    setEditPrice('')
  }

  const handleDelete = (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    setPlans((prev) => prev.filter((p) => p.id !== planId))
    setDeleteConfirmId(null)
    toast.success(`Plan "${plan?.name}" deleted.`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage flower subscription plans and pricing
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Active Plans</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {plans.filter((p) => p.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Total Subscribers</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
              <Crown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalSubscribers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Est. Monthly Revenue</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
              <Crown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(monthlyRevenue)}</p>
        </div>
      </div>

      {/* Plans table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Plan Name
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Frequency
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Price
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Subscribers
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
              {plans.map((plan, idx) => {
                const isEditing = editingId === plan.id
                return (
                  <tr
                    key={plan.id}
                    className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    {/* Plan Name */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{plan.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                      </div>
                    </td>

                    {/* Frequency */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${FREQUENCY_STYLES[plan.frequency]}`}
                      >
                        {FREQUENCY_LABELS[plan.frequency]}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">£</span>
                          <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-900">{formatPrice(plan.price)}</span>
                      )}
                    </td>

                    {/* Subscribers */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{plan.subscriberCount}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={editActive}
                              onChange={(e) => setEditActive(e.target.checked)}
                              className="sr-only"
                            />
                            <div
                              className={`w-9 h-5 rounded-full transition-colors ${
                                editActive ? 'bg-primary' : 'bg-gray-300'
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                  editActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {editActive ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                      ) : plan.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={saveEdit}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                          >
                            <Save className="h-3.5 w-3.5" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(plan)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          {deleteConfirmId === plan.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(plan.id)}
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
                              onClick={() => setDeleteConfirmId(plan.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}

              {plans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-muted-foreground text-sm">No subscription plans found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan details cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${FREQUENCY_STYLES[plan.frequency]}`}
              >
                {FREQUENCY_LABELS[plan.frequency]}
              </span>
              {plan.isActive ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Inactive
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
            <p className="text-3xl font-bold text-gray-900 mb-4">
              {formatPrice(plan.price)}
              <span className="text-sm font-normal text-muted-foreground">
                /{plan.frequency === 'fortnightly' ? '2 weeks' : plan.frequency === 'weekly' ? 'week' : 'month'}
              </span>
            </p>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-gray-900">{plan.subscriberCount}</span> active subscribers
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
