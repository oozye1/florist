'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">
        Something went wrong
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        We apologise for the inconvenience. Please try again or return to the homepage.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
