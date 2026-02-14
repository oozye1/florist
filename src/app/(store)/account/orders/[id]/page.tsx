'use client'

import Link from 'next/link'
import { ArrowLeft, Check, Package, Truck, Home } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const ORDER = {
  id: 'ord-003',
  orderNumber: 'LB-20260214-001',
  status: 'confirmed',
  paymentStatus: 'paid',
  total: 249.99,
  subtotal: 249.99,
  deliveryFee: 0,
  discountAmount: 0,
  createdAt: '2026-02-14T08:00:00Z',
  deliveryDate: '2026-02-15',
  deliveryType: 'next_day',
  items: [
    {
      productName: 'The Grand Gesture',
      productImage: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=200&q=80',
      variantName: 'Classic Red',
      quantity: 1,
      unitPrice: 249.99,
      totalPrice: 249.99,
    },
  ],
  recipientName: 'Emma Watson',
  deliveryAddress: {
    line1: '10 Downing Street',
    city: 'London',
    postcode: 'SW1A 2AA',
  },
  giftMessage: 'Happy Valentine\'s Day, my love! You mean the world to me.',
  billingName: 'John Smith',
  billingEmail: 'john@example.com',
}

const TIMELINE_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'preparing', label: 'Preparing', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
]

export default function OrderDetailPage() {
  const statusIndex = TIMELINE_STEPS.findIndex((s) => s.key === ORDER.status)
  const status = ORDER_STATUSES[ORDER.status]

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-2xl">{ORDER.orderNumber}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Placed {formatDate(ORDER.createdAt)}
          </p>
        </div>
        <span className={cn('text-sm font-medium px-3 py-1 rounded-full', status?.color)}>
          {status?.label}
        </span>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h3 className="font-medium mb-6">Order Progress</h3>
        <div className="flex items-center justify-between relative">
          {/* Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all"
            style={{
              width: `${(statusIndex / (TIMELINE_STEPS.length - 1)) * 100}%`,
            }}
          />

          {TIMELINE_STEPS.map((step, i) => {
            const Icon = step.icon
            const isCompleted = i <= statusIndex
            const isCurrent = i === statusIndex
            return (
              <div key={step.key} className="relative flex flex-col items-center z-10">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={cn(
                    'text-xs mt-2',
                    isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-medium mb-4">Items</h3>
          {ORDER.items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                {item.variantName && (
                  <p className="text-sm text-muted-foreground">{item.variantName}</p>
                )}
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
          <div className="border-t mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(ORDER.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{ORDER.deliveryFee === 0 ? 'FREE' : formatPrice(ORDER.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(ORDER.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-medium mb-4">Delivery Details</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{ORDER.recipientName}</p>
              <p className="text-muted-foreground">{ORDER.deliveryAddress.line1}</p>
              <p className="text-muted-foreground">
                {ORDER.deliveryAddress.city}, {ORDER.deliveryAddress.postcode}
              </p>
              <p className="text-muted-foreground mt-3">
                Delivery: {formatDate(ORDER.deliveryDate)}
              </p>
            </div>
          </div>

          {ORDER.giftMessage && (
            <div className="bg-accent/30 rounded-xl border border-accent p-6">
              <h3 className="font-medium mb-2">Gift Message</h3>
              <p className="text-sm italic text-muted-foreground">
                &ldquo;{ORDER.giftMessage}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
