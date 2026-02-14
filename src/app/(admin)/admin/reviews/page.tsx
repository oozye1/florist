'use client'

import { useState, useMemo } from 'react'
import {
  Star,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Send,
  BarChart3,
  ThumbsUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import { getAllReviews, approveReview, rejectReview, addAdminResponse } from '@/lib/firebase/services/reviews'
import { relativeTime } from '@/lib/admin-utils'
import type { Review } from '@/types'

// --------------------------------------------------
// Tabs
// --------------------------------------------------

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
  const { data: reviews, loading, refetch } = useFirestoreQuery<Review[]>(getAllReviews, [])
  const [activeTab, setActiveTab] = useState('all')
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [respondingId, setRespondingId] = useState<string | null>(null)

  const filteredReviews = useMemo(() => {
    if (!reviews) return []
    if (activeTab === 'all') return reviews
    if (activeTab === 'pending') return reviews.filter((r) => r.isApproved === false)
    if (activeTab === 'approved') return reviews.filter((r) => r.isApproved === true)
    return reviews
  }, [reviews, activeTab])

  const tabCounts = useMemo(() => {
    if (!reviews) return { all: 0, pending: 0, approved: 0 }
    return {
      all: reviews.length,
      pending: reviews.filter((r) => r.isApproved === false).length,
      approved: reviews.filter((r) => r.isApproved === true).length,
    }
  }, [reviews])

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0
    const total = reviews.reduce((sum, r) => sum + r.rating, 0)
    return Math.round((total / reviews.length) * 10) / 10
  }, [reviews])

  const handleApprove = async (reviewId: string) => {
    try {
      await approveReview(reviewId)
      toast.success('Review approved and published.')
      refetch()
    } catch {
      toast.error('Failed to approve review.')
    }
  }

  const handleReject = async (reviewId: string) => {
    try {
      await rejectReview(reviewId)
      toast.success('Review rejected.')
      refetch()
    } catch {
      toast.error('Failed to reject review.')
    }
  }

  const handleSendResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response.')
      return
    }
    setRespondingId(reviewId)
    try {
      await addAdminResponse(reviewId, responseText.trim())
      toast.success('Admin response saved.')
      setResponseText('')
      setExpandedResponse(null)
      refetch()
    } catch {
      toast.error('Failed to save response.')
    } finally {
      setRespondingId(null)
    }
  }

  const getStatusBadge = (review: Review) => {
    if (review.isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Approved
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading reviews...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
              <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
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

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Total Reviews</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{tabCounts.all}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Average Rating</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-yellow-50 text-yellow-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
            <StarRating rating={Math.round(averageRating)} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Pending</span>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
              <ThumbsUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{tabCounts.pending}</p>
        </div>
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
                  {getStatusBadge(review)}
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      Verified Purchase
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <StarRating rating={review.rating} />
                  <span className="text-sm text-muted-foreground">
                    by <span className="font-medium text-gray-700">{review.userName}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">&middot;</span>
                  <span className="text-sm text-muted-foreground">{relativeTime(review.createdAt)}</span>
                </div>

                {review.title && (
                  <p className="font-medium text-gray-800 mb-1">{review.title}</p>
                )}

                {review.body && (
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm leading-relaxed">{review.body}</p>
                  </div>
                )}

                {/* Admin response (existing) */}
                {review.adminResponse && (
                  <div className="mt-3 ml-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Admin Response:</p>
                    <p className="text-sm text-gray-700">{review.adminResponse}</p>
                  </div>
                )}

                {/* Admin response form (expandable) */}
                {expandedResponse === review.id && (
                  <div className="mt-3 ml-6 space-y-2">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write your response to this review..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSendResponse(review.id)}
                        isLoading={respondingId === review.id}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send Response
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setExpandedResponse(null)
                          setResponseText('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!review.isApproved && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReject(review.id)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
                {expandedResponse !== review.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setExpandedResponse(review.id)
                      setResponseText(review.adminResponse || '')
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {review.adminResponse ? 'Edit Response' : 'Respond'}
                  </Button>
                )}
              </div>
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
