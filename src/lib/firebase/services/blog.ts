import {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  where,
  limit as firestoreLimit,
} from '../firestore'
import type { BlogPost } from '@/types'

const COLLECTION = 'blog_posts'

export async function getBlogPost(id: string) {
  return getDocument<BlogPost>(COLLECTION, id)
}

export async function getBlogPostBySlug(slug: string) {
  const posts = await getDocuments<BlogPost>(COLLECTION, [
    where('slug', '==', slug),
    firestoreLimit(1),
  ])
  return posts[0] || null
}

export async function getPublishedPosts() {
  const posts = await getDocuments<BlogPost>(COLLECTION, [
    where('isPublished', '==', true),
  ])
  posts.sort((a, b) => {
    const aTime = a.publishedAt?.seconds || a.createdAt?.seconds || 0
    const bTime = b.publishedAt?.seconds || b.createdAt?.seconds || 0
    return bTime - aTime
  })
  return posts
}

export async function getAllPosts() {
  const posts = await getDocuments<BlogPost>(COLLECTION)
  posts.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0
    const bTime = b.createdAt?.seconds || 0
    return bTime - aTime
  })
  return posts
}

export async function createBlogPost(data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) {
  return createDocument(COLLECTION, data)
}

export async function updateBlogPost(id: string, data: Partial<BlogPost>) {
  return updateDocument(COLLECTION, id, data)
}

export async function deleteBlogPost(id: string) {
  return deleteDocument(COLLECTION, id)
}
