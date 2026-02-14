import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let _app: FirebaseApp | null = null

function getApp(): FirebaseApp {
  if (_app) return _app
  if (getApps().length > 0) {
    _app = getApps()[0]
    return _app
  }
  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase not configured: missing NEXT_PUBLIC_FIREBASE_API_KEY')
  }
  _app = initializeApp(firebaseConfig)
  return _app
}

export const auth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    return (getAuth(getApp()) as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const db: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    return (getFirestore(getApp()) as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const storage: FirebaseStorage = new Proxy({} as FirebaseStorage, {
  get(_, prop) {
    return (getStorage(getApp()) as unknown as Record<string | symbol, unknown>)[prop]
  },
})

const app: FirebaseApp = new Proxy({} as FirebaseApp, {
  get(_, prop) {
    return (getApp() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export default app
