import { NextRequest, NextResponse } from 'next/server'
import { validateGiftCard } from '@/lib/firebase/services/gift-cards'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Gift card code is required' }, { status: 400 })
    }

    const result = await validateGiftCard(code.toUpperCase())

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error })
    }

    return NextResponse.json({
      valid: true,
      balance: result.card.currentBalance,
    })
  } catch (error) {
    console.error('Gift card validation error:', error)
    return NextResponse.json({ error: 'Failed to validate gift card' }, { status: 500 })
  }
}
