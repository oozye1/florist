import { NextRequest, NextResponse } from 'next/server'
import { isAdminConfigured } from '@/lib/firebase/admin'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (!isAdminConfigured()) {
      console.warn('Newsletter signup submitted but Firebase Admin not configured — not saved.')
      return NextResponse.json({ success: true })
    }

    const { adminDb } = await import('@/lib/firebase/admin')
    const { FieldValue } = await import('firebase-admin/firestore')
    const trimmed = email.trim().toLowerCase()

    // Check for duplicate
    const existing = await adminDb
      .collection('newsletter_subscribers')
      .where('email', '==', trimmed)
      .limit(1)
      .get()

    if (!existing.empty) {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 409 })
    }

    await adminDb.collection('newsletter_subscribers').add({
      email: trimmed,
      subscribedAt: FieldValue.serverTimestamp(),
      isActive: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
