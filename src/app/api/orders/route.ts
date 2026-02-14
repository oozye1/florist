import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { adminAuth } from '@/lib/firebase/admin'

export async function GET(req: NextRequest) {
  try {
    // Verify Firebase ID token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.slice(7)
    const decoded = await adminAuth.verifyIdToken(idToken)
    const userId = decoded.uid

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
