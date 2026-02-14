import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../firestore'
import type { DeliveryZone } from '@/types'

const COLLECTION = 'delivery_zones'

export async function getAllDeliveryZones() {
  return getDocuments<DeliveryZone>(COLLECTION)
}

export async function createDeliveryZone(data: Omit<DeliveryZone, 'id'>) {
  return createDocument(COLLECTION, data)
}

export async function updateDeliveryZone(id: string, data: Partial<DeliveryZone>) {
  return updateDocument(COLLECTION, id, data)
}

export async function deleteDeliveryZone(id: string) {
  return deleteDocument(COLLECTION, id)
}
