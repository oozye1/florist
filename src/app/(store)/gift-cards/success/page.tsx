import Link from 'next/link'
import { Gift, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'
import { isAdminConfigured } from '@/lib/firebase/admin'

export const metadata: Metadata = {
  title: 'Gift Card Purchased',
  robots: { index: false },
}

async function getGiftCardBySession(sessionId: string) {
  if (!isAdminConfigured()) return null
  try {
    const { adminDb } = await import('@/lib/firebase/admin')
    const snapshot = await adminDb
      .collection('gift_cards')
      .where('stripeSessionId', '==', sessionId)
      .limit(1)
      .get()

    if (snapshot.empty) return null
    const data = snapshot.docs[0].data()
    return {
      code: data.code as string,
      amount: data.initialBalance as number,
      recipientName: data.recipientName as string,
      recipientEmail: data.recipientEmail as string,
      message: data.message as string,
    }
  } catch {
    return null
  }
}

export default async function GiftCardSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const giftCard = session_id ? await getGiftCardBySession(session_id) : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <Gift className="w-10 h-10 text-green-600" />
      </div>

      <h1 className="font-serif text-4xl mb-4">Gift Card Purchased!</h1>
      <p className="text-xl text-muted-foreground mb-8">
        {giftCard
          ? 'Your gift card is ready. Share the code below!'
          : 'Your gift card is being prepared. Please check back shortly.'}
      </p>

      {giftCard && (
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border-2 border-primary/20 p-8 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <p className="text-sm text-muted-foreground mb-2">Love Blooms Gift Card</p>
            <p className="text-4xl font-bold text-primary mb-4">
              &pound;{giftCard.amount.toFixed(2)}
            </p>
            <div className="bg-gray-50 rounded-lg px-6 py-4 inline-block">
              <p className="text-xs text-muted-foreground mb-1">Gift Card Code</p>
              <p className="text-2xl font-mono font-bold tracking-wider text-gray-900">
                {giftCard.code}
              </p>
            </div>
          </div>

          {giftCard.recipientName && (
            <p className="text-sm text-muted-foreground">
              For <span className="font-medium text-gray-900">{giftCard.recipientName}</span>
            </p>
          )}
          {giftCard.message && (
            <p className="text-sm italic text-muted-foreground mt-2">
              &ldquo;{giftCard.message}&rdquo;
            </p>
          )}
        </div>
      )}

      {!giftCard && (
        <div className="bg-white rounded-xl border border-border p-8 mb-8">
          <p className="text-muted-foreground">
            Your gift card code will appear here once payment is confirmed.
            This usually takes a few seconds — try refreshing the page.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/gift-cards">
          <Button variant="outline">
            Buy Another
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
