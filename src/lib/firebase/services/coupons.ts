import {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  where,
  limit as firestoreLimit,
} from '../firestore'
import type { Coupon } from '@/types'

const COLLECTION = 'coupons'

export async function getCoupon(id: string) {
  return getDocument<Coupon>(COLLECTION, id)
}

export async function getCouponByCode(code: string) {
  const coupons = await getDocuments<Coupon>(COLLECTION, [
    where('code', '==', code.toUpperCase()),
    firestoreLimit(1),
  ])
  return coupons[0] || null
}

export async function getAllCoupons() {
  const coupons = await getDocuments<Coupon>(COLLECTION)
  coupons.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0
    const bTime = b.createdAt?.seconds || 0
    return bTime - aTime
  })
  return coupons
}

export async function getActiveCoupons() {
  return getDocuments<Coupon>(COLLECTION, [
    where('isActive', '==', true),
  ])
}

export async function createCoupon(data: Omit<Coupon, 'id' | 'createdAt' | 'timesUsed'>) {
  return createDocument(COLLECTION, { ...data, timesUsed: 0 })
}

export async function updateCoupon(id: string, data: Partial<Coupon>) {
  return updateDocument(COLLECTION, id, data)
}

export async function deleteCoupon(id: string) {
  return deleteDocument(COLLECTION, id)
}

export async function validateCoupon(code: string, orderTotal: number) {
  const coupon = await getCouponByCode(code)

  if (!coupon) return { valid: false, error: 'Coupon not found' }
  if (!coupon.isActive) return { valid: false, error: 'Coupon is no longer active' }

  if (coupon.maxUses && coupon.timesUsed >= coupon.maxUses) {
    return { valid: false, error: 'Coupon has reached maximum uses' }
  }

  if (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) {
    return { valid: false, error: 'Coupon has expired' }
  }

  if (coupon.minimumOrder && orderTotal < coupon.minimumOrder) {
    return { valid: false, error: `Minimum order of £${coupon.minimumOrder} required` }
  }

  let discount = 0
  if (coupon.discountType === 'percentage') {
    discount = orderTotal * (coupon.discountValue / 100)
  } else if (coupon.discountType === 'fixed_amount') {
    discount = coupon.discountValue
  }

  return { valid: true, coupon, discount }
}

export async function incrementCouponUsage(id: string) {
  const coupon = await getCoupon(id)
  if (!coupon) return
  return updateDocument(COLLECTION, id, { timesUsed: coupon.timesUsed + 1 })
}
