'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  User,
  MapPin,
  Gift,
  MessageSquare,
  CreditCard,
  Package,
  Tag,
  Star,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'
import { ORDER_STATUSES, PAYMENT_STATUSES, DELIVERY_TYPES } from '@/lib/constants'
import { formatPrice, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { getOrder, updateOrderStatus, updatePaymentStatus, updateOrder } from '@/lib/firebase/services/orders'
import { safeTimestamp, relativeTime } from '@/lib/admin-utils'
import { Button } from '@/components/ui/button'
import type { Order, OrderStatus, PaymentStatus } from '@/types'

// --------------------------------------------------
// Loading skeleton
// --------------------------------------------------

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back + header */}
      <div>
        <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-56 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-20 bg-gray-200 rounded-full" />
            <div className="h-7 w-20 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-4">
                <div className="h-14 w-14 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
            <div className="h-24 w-full bg-gray-100 rounded-lg" />
          </div>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="h-6 w-28 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-3/4 bg-gray-100 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('')
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus | ''>('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingPayment, setUpdatingPayment] = useState(false)

  const [adminNotes, setAdminNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Fetch order
  useEffect(() => {
    let cancelled = false

    async function fetchOrder() {
      setLoading(true)
      setError(null)
      try {
        const data = await getOrder(id)
        if (cancelled) return
        if (!data) {
          setError('Order not found')
        } else {
          setOrder(data)
          setNewStatus(data.status)
          setNewPaymentStatus(data.paymentStatus)
          setAdminNotes(data.notes || '')
        }
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOrder()
    return () => {
      cancelled = true
    }
  }, [id])

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!order || !newStatus || newStatus === order.status) return
    setUpdatingStatus(true)
    try {
      await updateOrderStatus(id, newStatus)
      setOrder((prev) => prev ? { ...prev, status: newStatus } : prev)
      toast.success(`Order status updated to ${ORDER_STATUSES[newStatus]?.label || newStatus}`)
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Handle payment status update
  const handlePaymentStatusUpdate = async () => {
    if (!order || !newPaymentStatus || newPaymentStatus === order.paymentStatus) return
    setUpdatingPayment(true)
    try {
      await updatePaymentStatus(id, newPaymentStatus)
      setOrder((prev) => prev ? { ...prev, paymentStatus: newPaymentStatus } : prev)
      toast.success(`Payment status updated to ${PAYMENT_STATUSES[newPaymentStatus]?.label || newPaymentStatus}`)
    } catch {
      toast.error('Failed to update payment status')
    } finally {
      setUpdatingPayment(false)
    }
  }

  // Handle notes save
  const handleSaveNotes = async () => {
    if (!order) return
    setSavingNotes(true)
    try {
      await updateOrder(id, { notes: adminNotes })
      setOrder((prev) => prev ? { ...prev, notes: adminNotes } : prev)
      toast.success('Admin notes saved')
    } catch {
      toast.error('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  // Loading state
  if (loading) {
    return <OrderDetailSkeleton />
  }

  // Not found state
  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {error || 'The order you are looking for does not exist or has been removed.'}
          </p>
          <Link href="/admin/orders">
            <Button variant="outline">View all orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = ORDER_STATUSES[order.status]
  const paymentInfo = PAYMENT_STATUSES[order.paymentStatus]
  const deliveryTypeInfo = DELIVERY_TYPES[order.deliveryType as keyof typeof DELIVERY_TYPES]

  const formatAddress = (address: Order['deliveryAddress']) => {
    if (!address) return 'N/A'
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.county,
      address.postcode,
      address.country,
    ].filter(Boolean)
    return parts.join(', ')
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
            <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Placed {relativeTime(order.createdAt)} &middot; {formatDate(safeTimestamp(order.createdAt))}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                statusInfo?.color
              )}
            >
              {statusInfo?.label}
            </span>
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                paymentInfo?.color
              )}
            >
              {paymentInfo?.label}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main grid: items + sidebar */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="xl:col-span-2 space-y-6">
          {/* Status update + Payment status update */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Order</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order status */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Order Status</label>
                <div className="flex gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
                  >
                    {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={handleStatusUpdate}
                    disabled={updatingStatus || newStatus === order.status}
                    isLoading={updatingStatus}
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Payment status */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Payment Status</label>
                <div className="flex gap-2">
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
                  >
                    {Object.entries(PAYMENT_STATUSES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={handlePaymentStatusUpdate}
                    disabled={updatingPayment || newPaymentStatus === order.paymentStatus}
                    isLoading={updatingPayment}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Order items table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Items ({order.items.length})
              </h2>
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
                  {order.items.map((item, idx) => (
                    <tr key={`${item.productId}-${idx}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.productImage ? (
                              <Image
                                src={item.productImage}
                                alt={item.productName}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{item.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.variantName || '-'}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{formatPrice(item.unitPrice)}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatPrice(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Price summary */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex flex-col items-end gap-2">
                <div className="flex justify-between w-64 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-gray-700">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between w-64 text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-gray-700">
                    {order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Free'}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between w-64 text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between w-64 text-base font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
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
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                isLoading={savingNotes}
              >
                <Save className="h-4 w-4" />
                Save Notes
              </Button>
            </div>
          </div>
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Customer information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">
                  Name
                </span>
                <span className="text-gray-900 font-medium">{order.billingName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">
                  Email
                </span>
                <a href={`mailto:${order.billingEmail}`} className="text-primary hover:underline">
                  {order.billingEmail}
                </a>
              </div>
              {order.billingPhone && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">
                    Phone
                  </span>
                  <span className="text-gray-900">{order.billingPhone}</span>
                </div>
              )}
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
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">
                  Recipient
                </span>
                <span className="text-gray-900 font-medium">{order.recipientName}</span>
              </div>
              {order.recipientPhone && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">
                    Recipient Phone
                  </span>
                  <span className="text-gray-900">{order.recipientPhone}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">
                  Address
                </span>
                <div className="text-gray-700">
                  {order.deliveryAddress && (
                    <>
                      <p>{order.deliveryAddress.line1}</p>
                      {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
                      <p>{order.deliveryAddress.city}</p>
                      {order.deliveryAddress.county && <p>{order.deliveryAddress.county}</p>}
                      <p>{order.deliveryAddress.postcode}</p>
                      <p>{order.deliveryAddress.country}</p>
                    </>
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">
                  Delivery Type
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {deliveryTypeInfo?.label || order.deliveryType}
                </span>
              </div>
              {order.deliveryDate && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">
                    Delivery Date
                  </span>
                  <span className="text-gray-900">{formatDate(order.deliveryDate)}</span>
                </div>
              )}
              {order.deliveryInstructions && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-0.5">
                    Instructions
                  </span>
                  <p className="text-gray-700 italic">{order.deliveryInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Gift message */}
          {order.giftMessage && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-pink-400" />
                <h2 className="text-lg font-semibold text-gray-900">Gift Message</h2>
              </div>
              <div className="bg-pink-50 border border-pink-100 rounded-lg p-4">
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  &ldquo;{order.giftMessage}&rdquo;
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
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    paymentInfo?.color
                  )}
                >
                  {paymentInfo?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="text-gray-900">Stripe</span>
              </div>
              {order.stripePaymentIntentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="text-gray-900 font-mono text-xs truncate max-w-[160px]" title={order.stripePaymentIntentId}>
                    {order.stripePaymentIntentId}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-medium pt-2 border-t border-gray-100">
                <span className="text-gray-900">Total Charged</span>
                <span className="text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Coupon info */}
          {order.couponCode && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Coupon</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-mono text-sm font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-900">
                    {order.couponCode}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount Applied</span>
                    <span className="text-green-600 font-medium">
                      -{formatPrice(order.discountAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loyalty points */}
          {(order.loyaltyPointsUsed > 0 || order.loyaltyPointsEarned > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <h2 className="text-lg font-semibold text-gray-900">Loyalty Points</h2>
              </div>
              <div className="space-y-3 text-sm">
                {order.loyaltyPointsUsed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Points Used</span>
                    <span className="text-orange-600 font-medium">
                      -{order.loyaltyPointsUsed.toLocaleString()}
                    </span>
                  </div>
                )}
                {order.loyaltyPointsEarned > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Points Earned</span>
                    <span className="text-green-600 font-medium">
                      +{order.loyaltyPointsEarned.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
