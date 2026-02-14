'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Gift, Heart, Mail, CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const AMOUNTS = [25, 50, 75, 100]

export default function GiftCardsPage() {
  const [selectedAmount, setSelectedAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    senderName: '',
    senderEmail: '',
    recipientName: '',
    recipientEmail: '',
    message: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const finalAmount = useCustom ? parseFloat(customAmount) || 0 : selectedAmount

  async function handlePurchase(e: React.FormEvent) {
    e.preventDefault()

    if (finalAmount < 5 || finalAmount > 500) {
      toast.error('Amount must be between £5 and £500')
      return
    }

    if (!form.senderEmail) {
      toast.error('Your email is required')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/gift-cards/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          ...form,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout')

      if (data.url) window.location.href = data.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-accent py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Gift className="w-12 h-12 text-secondary mx-auto mb-6" />
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Gift Cards</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let them choose their own beautiful blooms. Our gift cards are
            delivered instantly and never expire.
          </p>
        </div>
      </section>

      {/* Purchase Form */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <form onSubmit={handlePurchase}>
          {/* Choose Amount */}
          <h2 className="font-serif text-2xl text-center mb-8">Choose an Amount</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-4">
            {AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount)
                  setUseCustom(false)
                }}
                className={`p-6 rounded-xl border-2 transition-all text-center group cursor-pointer ${
                  !useCustom && selectedAmount === amount
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-white hover:border-primary hover:shadow-md'
                }`}
              >
                <p className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">
                  &pound;{amount}
                </p>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <button
              type="button"
              onClick={() => setUseCustom(!useCustom)}
              className="text-sm text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {useCustom ? 'Choose a preset amount' : 'Enter a custom amount'}
            </button>
            {useCustom && (
              <div className="mt-3 max-w-xs mx-auto">
                <Input
                  type="number"
                  min="5"
                  max="500"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount (£5 - £500)"
                  className="text-center text-lg"
                />
              </div>
            )}
          </div>

          {/* Recipient & Sender Details */}
          <div className="max-w-2xl mx-auto space-y-8 mb-12">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-serif text-xl mb-4">Your Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senderName">Your Name</Label>
                  <Input
                    id="senderName"
                    name="senderName"
                    value={form.senderName}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="senderEmail">Your Email *</Label>
                  <Input
                    id="senderEmail"
                    name="senderEmail"
                    type="email"
                    value={form.senderEmail}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-serif text-xl mb-4">Recipient Details</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    name="recipientName"
                    value={form.recipientName}
                    onChange={handleChange}
                    placeholder="Their name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="recipientEmail">Recipient Email</Label>
                  <Input
                    id="recipientEmail"
                    name="recipientEmail"
                    type="email"
                    value={form.recipientEmail}
                    onChange={handleChange}
                    placeholder="their@email.com"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="message">Personal Message</Label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Add a heartfelt message..."
                  rows={3}
                  className="mt-1 flex w-full rounded-lg border border-input bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                />
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto text-center">
            <Button type="submit" size="xl" className="w-full" disabled={isLoading || finalAmount < 5}>
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Purchase Gift Card — &pound;{finalAmount > 0 ? finalAmount.toFixed(2) : '0.00'}
                </>
              )}
            </Button>
          </div>
        </form>
      </section>

      {/* Features */}
      <section className="bg-muted py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Mail, title: 'Instant Delivery', desc: 'Gift card code shown immediately after purchase.' },
              { icon: Heart, title: 'Personal Touch', desc: 'Add a heartfelt message to make it special.' },
              { icon: Gift, title: 'Never Expires', desc: 'No rush — they can redeem whenever they wish.' },
            ].map((item) => (
              <div key={item.title}>
                <item.icon className="w-8 h-8 text-secondary mx-auto mb-4" />
                <h3 className="font-serif text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
