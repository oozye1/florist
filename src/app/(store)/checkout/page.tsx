'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Lock, CreditCard, Truck, Gift } from 'lucide-react'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, deliveryFee, discountAmount, couponCode, getSubtotal, getTotal, clearCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    billingName: '',
    billingEmail: '',
    billingPhone: '',
    billingLine1: '',
    billingLine2: '',
    billingCity: '',
    billingPostcode: '',
    recipientName: '',
    recipientPhone: '',
    deliveryLine1: '',
    deliveryLine2: '',
    deliveryCity: '',
    deliveryPostcode: '',
    deliveryInstructions: '',
    sameAsDelivery: true,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  const subtotal = getSubtotal()
  const deliveryCharge = subtotal >= 50 ? 0 : 4.99
  const total = getTotal() + deliveryCharge

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          deliveryFee: deliveryCharge,
          discountAmount,
          couponCode,
          billingName: form.billingName,
          billingEmail: form.billingEmail,
          billingPhone: form.billingPhone,
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone,
          deliveryAddress: {
            line1: form.deliveryLine1,
            line2: form.deliveryLine2,
            city: form.deliveryCity,
            postcode: form.deliveryPostcode,
          },
          deliveryInstructions: form.deliveryInstructions,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        clearCart()
        window.location.href = data.url
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cart" className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif text-3xl">Checkout</h1>
        <div className="flex items-center gap-1 ml-auto text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          Secure Checkout
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          {/* Delivery Address */}
          <section className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Delivery Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="recipientName">Recipient Name *</Label>
                <Input
                  id="recipientName"
                  name="recipientName"
                  value={form.recipientName}
                  onChange={handleChange}
                  required
                  placeholder="Who are the flowers for?"
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="recipientPhone">Recipient Phone</Label>
                <Input
                  id="recipientPhone"
                  name="recipientPhone"
                  value={form.recipientPhone}
                  onChange={handleChange}
                  placeholder="For delivery updates"
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="deliveryLine1">Address Line 1 *</Label>
                <Input
                  id="deliveryLine1"
                  name="deliveryLine1"
                  value={form.deliveryLine1}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="deliveryLine2">Address Line 2</Label>
                <Input
                  id="deliveryLine2"
                  name="deliveryLine2"
                  value={form.deliveryLine2}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="deliveryCity">City *</Label>
                <Input
                  id="deliveryCity"
                  name="deliveryCity"
                  value={form.deliveryCity}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="deliveryPostcode">Postcode *</Label>
                <Input
                  id="deliveryPostcode"
                  name="deliveryPostcode"
                  value={form.deliveryPostcode}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                <Textarea
                  id="deliveryInstructions"
                  name="deliveryInstructions"
                  value={form.deliveryInstructions}
                  onChange={handleChange}
                  placeholder="E.g., Leave with neighbour, ring doorbell twice..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </section>

          {/* Billing Details */}
          <section className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Your Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billingName">Your Full Name *</Label>
                <Input
                  id="billingName"
                  name="billingName"
                  value={form.billingName}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingEmail">Email Address *</Label>
                <Input
                  id="billingEmail"
                  name="billingEmail"
                  type="email"
                  value={form.billingEmail}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="billingPhone">Phone Number</Label>
                <Input
                  id="billingPhone"
                  name="billingPhone"
                  value={form.billingPhone}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-serif text-xl">Order Summary</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-3"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{deliveryCharge === 0 ? <span className="text-primary font-medium">FREE</span> : formatPrice(deliveryCharge)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
              <Lock className="w-4 h-4" />
              Pay {formatPrice(total)}
            </Button>

            <div className="flex items-center justify-center gap-4 pt-2">
              <span className="text-xs text-muted-foreground">Secured by</span>
              <span className="text-xs font-bold text-gray-600">Stripe</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
