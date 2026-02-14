import {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  where,
  orderBy,
} from '../firestore'
import type { Review } from '@/types'

const COLLECTION = 'reviews'

export async function getReview(id: string) {
  return getDocument<Review>(COLLECTION, id)
}

export async function getProductReviews(productId: string) {
  return getDocuments<Review>(COLLECTION, [
    where('productId', '==', productId),
    where('isApproved', '==', true),
  ])
}

export async function getAllReviews() {
  const reviews = await getDocuments<Review>(COLLECTION)
  reviews.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0
    const bTime = b.createdAt?.seconds || 0
    return bTime - aTime
  })
  return reviews
}

export async function getPendingReviews() {
  return getDocuments<Review>(COLLECTION, [
    where('isApproved', '==', false),
  ])
}

export async function createReview(data: Omit<Review, 'id' | 'createdAt'>) {
  return createDocument(COLLECTION, data)
}

export async function approveReview(id: string) {
  return updateDocument(COLLECTION, id, { isApproved: true })
}

export async function rejectReview(id: string) {
  return deleteDocument(COLLECTION, id)
}

export async function addAdminResponse(id: string, response: string) {
  return updateDocument(COLLECTION, id, { adminResponse: response })
}
