'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Gift,
  Tag,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'

export default function CartPage() {
  const {
    items,
    deliveryFee,
    couponCode,
    discountAmount,
    removeItem,
    updateQuantity,
    setGiftMessage,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getTotal,
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
        <h1 className="font-serif text-3xl mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven&apos;t added any beautiful blooms yet.
        </p>
        <Link href="/products">
          <Button size="lg">Browse Our Collection</Button>
        </Link>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const total = getTotal()
  const freeDeliveryRemaining = Math.max(0, 50 - subtotal)

  function handleApplyCoupon() {
    if (!couponInput.trim()) return
    // In production, validate against Firestore
    if (couponInput.toUpperCase() === 'WELCOME15') {
      const discount = subtotal * 0.15
      applyCoupon('WELCOME15', discount)
      toast.success('Coupon applied! 15% off your order.')
    } else {
      toast.error('Invalid coupon code.')
    }
    setCouponInput('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products" className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif text-3xl">Shopping Cart</h1>
        <span className="text-muted-foreground">
          ({items.length} item{items.length !== 1 ? 's' : ''})
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Delivery Progress */}
          {freeDeliveryRemaining > 0 && (
            <div className="bg-primary/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-primary mb-2">
                <Truck className="w-4 h-4" />
                <span>
                  Add {formatPrice(freeDeliveryRemaining)} more for{' '}
                  <strong>FREE delivery</strong>
                </span>
              </div>
              <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex gap-4 p-4 bg-white rounded-xl border border-border"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="text-sm text-muted-foreground">
                        {item.variantName}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity - 1,
                          item.variantId
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-input hover:bg-muted"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity + 1,
                          item.variantId
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-input hover:bg-muted"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Gift Message */}
                {item.giftMessage && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground bg-accent/30 p-2 rounded">
                    <Gift className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{item.giftMessage}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-serif text-xl">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>
                  {subtotal >= 50 ? (
                    <span className="text-primary font-medium">FREE</span>
                  ) : (
                    formatPrice(4.99)
                  )}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Discount ({couponCode})
                    <button
                      onClick={removeCoupon}
                      className="text-xs underline ml-1"
                    >
                      Remove
                    </button>
                  </span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(total + (subtotal < 50 ? 4.99 : 0))}
                </span>
              </div>
            </div>

            {/* Coupon Code */}
            {!couponCode && (
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyCoupon}
                  className="flex-shrink-0"
                >
                  Apply
                </Button>
              </div>
            )}

            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full">
                Proceed to Checkout
              </Button>
            </Link>

            <p className="text-xs text-center text-muted-foreground">
              Secure checkout powered by Stripe. Your payment information is
              encrypted and protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
