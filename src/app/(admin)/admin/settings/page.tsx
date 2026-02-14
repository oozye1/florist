'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Save,
  Store,
  Truck,
  Clock,
  CreditCard,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Plus,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { getSettings, updateSettings } from '@/lib/firebase/services/settings'
import { settingsSchema, type SettingsFormData } from '@/lib/validations/admin'

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showStripeSecret, setShowStripeSecret] = useState(false)
  const [showSmtpPass, setShowSmtpPass] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: '',
      storeEmail: '',
      storePhone: '',
      storeAddress: { street: '', city: '', postcode: '', country: 'GB' },
      freeDeliveryThreshold: 50,
      sameDayCutoff: '14:00',
      nextDayCutoff: '23:59',
      stripePublishableKey: '',
      stripeSecretKey: '',
      emailProvider: 'none',
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      sendgridApiKey: '',
      resendApiKey: '',
      fromEmail: '',
      fromName: '',
      adminEmails: [],
    },
  })

  const emailProvider = watch('emailProvider')
  const adminEmails = watch('adminEmails')

  // Load settings on mount
  useEffect(() => {
    async function load() {
      try {
        const settings = await getSettings()
        if (settings) {
          reset({
            storeName: settings.storeName || '',
            storeEmail: settings.storeEmail || '',
            storePhone: settings.storePhone || '',
            storeAddress: {
              street: settings.storeAddress?.street || '',
              city: settings.storeAddress?.city || '',
              postcode: settings.storeAddress?.postcode || '',
              country: settings.storeAddress?.country || 'GB',
            },
            freeDeliveryThreshold: settings.freeDeliveryThreshold ?? 50,
            sameDayCutoff: settings.sameDayCutoff || '14:00',
            nextDayCutoff: settings.nextDayCutoff || '23:59',
            stripePublishableKey: settings.stripePublishableKey || '',
            stripeSecretKey: settings.stripeSecretKey || '',
            emailProvider: settings.emailProvider || 'none',
            smtpHost: settings.smtpHost || '',
            smtpPort: settings.smtpPort ?? 587,
            smtpUser: settings.smtpUser || '',
            smtpPass: settings.smtpPass || '',
            sendgridApiKey: settings.sendgridApiKey || '',
            resendApiKey: settings.resendApiKey || '',
            fromEmail: settings.fromEmail || '',
            fromName: settings.fromName || '',
            adminEmails: settings.adminEmails || [],
          })
        }
      } catch {
        // Settings not configured yet — use defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [reset])

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true)
    try {
      await updateSettings(data)
      toast.success('Settings saved successfully.')
      reset(data)
    } catch {
      toast.error('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const addAdminEmail = () => {
    const email = newAdminEmail.trim().toLowerCase()
    if (!email) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.')
      return
    }
    if (adminEmails.includes(email)) {
      toast.error('This email is already in the list.')
      return
    }
    setValue('adminEmails', [...adminEmails, email], { shouldDirty: true })
    setNewAdminEmail('')
  }

  const removeAdminEmail = (email: string) => {
    setValue(
      'adminEmails',
      adminEmails.filter((e) => e !== email),
      { shouldDirty: true }
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading settings...</p>
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
              <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your store configuration and preferences
          </p>
        </div>
        <Button type="submit" disabled={saving || !isDirty} isLoading={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* ============================== */}
      {/* Store Information */}
      {/* ============================== */}
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
          <div className="space-y-1.5">
            <Label htmlFor="storeName">Store Name *</Label>
            <Input id="storeName" {...register('storeName')} placeholder="Love Blooms Florist" error={errors.storeName?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="storeEmail">Contact Email *</Label>
            <Input id="storeEmail" type="email" {...register('storeEmail')} placeholder="hello@example.com" error={errors.storeEmail?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="storePhone">Phone Number</Label>
            <Input id="storePhone" type="tel" {...register('storePhone')} placeholder="+44 20 7123 4567" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="street">Street Address</Label>
            <Input id="street" {...register('storeAddress.street')} placeholder="42 Bloom Street" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('storeAddress.city')} placeholder="London" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="postcode">Postcode</Label>
            <Input id="postcode" {...register('storeAddress.postcode')} placeholder="WC2E 8RF" />
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* Stripe Configuration */}
      {/* ============================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Stripe Configuration</h2>
            <p className="text-sm text-muted-foreground">Payment processing keys for Stripe</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="stripePublishableKey">Publishable Key</Label>
            <Input
              id="stripePublishableKey"
              {...register('stripePublishableKey')}
              placeholder="pk_live_..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">This key is used on the client side for Stripe Elements.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stripeSecretKey">Secret Key</Label>
            <div className="relative">
              <Input
                id="stripeSecretKey"
                type={showStripeSecret ? 'text' : 'password'}
                {...register('stripeSecretKey')}
                placeholder="sk_live_..."
                className="font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowStripeSecret(!showStripeSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showStripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              This key is used server-side only. Never expose this key publicly.
            </p>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* Email Configuration */}
      {/* ============================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Email Configuration</h2>
            <p className="text-sm text-muted-foreground">Set up email sending for order confirmations and notifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Provider */}
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="emailProvider">Email Provider</Label>
            <div className="relative max-w-xs">
              <select
                id="emailProvider"
                {...register('emailProvider')}
                className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm appearance-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-pointer"
              >
                <option value="none">None (disabled)</option>
                <option value="smtp">SMTP</option>
                <option value="sendgrid">SendGrid</option>
                <option value="resend">Resend</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* From fields (always visible when provider != none) */}
          {emailProvider !== 'none' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input id="fromEmail" type="email" {...register('fromEmail')} placeholder="orders@yourdomain.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fromName">From Name</Label>
                <Input id="fromName" {...register('fromName')} placeholder="Love Blooms Florist" />
              </div>
            </>
          )}

          {/* SMTP fields */}
          {emailProvider === 'smtp' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input id="smtpHost" {...register('smtpHost')} placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input id="smtpPort" type="number" {...register('smtpPort')} placeholder="587" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input id="smtpUser" {...register('smtpUser')} placeholder="your@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="smtpPass">SMTP Password</Label>
                <div className="relative">
                  <Input
                    id="smtpPass"
                    type={showSmtpPass ? 'text' : 'password'}
                    {...register('smtpPass')}
                    placeholder="App password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPass(!showSmtpPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSmtpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SendGrid */}
          {emailProvider === 'sendgrid' && (
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="sendgridApiKey">SendGrid API Key</Label>
              <Input
                id="sendgridApiKey"
                type="password"
                {...register('sendgridApiKey')}
                placeholder="SG.xxxx..."
                className="font-mono text-sm"
              />
            </div>
          )}

          {/* Resend */}
          {emailProvider === 'resend' && (
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="resendApiKey">Resend API Key</Label>
              <Input
                id="resendApiKey"
                type="password"
                {...register('resendApiKey')}
                placeholder="re_xxxx..."
                className="font-mono text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* ============================== */}
      {/* Delivery Settings */}
      {/* ============================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Delivery Settings</h2>
            <p className="text-sm text-muted-foreground">Configure delivery thresholds and cutoff times</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">£</span>
              <Input
                id="freeDeliveryThreshold"
                type="number"
                step="0.01"
                {...register('freeDeliveryThreshold')}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">Orders above this amount qualify for free delivery</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sameDayCutoff">Same-Day Cutoff Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="sameDayCutoff"
                type="time"
                {...register('sameDayCutoff')}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">Orders before this time qualify for same-day</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nextDayCutoff">Next-Day Cutoff Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="nextDayCutoff"
                type="time"
                {...register('nextDayCutoff')}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">Orders before this time qualify for next-day</p>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* Admin Notifications */}
      {/* ============================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Admin Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Email addresses that receive order notifications and alerts
            </p>
          </div>
        </div>

        {/* Current admin emails */}
        <div className="space-y-3 mb-4">
          {adminEmails.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No notification emails configured yet.</p>
          )}
          {adminEmails.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => removeAdminEmail(email)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new email */}
        <div className="flex gap-2">
          <Input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="Add notification email..."
            className="max-w-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addAdminEmail()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addAdminEmail}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Bottom save button */}
      <div className="flex justify-end pb-8">
        <Button type="submit" disabled={saving || !isDirty} isLoading={saving} size="lg">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </form>
  )
}
