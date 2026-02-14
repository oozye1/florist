'use client'

import { useState } from 'react'
import { MapPin, Plus, Save, X, Pencil, Check, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import {
  getAllDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
} from '@/lib/firebase/services/delivery-zones'
import { deliveryZoneSchema, type DeliveryZoneFormData } from '@/lib/validations/admin'
import { formatPrice } from '@/lib/utils'
import type { DeliveryZone } from '@/types'

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminDeliveryZonesPage() {
  const { data: zones, loading, refetch } = useFirestoreQuery<DeliveryZone[]>(getAllDeliveryZones, [])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    name: string
    postcodes: string
    sameDayAvailable: boolean
    nextDayAvailable: boolean
    deliveryFee: string
    freeDeliveryThreshold: string
    isActive: boolean
  } | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeliveryZoneFormData>({
    resolver: zodResolver(deliveryZoneSchema),
    defaultValues: {
      name: '',
      postcodes: '',
      sameDayAvailable: false,
      nextDayAvailable: true,
      sameDayCutoff: '14:00',
      deliveryFee: 0,
      freeDeliveryThreshold: 0,
      isActive: true,
    },
  })

  const onSubmit = async (data: DeliveryZoneFormData) => {
    setSubmitting(true)
    try {
      await createDeliveryZone({
        name: data.name,
        postcodes: data.postcodes.split(',').map((p) => p.trim()).filter(Boolean),
        sameDayAvailable: data.sameDayAvailable,
        nextDayAvailable: data.nextDayAvailable,
        sameDayCutoff: data.sameDayCutoff,
        deliveryFee: data.deliveryFee,
        freeDeliveryThreshold: data.freeDeliveryThreshold,
        isActive: data.isActive,
      } as Omit<DeliveryZone, 'id'>)
      toast.success(`Delivery zone "${data.name}" created.`)
      reset()
      setShowForm(false)
      refetch()
    } catch {
      toast.error('Failed to create delivery zone.')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (zone: DeliveryZone) => {
    setEditingId(zone.id)
    setEditForm({
      name: zone.name,
      postcodes: Array.isArray(zone.postcodes) ? zone.postcodes.join(', ') : String(zone.postcodes || ''),
      sameDayAvailable: zone.sameDayAvailable,
      nextDayAvailable: zone.nextDayAvailable,
      deliveryFee: zone.deliveryFee.toString(),
      freeDeliveryThreshold: (zone.freeDeliveryThreshold || 0).toString(),
      isActive: zone.isActive,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const saveEdit = async () => {
    if (!editForm || !editingId) return
    const fee = parseFloat(editForm.deliveryFee)
    const threshold = parseFloat(editForm.freeDeliveryThreshold)
    if (isNaN(fee)) {
      toast.error('Invalid delivery fee.')
      return
    }
    try {
      await updateDeliveryZone(editingId, {
        name: editForm.name,
        postcodes: editForm.postcodes.split(',').map((p) => p.trim()).filter(Boolean),
        sameDayAvailable: editForm.sameDayAvailable,
        nextDayAvailable: editForm.nextDayAvailable,
        deliveryFee: fee,
        freeDeliveryThreshold: isNaN(threshold) ? undefined : threshold,
        isActive: editForm.isActive,
      })
      toast.success(`Zone "${editForm.name}" updated.`)
      setEditingId(null)
      setEditForm(null)
      refetch()
    } catch {
      toast.error('Failed to update zone.')
    }
  }

  const handleDelete = async (zoneId: string) => {
    try {
      await deleteDeliveryZone(zoneId)
      toast.success('Delivery zone deleted.')
      setDeleteConfirmId(null)
      refetch()
    } catch {
      toast.error('Failed to delete zone.')
    }
  }

  const handleToggleActive = async (zone: DeliveryZone) => {
    try {
      await updateDeliveryZone(zone.id, { isActive: !zone.isActive })
      refetch()
    } catch {
      toast.error('Failed to update zone.')
    }
  }

  const activeCount = zones?.filter((z) => z.isActive).length ?? 0
  const sameDayCount = zones?.filter((z) => z.sameDayAvailable && z.isActive).length ?? 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading delivery zones...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage delivery areas, fees, and availability ({zones?.length ?? 0} zones)
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Zone'}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Total Zones</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{zones?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Same-Day Zones</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
              <Check className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{sameDayCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Active Zones</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
        </div>
      </div>

      {/* Create zone form */}
      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Zone</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="zoneName">Zone Name *</Label>
              <Input id="zoneName" {...register('name')} placeholder="London Central" error={errors.name?.message} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="postcodes">Postcode Prefixes * (comma-separated)</Label>
              <Input id="postcodes" {...register('postcodes')} placeholder="E, EC, N, NW, SE, SW, W, WC" error={errors.postcodes?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deliveryFee">Delivery Fee</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">£</span>
                <Input id="deliveryFee" type="number" step="0.01" {...register('deliveryFee')} className="pl-7" error={errors.deliveryFee?.message} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="freeThreshold">Free Delivery Threshold</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">£</span>
                <Input id="freeThreshold" type="number" step="0.01" {...register('freeDeliveryThreshold')} className="pl-7" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sameDayCutoff">Same-Day Cutoff</Label>
              <Input id="sameDayCutoff" type="time" {...register('sameDayCutoff')} />
            </div>
            <div className="flex items-end gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('sameDayAvailable')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700">Same Day</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('nextDayAvailable')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700">Next Day</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit" isLoading={submitting}>
              <Plus className="h-4 w-4" />
              Create Zone
            </Button>
          </div>
        </form>
      )}

      {/* Zones table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zone Name</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Postcodes</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Same Day</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Day</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Fee</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Free Threshold</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {zones?.map((zone, idx) => {
                const isEditing = editingId === zone.id && editForm
                return (
                  <tr key={zone.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{zone.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input type="text" value={editForm.postcodes} onChange={(e) => setEditForm({ ...editForm, postcodes: e.target.value })} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                      ) : (
                        <span className="text-gray-700 text-xs">{Array.isArray(zone.postcodes) ? zone.postcodes.join(', ') : zone.postcodes}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <input type="checkbox" checked={editForm.sameDayAvailable} onChange={(e) => setEditForm({ ...editForm, sameDayAvailable: e.target.checked })} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer" />
                      ) : zone.sameDayAvailable ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600"><Check className="h-3.5 w-3.5" /></span>
                      ) : (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-400"><X className="h-3.5 w-3.5" /></span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <input type="checkbox" checked={editForm.nextDayAvailable} onChange={(e) => setEditForm({ ...editForm, nextDayAvailable: e.target.checked })} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer" />
                      ) : zone.nextDayAvailable ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600"><Check className="h-3.5 w-3.5" /></span>
                      ) : (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-400"><X className="h-3.5 w-3.5" /></span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input type="number" step="0.01" value={editForm.deliveryFee} onChange={(e) => setEditForm({ ...editForm, deliveryFee: e.target.value })} className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                      ) : (
                        <span className="font-medium text-gray-900">{formatPrice(zone.deliveryFee)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input type="number" step="0.01" value={editForm.freeDeliveryThreshold} onChange={(e) => setEditForm({ ...editForm, freeDeliveryThreshold: e.target.value })} className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                      ) : (
                        <span className="text-gray-700">{zone.freeDeliveryThreshold ? formatPrice(zone.freeDeliveryThreshold) : '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => !isEditing && handleToggleActive(zone)} className="cursor-pointer">
                        {(isEditing ? editForm.isActive : zone.isActive) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Inactive</span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={saveEdit} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">
                            <Save className="h-3.5 w-3.5" />Save
                          </button>
                          <button onClick={cancelEdit} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => startEdit(zone)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            <Pencil className="h-3.5 w-3.5" />Edit
                          </button>
                          {deleteConfirmId === zone.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(zone.id)} className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Confirm</button>
                              <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirmId(zone.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {(!zones || zones.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <p className="text-muted-foreground text-sm">No delivery zones configured. Click &quot;Add Zone&quot; to create one.</p>
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
