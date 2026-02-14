import {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  where,
  limit as firestoreLimit,
} from '../firestore'
import type { GiftCard } from '@/types'

const COLLECTION = 'gift_cards'

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `LB-${segment()}-${segment()}`
}

export async function getGiftCard(id: string) {
  return getDocument<GiftCard>(COLLECTION, id)
}

export async function getGiftCardByCode(code: string) {
  const cards = await getDocuments<GiftCard>(COLLECTION, [
    where('code', '==', code.toUpperCase()),
    firestoreLimit(1),
  ])
  return cards[0] || null
}

export async function getAllGiftCards() {
  const cards = await getDocuments<GiftCard>(COLLECTION)
  cards.sort((a, b) => {
    const aTime = (a.createdAt as unknown as { seconds: number })?.seconds || 0
    const bTime = (b.createdAt as unknown as { seconds: number })?.seconds || 0
    return bTime - aTime
  })
  return cards
}

export async function getUserGiftCards(userId: string) {
  return getDocuments<GiftCard>(COLLECTION, [
    where('purchaserId', '==', userId),
  ])
}

export async function createGiftCard(
  data: Omit<GiftCard, 'id' | 'code' | 'createdAt'>
): Promise<{ id: string; code: string }> {
  const code = generateGiftCardCode()
  const id = await createDocument(COLLECTION, { ...data, code })
  return { id, code }
}

export async function updateGiftCard(id: string, data: Partial<GiftCard>) {
  return updateDocument(COLLECTION, id, data)
}

export async function deleteGiftCard(id: string) {
  return deleteDocument(COLLECTION, id)
}

export async function validateGiftCard(code: string) {
  const card = await getGiftCardByCode(code)

  if (!card) return { valid: false as const, error: 'Gift card not found' }
  if (!card.isActive) return { valid: false as const, error: 'Gift card is no longer active' }
  if (card.currentBalance <= 0) return { valid: false as const, error: 'Gift card has no remaining balance' }

  if (card.expiresAt) {
    const expiry = typeof card.expiresAt === 'object' && 'toDate' in card.expiresAt
      ? (card.expiresAt as { toDate: () => Date }).toDate()
      : new Date(card.expiresAt as unknown as string)
    if (expiry < new Date()) {
      return { valid: false as const, error: 'Gift card has expired' }
    }
  }

  return { valid: true as const, card }
}

export async function redeemGiftCard(code: string, amount: number) {
  const result = await validateGiftCard(code)
  if (!result.valid) return result

  const card = result.card
  const deduction = Math.min(amount, card.currentBalance)
  const newBalance = card.currentBalance - deduction

  await updateGiftCard(card.id, { currentBalance: newBalance })
  return { valid: true as const, deducted: deduction, remainingBalance: newBalance }
}
