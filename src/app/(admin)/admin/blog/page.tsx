'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Pencil, Trash2, FileText, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

// --------------------------------------------------
// Sample blog data (matches store blog page)
// --------------------------------------------------

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  tags: string[]
  status: 'published' | 'draft'
  date: string
  author: string
}

const SAMPLE_POSTS: BlogPost[] = [
  {
    id: 'blog-001',
    slug: 'valentines-day-flowers-guide',
    title: "Valentine's Day 2026: The Ultimate Flower Guide",
    excerpt:
      "From classic red roses to unexpected blooms, discover the perfect flowers to express your love this Valentine's Day.",
    tags: ['Valentines', 'Gift Guide'],
    status: 'published',
    date: '2026-02-01',
    author: 'Emma Rose',
  },
  {
    id: 'blog-002',
    slug: 'how-to-keep-flowers-fresh',
    title: '10 Expert Tips to Keep Your Flowers Fresh Longer',
    excerpt:
      'Our florists share their top secrets for extending the life of your cut flowers by up to two weeks.',
    tags: ['Care Tips', 'How To'],
    status: 'published',
    date: '2026-01-20',
    author: 'Emma Rose',
  },
  {
    id: 'blog-003',
    slug: 'spring-flower-trends-2026',
    title: 'Spring 2026 Flower Trends: What to Expect',
    excerpt:
      'From bold colour palettes to sustainable floristry, here are the trends shaping spring arrangements this year.',
    tags: ['Trends', 'Seasonal'],
    status: 'published',
    date: '2026-01-15',
    author: 'Sophie Green',
  },
  {
    id: 'blog-004',
    slug: 'wedding-flower-ideas',
    title: 'Wedding Flowers: A Complete Planning Guide',
    excerpt:
      'Everything you need to know about choosing the perfect flowers for your big day, from bouquets to centrepieces.',
    tags: ['Wedding', 'Planning'],
    status: 'published',
    date: '2026-01-10',
    author: 'Emma Rose',
  },
  {
    id: 'blog-005',
    slug: 'best-indoor-plants-beginners',
    title: 'Best Indoor Plants for Beginners: A No-Fuss Guide',
    excerpt:
      "New to plant parenthood? These five houseplants are virtually indestructible and will thrive in any home.",
    tags: ['Plants', 'Beginners'],
    status: 'draft',
    date: '2025-12-28',
    author: 'Sophie Green',
  },
  {
    id: 'blog-006',
    slug: 'language-of-flowers',
    title: 'The Language of Flowers: What Each Bloom Means',
    excerpt:
      'Roses for love, lilies for sympathy — discover the hidden meanings behind the most popular flowers.',
    tags: ['Education', 'History'],
    status: 'published',
    date: '2025-12-15',
    author: 'Emma Rose',
  },
]

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AdminBlogPage() {
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState<BlogPost[]>(SAMPLE_POSTS)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filteredPosts = useMemo(() => {
    return posts.filter((post) =>
      post.title.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, posts])

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    setDeleteConfirmId(null)
  }

  const publishedCount = posts.filter((p) => p.status === 'published').length
  const draftCount = posts.filter((p) => p.status === 'draft').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your blog content ({posts.length} posts &middot; {publishedCount} published &middot; {draftCount} drafts)
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
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
                  Tags
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Author
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
                        <p className="text-xs text-muted-foreground truncate max-w-[280px]">{post.excerpt}</p>
                      </div>
                    </div>
                  </td>

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
                    {post.status === 'published' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Draft
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {formatDate(post.date)}
                    </div>
                  </td>

                  {/* Author */}
                  <td className="px-6 py-4 text-gray-700">{post.author}</td>

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
                  <td colSpan={6} className="px-6 py-16 text-center">
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
