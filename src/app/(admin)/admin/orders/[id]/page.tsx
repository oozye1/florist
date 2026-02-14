'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Mail,
  RefreshCcw,
  ChevronDown,
  ClipboardList,
  Package,
  Truck,
  CheckCircle2,
  User,
  MapPin,
  Gift,
  MessageSquare,
  CreditCard,
} from 'lucide-react'
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/constants'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// --------------------------------------------------
// Sample order detail
// --------------------------------------------------

const ORDER = {
  id: 'ord-001',
  orderNumber: 'LB-20260214-001',
  status: 'confirmed' as const,
  paymentStatus: 'paid' as const,
  createdAt: '2026-02-14T09:23:00Z',
  items: [
    {
      productId: 'prod-001',
      productName: 'Velvet Red Romance',
      productImage: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&q=80',
      variantName: 'Deluxe (24 stems)',
      quantity: 1,
      unitPrice: 134.99,
      totalPrice: 134.99,
    },
    {
      productId: 'prod-014',
      productName: 'Chocolate & Blooms',
      productImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
      variantName: 'Standard',
      quantity: 1,
      unitPrice: 69.99,
      totalPrice: 69.99,
    },
  ],
  subtotal: 204.98,
  deliveryFee: 5.99,
  discountAmount: 0,
  total: 210.97,
  customer: {
    name: 'Emily Thompson',
    email: 'emily.thompson@email.com',
    phone: '07712 345678',
  },
  delivery: {
    recipientName: 'Michael Thompson',
    address: {
      line1: '42 Rose Garden Lane',
      line2: 'Primrose Hill',
      city: 'London',
      postcode: 'NW1 8YL',
      country: 'United Kingdom',
    },
    deliveryType: 'same_day',
    deliveryDate: '2026-02-14',
    giftMessage: 'Happy Valentine\'s Day, darling! All my love, forever and always. - Emily',
    deliveryInstructions: 'Please ring the doorbell. If no answer, leave with neighbour at 44.',
  },
  notes: '',
}

// --------------------------------------------------
// Status timeline steps
// --------------------------------------------------

const TIMELINE_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: ClipboardList },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

function getStepState(stepKey: string, currentStatus: string) {
  const statusOrder = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']
  const currentIdx = statusOrder.indexOf(currentStatus)
  const stepIdx = statusOrder.indexOf(stepKey)

  if (currentStatus === 'cancelled') return 'cancelled'
  if (stepIdx < currentIdx) return 'completed'
  if (stepIdx === currentIdx) return 'active'
  return 'upcoming'
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminOrderDetailPage() {
  const [adminNotes, setAdminNotes] = useState(ORDER.notes || '')
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string>(ORDER.status)

  const statusInfo = ORDER_STATUSES[currentStatus]
  const paymentInfo = PAYMENT_STATUSES[ORDER.paymentStatus]

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus)
    setStatusDropdownOpen(false)
    // In a real app, this would update Firestore
  }

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {ORDER.orderNumber}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Placed on {formatDate(ORDER.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color}`}>
              {statusInfo?.label}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentInfo?.color}`}>
              {paymentInfo?.label}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Status timeline */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h2>
        <div className="flex items-center justify-between">
          {TIMELINE_STEPS.map((step, idx) => {
            const state = getStepState(step.key, currentStatus)
            const Icon = step.icon
            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative">
                {/* Connector line */}
                {idx > 0 && (
                  <div
                    className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${
                      state === 'completed' || state === 'active'
                        ? 'bg-primary'
                        : 'bg-gray-200'
                    }`}
                  />
                )}

                {/* Icon circle */}
                <div
                  className={`
                    relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                    transition-colors
                    ${
                      state === 'completed'
                        ? 'bg-primary text-white'
                        : state === 'active'
                          ? 'bg-primary text-white ring-4 ring-primary/20'
                          : state === 'cancelled'
                            ? 'bg-red-100 text-red-400'
                            : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium mt-2 text-center ${
                    state === 'completed' || state === 'active'
                      ? 'text-gray-900'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main grid: items + sidebar */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="xl:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Variant
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ORDER.items.map((item) => (
                    <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <span className="font-medium text-gray-900">{item.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.variantName || '-'}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{formatPrice(item.unitPrice)}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">{formatPrice(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order totals */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex flex-col items-end gap-2">
                <div className="flex justify-between w-60 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-gray-700">{formatPrice(ORDER.subtotal)}</span>
                </div>
                <div className="flex justify-between w-60 text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-gray-700">{formatPrice(ORDER.deliveryFee)}</span>
                </div>
                {ORDER.discountAmount > 0 && (
                  <div className="flex justify-between w-60 text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">-{formatPrice(ORDER.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between w-60 text-base font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(ORDER.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Admin Notes</h2>
            </div>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this order..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => alert('Notes saved (demo)')}>
                Save Notes
              </Button>
            </div>
          </div>
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Action buttons */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>

            {/* Update status dropdown */}
            <div className="relative">
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors"
              >
                Update Status
                <ChevronDown className={`h-4 w-4 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {statusDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusChange(key)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        currentStatus === key ? 'bg-primary/5 font-medium' : ''
                      }`}
                    >
                      <span>{value.label}</span>
                      {currentStatus === key && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
              <Mail className="h-4 w-4" />
              Send Email
            </button>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg font-medium text-sm hover:bg-red-50 transition-colors">
              <RefreshCcw className="h-4 w-4" />
              Issue Refund
            </button>
          </div>

          {/* Customer information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">Name</span>
                <span className="text-gray-900 font-medium">{ORDER.customer.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">Email</span>
                <a href={`mailto:${ORDER.customer.email}`} className="text-primary hover:underline">
                  {ORDER.customer.email}
                </a>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">Phone</span>
                <span className="text-gray-900">{ORDER.customer.phone}</span>
              </div>
            </div>
          </div>

          {/* Delivery information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Delivery</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">Recipient</span>
                <span className="text-gray-900 font-medium">{ORDER.delivery.recipientName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">Address</span>
                <div className="text-gray-700">
                  <p>{ORDER.delivery.address.line1}</p>
                  {ORDER.delivery.address.line2 && <p>{ORDER.delivery.address.line2}</p>}
                  <p>{ORDER.delivery.address.city}</p>
                  <p>{ORDER.delivery.address.postcode}</p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">Delivery Type</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Same Day
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">Delivery Date</span>
                <span className="text-gray-900">{formatDate(ORDER.delivery.deliveryDate)}</span>
              </div>
              {ORDER.delivery.deliveryInstructions && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">Instructions</span>
                  <p className="text-gray-700 italic">{ORDER.delivery.deliveryInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Gift message */}
          {ORDER.delivery.giftMessage && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-pink-400" />
                <h2 className="text-lg font-semibold text-gray-900">Gift Message</h2>
              </div>
              <div className="bg-pink-50 border border-pink-100 rounded-lg p-4">
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  &ldquo;{ORDER.delivery.giftMessage}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Payment info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentInfo?.color}`}>
                  {paymentInfo?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="text-gray-900">Stripe</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-900">Total Charged</span>
                <span className="text-gray-900">{formatPrice(ORDER.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
