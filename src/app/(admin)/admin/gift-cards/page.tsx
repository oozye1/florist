'use client'

import { useState, useMemo } from 'react'
import { Plus, Trash2, Gift, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import {
  getAllGiftCards,
  createGiftCard,
  updateGiftCard,
  deleteGiftCard,
} from '@/lib/firebase/services/gift-cards'
import { formatPrice } from '@/lib/utils'
import { relativeTime } from '@/lib/admin-utils'
import type { GiftCard } from '@/types'

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'used', label: 'Fully Used' },
  { key: 'inactive', label: 'Inactive' },
]

export default function AdminGiftCardsPage() {
  const { data: giftCards, loading, refetch } = useFirestoreQuery<GiftCard[]>(getAllGiftCards, [])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    recipientName: '',
    recipientEmail: '',
    message: '',
  })

  const handleCreateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setSubmitting(true)
    try {
      const result = await createGiftCard({
        initialBalance: amount,
        currentBalance: amount,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        message: formData.message,
        isActive: true,
      })
      toast.success(`Gift card ${result.code} created for ${formatPrice(amount)}`)
      setFormData({ amount: '', recipientName: '', recipientEmail: '', message: '' })
      setShowForm(false)
      refetch()
    } catch {
      toast.error('Failed to create gift card')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (card: GiftCard) => {
    try {
      await updateGiftCard(card.id, { isActive: !card.isActive })
      refetch()
    } catch {
      toast.error('Failed to update gift card')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteGiftCard(id)
      toast.success('Gift card deleted')
      setDeleteConfirmId(null)
      refetch()
    } catch {
      toast.error('Failed to delete gift card')
    }
  }

  const filteredCards = useMemo(() => {
    if (!giftCards) return []
    return giftCards.filter((c) => {
      if (activeTab === 'active') return c.isActive && c.currentBalance > 0
      if (activeTab === 'used') return c.currentBalance <= 0
      if (activeTab === 'inactive') return !c.isActive
      return true
    })
  }, [giftCards, activeTab])

  const totalValue = giftCards?.reduce((sum, c) => sum + c.currentBalance, 0) || 0
  const activeCount = giftCards?.filter((c) => c.isActive && c.currentBalance > 0).length || 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gift Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading gift cards...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Gift Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {giftCards?.length ?? 0} gift cards &middot; {activeCount} active &middot; {formatPrice(totalValue)} outstanding balance
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Create Gift Card'}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreateGiftCard} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Gift Card</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (£) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                placeholder="50.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                value={formData.recipientName}
                onChange={(e) => setFormData((p) => ({ ...p, recipientName: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData((p) => ({ ...p, recipientEmail: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                value={formData.message}
                onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit" isLoading={submitting}>
              <Plus className="h-4 w-4" />
              Create Gift Card
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
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gift cards table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recipient</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCards.map((card, idx) => {
                const usagePercent = card.initialBalance > 0
                  ? ((card.initialBalance - card.currentBalance) / card.initialBalance) * 100
                  : 0
                return (
                  <tr key={card.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-gray-400" />
                        <span className="font-mono font-bold text-gray-900">{card.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="font-medium text-gray-900">{formatPrice(card.currentBalance)}</span>
                        <span className="text-muted-foreground"> / {formatPrice(card.initialBalance)}</span>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${usagePercent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {card.recipientName || card.recipientEmail || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {relativeTime(card.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleActive(card)} className="cursor-pointer">
                        {card.isActive && card.currentBalance > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                        ) : card.currentBalance <= 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Used</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Inactive</span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {deleteConfirmId === card.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleDelete(card.id)} className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Confirm</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(card.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredCards.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-muted-foreground text-sm">No gift cards found. Click &quot;Create Gift Card&quot; to create one.</p>
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
