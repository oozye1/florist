import { NextRequest, NextResponse } from 'next/server'
import { redeemGiftCard } from '@/lib/firebase/services/gift-cards'

export async function POST(req: NextRequest) {
  try {
    const { code, amount } = await req.json()

    if (!code || !amount) {
      return NextResponse.json({ error: 'Code and amount are required' }, { status: 400 })
    }

    const result = await redeemGiftCard(code.toUpperCase(), amount)

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error })
    }

    return NextResponse.json({
      valid: true,
      deducted: result.deducted,
      remainingBalance: result.remainingBalance,
    })
  } catch (error) {
    console.error('Gift card redemption error:', error)
    return NextResponse.json({ error: 'Failed to redeem gift card' }, { status: 500 })
  }
}
