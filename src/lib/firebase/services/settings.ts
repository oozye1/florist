import { db } from '../config'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { StoreSettings } from '@/types'

const COLLECTION = 'settings'
const DOC_ID = 'store_settings'

export async function getSettings(): Promise<StoreSettings | null> {
  try {
    const docRef = doc(db, COLLECTION, DOC_ID)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return null
    return { id: snapshot.id, ...snapshot.data() } as StoreSettings
  } catch {
    return null
  }
}

export async function updateSettings(data: Partial<StoreSettings>): Promise<void> {
  const docRef = doc(db, COLLECTION, DOC_ID)
  await setDoc(docRef, { ...data, updatedAt: new Date() }, { merge: true })
}
