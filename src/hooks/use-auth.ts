'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, getClientDb } from '@/lib/firebase/config'
import { ADMIN_EMAILS } from '@/lib/constants'
import type { UserProfile } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(getClientDb(), 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const isAdmin =
    profile?.role === 'admin' ||
    (user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false)

  return { user, profile, loading, isAdmin }
}
