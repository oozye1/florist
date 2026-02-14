'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from '@/lib/firebase/services/users'
import type { SavedAddress } from '@/types'
import { toast } from 'sonner'

const EMPTY_FORM = {
  label: 'Home',
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  postcode: '',
  phone: '',
}

export default function AddressesPage() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }
    loadAddresses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  async function loadAddresses() {
    if (!user?.uid) return
    setLoading(true)
    try {
      const data = await getUserAddresses(user.uid)
      setAddresses(data)
    } catch (error) {
      console.error('Error loading addresses:', error)
      toast.error('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  function openAddForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  function openEditForm(address: SavedAddress) {
    setForm({
      label: address.label,
      fullName: address.fullName,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      postcode: address.postcode,
      phone: address.phone || '',
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.uid) return

    setSaving(true)
    try {
      const data = {
        label: form.label,
        fullName: form.fullName,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        postcode: form.postcode,
        phone: form.phone || undefined,
        isDefault: addresses.length === 0,
      }

      if (editingId) {
        await updateUserAddress(user.uid, editingId, data)
        toast.success('Address updated')
      } else {
        await addUserAddress(user.uid, data)
        toast.success('Address added')
      }

      closeForm()
      await loadAddresses()
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(addressId: string) {
    if (!user?.uid) return
    try {
      await deleteUserAddress(user.uid, addressId)
      toast.success('Address deleted')
      await loadAddresses()
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address')
    }
  }

  async function handleSetDefault(addressId: string) {
    if (!user?.uid) return
    try {
      for (const addr of addresses) {
        if (addr.isDefault) {
          await updateUserAddress(user.uid, addr.id, { isDefault: false })
        }
      }
      await updateUserAddress(user.uid, addressId, { isDefault: true })
      toast.success('Default address updated')
      await loadAddresses()
    } catch (error) {
      console.error('Error setting default:', error)
      toast.error('Failed to update default address')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl">Saved Addresses</h2>
        <Button size="sm" onClick={openAddForm}>
          <Plus className="w-4 h-4" />
          Add Address
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button onClick={closeForm}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <select
                id="label"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="line1">Address Line 1</Label>
              <Input
                id="line1"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={form.postcode}
                  onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" size="sm" isLoading={saving}>
                {editingId ? 'Update Address' : 'Save Address'}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">
            No saved addresses yet. Add one to speed up checkout.
          </p>
          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4" />
            Add Address
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-xl p-5 relative ${
                address.isDefault
                  ? 'border-2 border-primary'
                  : 'border border-border'
              }`}
            >
              {address.isDefault && (
                <span className="absolute top-3 right-3 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
              <p className="font-medium">{address.label}</p>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p>{address.fullName}</p>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.city}, {address.postcode}</p>
                {address.phone && <p>{address.phone}</p>}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => openEditForm(address)}
                >
                  Edit
                </button>
                {!address.isDefault && (
                  <button
                    className="text-xs text-primary hover:underline"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set Default
                  </button>
                )}
                <button
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(address.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
