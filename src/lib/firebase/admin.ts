import { initializeApp, getApps, cert, type ServiceAccount, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage, type Storage } from 'firebase-admin/storage'

let _app: App | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null
let _storage: Storage | null = null

export function isAdminConfigured(): boolean {
  return !!(
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  )
}

function getApp(): App {
  if (_app) return _app

  if (getApps().length > 0) {
    _app = getApps()[0]
    return _app
  }

  if (!isAdminConfigured()) {
    throw new Error(
      'Firebase Admin not configured. Set FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY environment variables.'
    )
  }

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }

  _app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })

  return _app
}

export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    if (!_auth) _auth = getAuth(getApp())
    return (_auth as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    if (!_db) _db = getFirestore(getApp())
    return (_db as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const adminStorage: Storage = new Proxy({} as Storage, {
  get(_, prop) {
    if (!_storage) _storage = getStorage(getApp())
    return (_storage as unknown as Record<string | symbol, unknown>)[prop]
  },
})
