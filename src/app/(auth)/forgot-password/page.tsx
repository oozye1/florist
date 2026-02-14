'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { resetPassword } from '@/lib/firebase/auth'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await resetPassword(email)
      setSent(true)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to send reset email. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h1 className="mb-2 font-serif text-3xl font-bold text-foreground">
          Check your email
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Check your email for a reset link. If you don&apos;t see it, check your spam
          folder.
        </p>
        <Link href="/login">
          <Button variant="outline" size="lg">
            Back to sign in
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-2 text-center font-serif text-3xl font-bold text-foreground">
        Reset your password
      </h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Enter the email address associated with your account and we&apos;ll send you a link
        to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          Send reset link
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
