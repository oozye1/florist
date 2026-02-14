'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email address.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (res.status === 409) {
        toast.info("You're already subscribed!")
      } else if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      } else {
        toast.success("You're in! Check your inbox for your 15% discount code.")
      }

      setEmail('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to subscribe')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-accent py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          {/* Heading */}
          <h2 className="font-serif text-3xl font-bold text-accent-foreground sm:text-4xl">
            Stay in Bloom
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-accent-foreground/75">
            Join our mailing list for exclusive offers, seasonal
            inspiration, and 15% off your first order.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 flex-1 rounded-lg border-accent-foreground/20 bg-white text-foreground placeholder:text-muted-foreground focus-visible:ring-accent-foreground"
            />
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="h-12 rounded-lg px-8"
            >
              Subscribe
            </Button>
          </form>

          {/* Privacy Note */}
          <p className="mt-4 text-xs text-accent-foreground/55">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  )
}
