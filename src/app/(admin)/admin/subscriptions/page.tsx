'use client'

import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Save, X, RefreshCw, Crown, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getAllSubscriptions,
} from '@/lib/firebase/services/subscriptions'
import { subscriptionPlanSchema, type SubscriptionPlanFormData } from '@/lib/validations/admin'
import { formatPrice, generateSlug } from '@/lib/utils'
import type { SubscriptionPlan, Subscription } from '@/types'

// --------------------------------------------------
// Constants
// --------------------------------------------------

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
  const { data: plans, loading: loadingPlans, refetch: refetchPlans } =
    useFirestoreQuery<SubscriptionPlan[]>(getAllPlans, [])
  const { data: subscriptions, loading: loadingSubs } =
    useFirestoreQuery<Subscription[]>(getAllSubscriptions, [])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loading = loadingPlans || loadingSubs

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionPlanFormData>({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      frequency: 'monthly',
      price: 0,
      imageUrl: '',
      isActive: true,
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    register('name').onChange(e)
    setValue('slug', generateSlug(e.target.value))
  }

  // Compute subscriber counts per plan from real subscriptions data
  const subscriberCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    if (!subscriptions) return counts
    subscriptions.forEach((sub) => {
      if (sub.status === 'active') {
        counts[sub.planId] = (counts[sub.planId] || 0) + 1
      }
    })
    return counts
  }, [subscriptions])

  const totalSubscribers = useMemo(() => {
    return Object.values(subscriberCounts).reduce((sum, c) => sum + c, 0)
  }, [subscriberCounts])

  const estimatedMonthlyRevenue = useMemo(() => {
    if (!plans) return 0
    return plans.reduce((sum, p) => {
      const count = subscriberCounts[p.id] || 0
      const multiplier = p.frequency === 'weekly' ? 4.33 : p.frequency === 'fortnightly' ? 2.17 : 1
      return sum + p.price * count * multiplier
    }, 0)
  }, [plans, subscriberCounts])

  const onSubmit = async (data: SubscriptionPlanFormData) => {
    setSubmitting(true)
    try {
      await createPlan({
        name: data.name,
        slug: data.slug,
        description: data.description,
        frequency: data.frequency,
        price: data.price,
        imageUrl: data.imageUrl || '',
        isActive: data.isActive,
      } as Omit<SubscriptionPlan, 'id'>)
      toast.success(`Plan "${data.name}" created successfully.`)
      reset()
      setShowForm(false)
      refetchPlans()
    } catch {
      toast.error('Failed to create subscription plan.')
    } finally {
      setSubmitting(false)
    }
  }

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

  const saveEdit = async () => {
    if (!editingId) return
    const price = parseFloat(editPrice)
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price.')
      return
    }
    try {
      await updatePlan(editingId, { price, isActive: editActive })
      toast.success('Subscription plan updated.')
      setEditingId(null)
      refetchPlans()
    } catch {
      toast.error('Failed to update plan.')
    }
  }

  const handleDelete = async (planId: string) => {
    try {
      await deletePlan(planId)
      toast.success('Subscription plan deleted.')
      setDeleteConfirmId(null)
      refetchPlans()
    } catch {
      toast.error('Failed to delete plan.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading subscription data...</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage flower subscription plans and pricing
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Plan'}
        </Button>
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
            {plans?.filter((p) => p.isActive).length ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Total Subscribers</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
              <Users className="h-5 w-5" />
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
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(Math.round(estimatedMonthlyRevenue * 100) / 100)}
          </p>
        </div>
      </div>

      {/* Create plan form */}
      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="planName">Plan Name *</Label>
              <Input
                id="planName"
                {...register('name')}
                onChange={handleNameChange}
                placeholder="Monthly Masterpiece"
                error={errors.name?.message}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="planSlug">Slug</Label>
              <Input id="planSlug" {...register('slug')} placeholder="monthly-masterpiece" error={errors.slug?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="planFrequency">Frequency</Label>
              <div className="relative">
                <select
                  id="planFrequency"
                  {...register('frequency')}
                  className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm appearance-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-pointer"
                >
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="planPrice">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">£</span>
                <Input
                  id="planPrice"
                  type="number"
                  step="0.01"
                  {...register('price')}
                  className="pl-7"
                  error={errors.price?.message}
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="planDescription">Description *</Label>
              <Input
                id="planDescription"
                {...register('description')}
                placeholder="A beautiful arrangement delivered to your door"
                error={errors.description?.message}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="planImage">Image URL</Label>
              <Input id="planImage" {...register('imageUrl')} placeholder="https://..." />
            </div>
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
              Create Plan
            </Button>
          </div>
        </form>
      )}

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
              {plans?.map((plan, idx) => {
                const isEditing = editingId === plan.id
                const subCount = subscriberCounts[plan.id] || 0
                return (
                  <tr
                    key={plan.id}
                    className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{plan.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${FREQUENCY_STYLES[plan.frequency] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {FREQUENCY_LABELS[plan.frequency] || plan.frequency}
                      </span>
                    </td>
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
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{subCount}</span>
                    </td>
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
                            <div className={`w-9 h-5 rounded-full transition-colors ${editActive ? 'bg-primary' : 'bg-gray-300'}`}>
                              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editActive ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-600">{editActive ? 'Active' : 'Inactive'}</span>
                        </label>
                      ) : plan.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={saveEdit} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">
                            <Save className="h-3.5 w-3.5" />Save
                          </button>
                          <button onClick={cancelEdit} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            <X className="h-3.5 w-3.5" />Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => startEdit(plan)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            <Pencil className="h-3.5 w-3.5" />Edit
                          </button>
                          {deleteConfirmId === plan.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(plan.id)} className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Confirm</button>
                              <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirmId(plan.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {(!plans || plans.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-muted-foreground text-sm">No subscription plans yet. Click &quot;Add Plan&quot; to create one.</p>
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
