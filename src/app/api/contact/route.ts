import { NextRequest, NextResponse } from 'next/server'
import { isAdminConfigured } from '@/lib/firebase/admin'

interface ContactBody {
  name: string
  email: string
  subject: string
  message: string
}

export async function POST(req: NextRequest) {
  try {
    const body: ContactBody = await req.json()

    if (!body.name?.trim() || !body.email?.trim() || !body.subject?.trim() || !body.message?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (!isAdminConfigured()) {
      // Accept the message but log that it couldn't be saved
      console.warn('Contact form submitted but Firebase Admin not configured — message not saved.')
      return NextResponse.json({ success: true })
    }

    const { adminDb } = await import('@/lib/firebase/admin')
    const { FieldValue } = await import('firebase-admin/firestore')

    await adminDb.collection('contact_messages').add({
      name: body.name.trim(),
      email: body.email.trim(),
      subject: body.subject.trim(),
      message: body.message.trim(),
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
