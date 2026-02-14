'use client'

import { useState, useMemo } from 'react'
import { Star, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

// --------------------------------------------------
// Types & sample data
// --------------------------------------------------

interface Review {
  id: string
  productName: string
  customerName: string
  rating: number
  text: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    productName: 'Velvet Red Romance',
    customerName: 'Emily Thompson',
    rating: 5,
    text: 'Absolutely stunning bouquet! The roses were fresh, fragrant, and beautifully arranged. My wife was over the moon. Will definitely order again.',
    date: '2026-02-12',
    status: 'approved',
  },
  {
    id: 'rev-002',
    productName: 'Spring Awakening',
    customerName: 'James Wilson',
    rating: 4,
    text: 'Lovely mix of colours and the flowers lasted well over a week. Only giving 4 stars because the delivery was a little later than expected.',
    date: '2026-02-10',
    status: 'approved',
  },
  {
    id: 'rev-003',
    productName: 'The Grand Gesture',
    customerName: 'Sarah Mitchell',
    rating: 5,
    text: 'The most incredible arrangement I have ever seen. 100 roses in the hat box was a showstopper at our anniversary dinner. Worth every penny!',
    date: '2026-02-08',
    status: 'pending',
  },
  {
    id: 'rev-004',
    productName: 'Letterbox Sunshine',
    customerName: 'David Clarke',
    rating: 3,
    text: 'Nice enough flowers but a couple of the stems were a bit wilted on arrival. The letterbox concept is really convenient though.',
    date: '2026-02-06',
    status: 'pending',
  },
  {
    id: 'rev-005',
    productName: 'Pastel Dreams',
    customerName: 'Olivia Brown',
    rating: 5,
    text: 'Sent these to my mum for her birthday and she absolutely loved them. The pastel colours were even more beautiful in person. Highly recommend!',
    date: '2026-02-04',
    status: 'approved',
  },
  {
    id: 'rev-006',
    productName: 'Peace Lily',
    customerName: 'Charlotte Davis',
    rating: 4,
    text: 'Beautiful plant, arrived in perfect condition. The ceramic pot is really stylish. Great gift for a friend who just moved house.',
    date: '2026-02-01',
    status: 'pending',
  },
]

const TABS = [
  { key: 'all', label: 'All Reviews' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
]

// --------------------------------------------------
// Star rating component
// --------------------------------------------------

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS)
  const [activeTab, setActiveTab] = useState('all')

  const filteredReviews = useMemo(() => {
    if (activeTab === 'all') return reviews
    return reviews.filter((r) => r.status === activeTab)
  }, [reviews, activeTab])

  const tabCounts = useMemo(() => ({
    all: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
  }), [reviews])

  const handleApprove = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'approved' as const } : r))
    )
    toast.success('Review approved and published.')
  }

  const handleReject = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'rejected' as const } : r))
    )
    toast.success('Review rejected.')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Moderate customer reviews ({tabCounts.pending} pending approval)
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tabCounts[tab.key as keyof typeof tabCounts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Review content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900">{review.productName}</h3>
                  {getStatusBadge(review.status)}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <StarRating rating={review.rating} />
                  <span className="text-sm text-muted-foreground">
                    by <span className="font-medium text-gray-700">{review.customerName}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">&middot;</span>
                  <span className="text-sm text-muted-foreground">{formatDate(review.date)}</span>
                </div>

                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                </div>
              </div>

              {/* Actions */}
              {review.status === 'pending' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(review.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(review.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">No reviews found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}
