import {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  where,
  orderBy,
  limit as firestoreLimit,
} from '../firestore'
import type { Product, CategorySlug } from '@/types'

const COLLECTION = 'products'

export async function getProduct(id: string) {
  return getDocument<Product>(COLLECTION, id)
}

export async function getProductBySlug(slug: string) {
  const products = await getDocuments<Product>(COLLECTION, [
    where('slug', '==', slug),
    firestoreLimit(1),
  ])
  return products[0] || null
}

export async function getProducts(options?: {
  category?: CategorySlug
  occasion?: string
  featured?: boolean
  active?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest'
  maxResults?: number
}) {
  const constraints = []

  // Firestore only allows one inequality/array-contains per query without
  // composite indexes. Use a single where() in Firestore and filter the rest
  // client-side to avoid needing composite index deployment.

  if (options?.occasion) {
    // array-contains is the primary constraint — filter everything else client-side
    constraints.push(where('occasions', 'array-contains', options.occasion))
  } else if (options?.category) {
    constraints.push(where('category', '==', options.category))
    if (options?.active !== false) {
      constraints.push(where('isActive', '==', true))
    }
    if (options?.featured) {
      constraints.push(where('isFeatured', '==', true))
    }
  } else {
    if (options?.active !== false) {
      constraints.push(where('isActive', '==', true))
    }
    if (options?.featured) {
      constraints.push(where('isFeatured', '==', true))
    }
  }

  let products = await getDocuments<Product>(COLLECTION, constraints)

  // Client-side filtering for fields not included in the Firestore query
  if (options?.occasion) {
    if (options?.active !== false) {
      products = products.filter((p) => p.isActive)
    }
    if (options?.category) {
      products = products.filter((p) => p.category === options.category)
    }
    if (options?.featured) {
      products = products.filter((p) => p.isFeatured)
    }
  }

  // Client-side sorting
  if (options?.sortBy) {
    switch (options.sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        products.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        products.sort((a, b) => b.averageRating - a.averageRating)
        break
      case 'newest':
        products.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0
          const bTime = b.createdAt?.seconds || 0
          return bTime - aTime
        })
        break
    }
  }

  if (options?.maxResults) {
    products = products.slice(0, options.maxResults)
  }

  return products
}

export async function getAllProducts() {
  return getDocuments<Product>(COLLECTION, [orderBy('name')])
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  return createDocument(COLLECTION, data)
}

export async function updateProduct(id: string, data: Partial<Product>) {
  return updateDocument(COLLECTION, id, data)
}

export async function deleteProduct(id: string) {
  return deleteDocument(COLLECTION, id)
}
