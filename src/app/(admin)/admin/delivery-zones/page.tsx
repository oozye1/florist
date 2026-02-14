'use client'

import { useState } from 'react'
import { MapPin, Save, X, Pencil, Check } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

// --------------------------------------------------
// Types & sample data
// --------------------------------------------------

interface DeliveryZone {
  id: string
  name: string
  postcodes: string
  sameDay: boolean
  nextDay: boolean
  deliveryFee: number
  freeDeliveryThreshold: number
  isActive: boolean
}

const INITIAL_ZONES: DeliveryZone[] = [
  {
    id: 'zone-001',
    name: 'London',
    postcodes: 'E, EC, N, NW, SE, SW, W, WC',
    sameDay: true,
    nextDay: true,
    deliveryFee: 5.99,
    freeDeliveryThreshold: 50,
    isActive: true,
  },
  {
    id: 'zone-002',
    name: 'South East',
    postcodes: 'BR, CR, DA, KT, SM, TW, GU, RH, TN, ME, CT, BN',
    sameDay: true,
    nextDay: true,
    deliveryFee: 7.99,
    freeDeliveryThreshold: 60,
    isActive: true,
  },
  {
    id: 'zone-003',
    name: 'Midlands',
    postcodes: 'B, CV, DE, DY, LE, NG, NN, ST, WS, WV',
    sameDay: false,
    nextDay: true,
    deliveryFee: 8.99,
    freeDeliveryThreshold: 75,
    isActive: true,
  },
  {
    id: 'zone-004',
    name: 'North West',
    postcodes: 'BB, BL, CA, CH, CW, FY, L, LA, M, OL, PR, SK, WA, WN',
    sameDay: false,
    nextDay: true,
    deliveryFee: 9.99,
    freeDeliveryThreshold: 75,
    isActive: true,
  },
  {
    id: 'zone-005',
    name: 'Scotland',
    postcodes: 'AB, DD, DG, EH, FK, G, IV, KA, KW, KY, ML, PA, PH, TD, ZE',
    sameDay: false,
    nextDay: false,
    deliveryFee: 12.99,
    freeDeliveryThreshold: 100,
    isActive: false,
  },
]

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>(INITIAL_ZONES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<DeliveryZone | null>(null)

  const startEdit = (zone: DeliveryZone) => {
    setEditingId(zone.id)
    setEditForm({ ...zone })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const saveEdit = () => {
    if (!editForm) return
    setZones((prev) =>
      prev.map((z) => (z.id === editForm.id ? editForm : z))
    )
    setEditingId(null)
    setEditForm(null)
    toast.success(`Delivery zone "${editForm.name}" updated successfully.`)
  }

  const toggleZoneActive = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId ? { ...z, isActive: !z.isActive } : z
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage delivery areas, fees, and availability ({zones.length} zones)
        </p>
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
          <p className="text-2xl font-bold text-gray-900">{zones.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Same-Day Zones</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
              <Check className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {zones.filter((z) => z.sameDay && z.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Active Zones</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {zones.filter((z) => z.isActive).length}
          </p>
        </div>
      </div>

      {/* Zones table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Zone Name
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Postcodes
                </th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Same Day
                </th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Next Day
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Delivery Fee
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Free Threshold
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
              {zones.map((zone, idx) => {
                const isEditing = editingId === zone.id && editForm
                return (
                  <tr
                    key={zone.id}
                    className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                  >
                    {/* Zone Name */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{zone.name}</span>
                        </div>
                      )}
                    </td>

                    {/* Postcodes */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.postcodes}
                          onChange={(e) => setEditForm({ ...editForm, postcodes: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      ) : (
                        <span className="text-gray-700 text-xs">{zone.postcodes}</span>
                      )}
                    </td>

                    {/* Same Day */}
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editForm.sameDay}
                          onChange={(e) => setEditForm({ ...editForm, sameDay: e.target.checked })}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                        />
                      ) : (
                        <span>
                          {zone.sameDay ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-400">
                              <X className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </span>
                      )}
                    </td>

                    {/* Next Day */}
                    <td className="px-6 py-4 text-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editForm.nextDay}
                          onChange={(e) => setEditForm({ ...editForm, nextDay: e.target.checked })}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                        />
                      ) : (
                        <span>
                          {zone.nextDay ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-400">
                              <X className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </span>
                      )}
                    </td>

                    {/* Delivery Fee */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.deliveryFee}
                          onChange={(e) => setEditForm({ ...editForm, deliveryFee: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{formatPrice(zone.deliveryFee)}</span>
                      )}
                    </td>

                    {/* Free Delivery Threshold */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.freeDeliveryThreshold}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      ) : (
                        <span className="text-gray-700">{formatPrice(zone.freeDeliveryThreshold)}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <button onClick={() => !isEditing && toggleZoneActive(zone.id)} className="cursor-pointer">
                        {(isEditing ? editForm.isActive : zone.isActive) ? (
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
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(zone)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
