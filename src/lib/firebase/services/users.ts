import {
  getDocument,
  getDocuments,
  updateDocument,
  where,
  limit as firestoreLimit,
} from '../firestore'
import type { UserProfile, SavedAddress } from '@/types'

const COLLECTION = 'users'

export async function getUser(uid: string) {
  return getDocument<UserProfile>(COLLECTION, uid)
}

export async function getAllUsers() {
  return getDocuments<UserProfile>(COLLECTION)
}

export async function getUserByEmail(email: string) {
  const users = await getDocuments<UserProfile>(COLLECTION, [
    where('email', '==', email),
    firestoreLimit(1),
  ])
  return users[0] || null
}

export async function updateUser(uid: string, data: Partial<UserProfile>) {
  return updateDocument(COLLECTION, uid, data)
}

export async function addLoyaltyPoints(uid: string, points: number) {
  const user = await getUser(uid)
  if (!user) return
  return updateDocument(COLLECTION, uid, {
    loyaltyPoints: (user.loyaltyPoints || 0) + points,
  })
}

// Saved addresses (subcollection)
export async function getUserAddresses(uid: string) {
  return getDocuments<SavedAddress>(`${COLLECTION}/${uid}/addresses`)
}

export async function addUserAddress(uid: string, address: Omit<SavedAddress, 'id' | 'createdAt'>) {
  const { createDocument } = await import('../firestore')
  return createDocument(`${COLLECTION}/${uid}/addresses`, address)
}

export async function updateUserAddress(uid: string, addressId: string, data: Partial<SavedAddress>) {
  return updateDocument(`${COLLECTION}/${uid}/addresses`, addressId, data)
}

export async function deleteUserAddress(uid: string, addressId: string) {
  const { deleteDocument } = await import('../firestore')
  return deleteDocument(`${COLLECTION}/${uid}/addresses`, addressId)
}
