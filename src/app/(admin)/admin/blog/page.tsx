'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Pencil, Trash2, FileText, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useFirestoreQuery } from '@/hooks/use-firestore-query'
import { getAllPosts, deleteBlogPost } from '@/lib/firebase/services/blog'
import { relativeTime } from '@/lib/admin-utils'
import type { BlogPost } from '@/types'

// --------------------------------------------------
// Tabs
// --------------------------------------------------

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Draft' },
]

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminBlogPage() {
  const { data: posts, loading, refetch } = useFirestoreQuery<BlogPost[]>(getAllPosts, [])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filteredPosts = useMemo(() => {
    if (!posts) return []
    return posts.filter((post) => {
      // Tab filter
      if (activeTab === 'published' && !post.isPublished) return false
      if (activeTab === 'draft' && post.isPublished) return false
      // Search
      if (search && !post.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [posts, search, activeTab])

  const tabCounts = useMemo(() => {
    if (!posts) return { all: 0, published: 0, draft: 0 }
    return {
      all: posts.length,
      published: posts.filter((p) => p.isPublished).length,
      draft: posts.filter((p) => !p.isPublished).length,
    }
  }, [posts])

  const handleDelete = async (postId: string) => {
    try {
      await deleteBlogPost(postId)
      toast.success('Blog post deleted.')
      setDeleteConfirmId(null)
      refetch()
    } catch {
      toast.error('Failed to delete blog post.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading blog posts...</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm animate-pulse">
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your blog content ({tabCounts.all} posts &middot; {tabCounts.published} published &middot; {tabCounts.draft} drafts)
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tabCounts[tab.key as keyof typeof tabCounts]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Posts table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Slug
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Author
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tags
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPosts.map((post, idx) => (
                <tr
                  key={post.id}
                  className={`hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                >
                  {/* Title */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[280px]">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-xs text-muted-foreground truncate max-w-[280px]">{post.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500 font-mono">{post.slug}</span>
                  </td>

                  {/* Author */}
                  <td className="px-6 py-4 text-gray-700">{post.authorName || '-'}</td>

                  {/* Tags */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {post.isPublished ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Draft
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {relativeTime(post.createdAt)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      {deleteConfirmId === post.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(post.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-muted-foreground text-sm">No blog posts found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
