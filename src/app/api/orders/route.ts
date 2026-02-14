import { NextRequest, NextResponse } from 'next/server'
import { isAdminConfigured } from '@/lib/firebase/admin'

export async function GET(req: NextRequest) {
  try {
    // Verify Firebase ID token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdminConfigured()) {
      return NextResponse.json({ error: 'Server not fully configured' }, { status: 503 })
    }

    const { adminAuth, adminDb } = await import('@/lib/firebase/admin')
    const idToken = authHeader.slice(7)
    const decoded = await adminAuth.verifyIdToken(idToken)

    const snapshot = await adminDb
      .collection('orders')
      .where('billingEmail', '==', decoded.email)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
