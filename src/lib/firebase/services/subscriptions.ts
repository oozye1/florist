import {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  where,
} from '../firestore'
import type { SubscriptionPlan, Subscription } from '@/types'

const PLANS_COLLECTION = 'subscription_plans'
const SUBSCRIPTIONS_COLLECTION = 'subscriptions'

// Subscription Plans
export async function getSubscriptionPlan(id: string) {
  return getDocument<SubscriptionPlan>(PLANS_COLLECTION, id)
}

export async function getActivePlans() {
  return getDocuments<SubscriptionPlan>(PLANS_COLLECTION, [
    where('isActive', '==', true),
  ])
}

export async function getAllPlans() {
  return getDocuments<SubscriptionPlan>(PLANS_COLLECTION)
}

export async function createPlan(data: Omit<SubscriptionPlan, 'id'>) {
  return createDocument(PLANS_COLLECTION, data)
}

export async function updatePlan(id: string, data: Partial<SubscriptionPlan>) {
  return updateDocument(PLANS_COLLECTION, id, data)
}

export async function deletePlan(id: string) {
  return deleteDocument(PLANS_COLLECTION, id)
}

// User Subscriptions
export async function getSubscription(id: string) {
  return getDocument<Subscription>(SUBSCRIPTIONS_COLLECTION, id)
}

export async function getUserSubscriptions(userId: string) {
  return getDocuments<Subscription>(SUBSCRIPTIONS_COLLECTION, [
    where('userId', '==', userId),
  ])
}

export async function getAllSubscriptions() {
  return getDocuments<Subscription>(SUBSCRIPTIONS_COLLECTION)
}

export async function createSubscription(data: Omit<Subscription, 'id' | 'createdAt'>) {
  return createDocument(SUBSCRIPTIONS_COLLECTION, data)
}

export async function updateSubscription(id: string, data: Partial<Subscription>) {
  return updateDocument(SUBSCRIPTIONS_COLLECTION, id, data)
}

export async function cancelSubscription(id: string) {
  const { serverTimestamp } = await import('../firestore')
  return updateDocument(SUBSCRIPTIONS_COLLECTION, id, {
    status: 'cancelled',
    cancelledAt: serverTimestamp(),
  })
}
