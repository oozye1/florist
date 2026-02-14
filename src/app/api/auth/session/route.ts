import { NextRequest, NextResponse } from 'next/server'
import { isAdminConfigured } from '@/lib/firebase/admin'
import { ADMIN_EMAILS } from '@/lib/constants'

/**
 * Decode a Firebase ID token's payload without verification.
 * Used as fallback when Firebase Admin SDK is not configured.
 */
function decodeTokenPayload(idToken: string): { email?: string; uid?: string } | null {
  try {
    const parts = idToken.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    )
    return { email: payload.email, uid: payload.user_id || payload.sub }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 })
    }

    let email: string | undefined
    let uid: string | undefined
    let role = 'customer'

    if (isAdminConfigured()) {
      // Full verification with Firebase Admin
      const { adminAuth } = await import('@/lib/firebase/admin')
      const decoded = await adminAuth.verifyIdToken(idToken)
      email = decoded.email
      uid = decoded.uid

      if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
        role = 'admin'
      } else if (decoded.admin === true || decoded.role === 'admin') {
        role = 'admin'
      } else {
        try {
          const { adminDb } = await import('@/lib/firebase/admin')
          const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
          if (userDoc.exists) {
            role = userDoc.data()?.role || 'customer'
          }
        } catch {
          // Firestore not available
        }
      }
    } else {
      // Fallback: decode token without verification (admin not configured)
      const payload = decodeTokenPayload(idToken)
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      email = payload.email
      uid = payload.uid

      // Still check admin emails
      if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
        role = 'admin'
      }
    }

    const response = NextResponse.json({ success: true, role })

    // Set session cookie (7 days)
    response.cookies.set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    // Set role cookie (readable by middleware)
    response.cookies.set('role', role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })

  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  response.cookies.set('role', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}
