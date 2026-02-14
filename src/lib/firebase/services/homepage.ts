import { getClientDb } from '../config'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { HomepageContent } from '@/types'

const COLLECTION = 'settings'
const DOC_ID = 'homepage_content'

export async function getHomepageContent(): Promise<HomepageContent | null> {
  try {
    const docRef = doc(getClientDb(), COLLECTION, DOC_ID)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return null
    return { id: snapshot.id, ...snapshot.data() } as HomepageContent
  } catch {
    return null
  }
}

export async function updateHomepageContent(data: Partial<HomepageContent>): Promise<void> {
  const docRef = doc(getClientDb(), COLLECTION, DOC_ID)
  await setDoc(docRef, { ...data, updatedAt: new Date() }, { merge: true })
}
