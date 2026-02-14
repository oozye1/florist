import {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  where,
  orderBy,
  limit as firestoreLimit,
} from '../firestore'
import type { Order, OrderStatus, PaymentStatus } from '@/types'

const COLLECTION = 'orders'

export async function getOrder(id: string) {
  return getDocument<Order>(COLLECTION, id)
}

export async function getOrderByNumber(orderNumber: string) {
  const orders = await getDocuments<Order>(COLLECTION, [
    where('orderNumber', '==', orderNumber),
    firestoreLimit(1),
  ])
  return orders[0] || null
}

export async function getOrderByStripeSession(sessionId: string) {
  const orders = await getDocuments<Order>(COLLECTION, [
    where('stripeSessionId', '==', sessionId),
    firestoreLimit(1),
  ])
  return orders[0] || null
}

export async function getOrders(options?: {
  userId?: string
  status?: OrderStatus
  maxResults?: number
}) {
  const constraints = []

  if (options?.userId) {
    constraints.push(where('userId', '==', options.userId))
  }

  if (options?.status) {
    constraints.push(where('status', '==', options.status))
  }

  if (options?.maxResults) {
    constraints.push(firestoreLimit(options.maxResults))
  }

  const orders = await getDocuments<Order>(COLLECTION, constraints)
  // Sort newest first
  orders.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0
    const bTime = b.createdAt?.seconds || 0
    return bTime - aTime
  })
  return orders
}

export async function getAllOrders() {
  const orders = await getDocuments<Order>(COLLECTION)
  orders.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0
    const bTime = b.createdAt?.seconds || 0
    return bTime - aTime
  })
  return orders
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  return createDocument(COLLECTION, data)
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return updateDocument(COLLECTION, id, { status })
}

export async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
  return updateDocument(COLLECTION, id, { paymentStatus })
}

export async function updateOrder(id: string, data: Partial<Order>) {
  return updateDocument(COLLECTION, id, data)
}
