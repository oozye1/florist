import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { ADMIN_EMAILS } from '@/middleware'

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 })
    }

    // Verify the ID token
    const decoded = await adminAuth.verifyIdToken(idToken)

    // Check user role: admin emails take priority, then custom claims, then Firestore
    let role = 'customer'
    if (decoded.email && ADMIN_EMAILS.includes(decoded.email.toLowerCase())) {
      role = 'admin'
    } else if (decoded.admin === true || decoded.role === 'admin') {
      role = 'admin'
    } else {
      // Check Firestore for role
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
