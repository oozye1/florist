'use client'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, getClientDb } from './config'
import { ADMIN_EMAILS } from '@/lib/constants'

export { onAuthStateChanged, type User }

export async function signUp(email: string, password: string, fullName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: fullName })

  // Create user document in Firestore
  const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'customer'
  await setDoc(doc(getClientDb(), 'users', credential.user.uid), {
    uid: credential.user.uid,
    email,
    fullName,
    role,
    loyaltyPoints: 100, // Welcome bonus
    createdAt: serverTimestamp(),
  })

  return credential.user
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const credential = await signInWithPopup(auth, provider)

  const userRef = doc(getClientDb(), 'users', credential.user.uid)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) {
    // Create user doc only if it doesn't exist
    const email = credential.user.email || ''
    const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'customer'
    await setDoc(userRef, {
      uid: credential.user.uid,
      email,
      fullName: credential.user.displayName || '',
      role,
      loyaltyPoints: 100,
      createdAt: serverTimestamp(),
    })
  }

  return credential.user
}

export async function signOut() {
  await firebaseSignOut(auth)
  // Clear session cookies
  try {
    await fetch('/api/auth/session', { method: 'DELETE' })
  } catch {
    // ignore — session will expire
  }
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}
