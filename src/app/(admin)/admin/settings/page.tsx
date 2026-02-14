'use client'

import { useState } from 'react'
import { Save, Store, Truck, Clock } from 'lucide-react'
import { toast } from 'sonner'

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminSettingsPage() {
  // Store information
  const [storeName, setStoreName] = useState('Love Blooms Florist')
  const [storeEmail, setStoreEmail] = useState('hello@lovebloomsflorist.co.uk')
  const [storePhone, setStorePhone] = useState('+44 20 7123 4567')
  const [storeAddress, setStoreAddress] = useState(
    '42 Bloom Street, Covent Garden, London WC2E 8RF'
  )

  // Delivery settings
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('50')
  const [sameDayCutoff, setSameDayCutoff] = useState('14:00')
  const [nextDayCutoff, setNextDayCutoff] = useState('20:00')

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSaving(false)
    toast.success('Settings saved successfully.')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your store configuration and preferences
        </p>
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
            <p className="text-sm text-muted-foreground">Basic details about your store</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
            <input
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Address</label>
            <input
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Delivery Settings</h2>
            <p className="text-sm text-muted-foreground">Configure delivery thresholds and cutoff times</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Free Delivery Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Free Delivery Threshold (£)
            </label>
            <input
              type="number"
              step="0.01"
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Orders above this amount qualify for free delivery
            </p>
          </div>

          {/* Same-Day Cutoff */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Same-Day Cutoff Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="time"
                value={sameDayCutoff}
                onChange={(e) => setSameDayCutoff(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Orders placed before this time qualify for same-day delivery
            </p>
          </div>

          {/* Next-Day Cutoff */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Next-Day Cutoff Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="time"
                value={nextDayCutoff}
                onChange={(e) => setNextDayCutoff(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Orders placed before this time qualify for next-day delivery
            </p>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  )
}
