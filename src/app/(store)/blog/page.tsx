import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedPosts } from '@/lib/firebase/services/blog'

export const metadata: Metadata = {
  title: 'Flower Blog | Care Tips, Seasonal Guides & Floral Inspiration',
  description:
    'Expert flower care tips, seasonal arrangement guides, and floral inspiration from Love Blooms Florist. Learn how to keep your flowers fresh, discover trending bouquets, and find ideas for every occasion.',
}

const FALLBACK_POSTS = [
  {
    slug: 'valentines-day-flowers-guide',
    title: "Valentine's Day 2026: The Ultimate Flower Guide",
    excerpt:
      "From classic red roses to unexpected blooms, discover the perfect flowers to express your love this Valentine's Day.",
    coverImage: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&q=80',
    date: '2026-02-01',
    readTime: '5 min read',
    tags: ['Valentines', 'Gift Guide'],
  },
  {
    slug: 'how-to-keep-flowers-fresh',
    title: '10 Expert Tips to Keep Your Flowers Fresh Longer',
    excerpt:
      'Our florists share their top secrets for extending the life of your cut flowers by up to two weeks.',
    coverImage: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80',
    date: '2026-01-20',
    readTime: '7 min read',
    tags: ['Care Tips', 'How To'],
  },
  {
    slug: 'spring-flower-trends-2026',
    title: 'Spring 2026 Flower Trends: What to Expect',
    excerpt:
      'From bold colour palettes to sustainable floristry, here are the trends shaping spring arrangements this year.',
    coverImage: 'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800&q=80',
    date: '2026-01-15',
    readTime: '6 min read',
    tags: ['Trends', 'Seasonal'],
  },
  {
    slug: 'wedding-flower-ideas',
    title: 'Wedding Flowers: A Complete Planning Guide',
    excerpt:
      'Everything you need to know about choosing the perfect flowers for your big day, from bouquets to centrepieces.',
    coverImage: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80',
    date: '2026-01-10',
    readTime: '10 min read',
    tags: ['Wedding', 'Planning'],
  },
  {
    slug: 'best-indoor-plants-beginners',
    title: 'Best Indoor Plants for Beginners: A No-Fuss Guide',
    excerpt:
      "New to plant parenthood? These five houseplants are virtually indestructible and will thrive in any home.",
    coverImage: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80',
    date: '2025-12-28',
    readTime: '4 min read',
    tags: ['Plants', 'Beginners'],
  },
  {
    slug: 'language-of-flowers',
    title: 'The Language of Flowers: What Each Bloom Means',
    excerpt:
      'Roses for love, lilies for sympathy — discover the hidden meanings behind the most popular flowers.',
    coverImage: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80',
    date: '2025-12-15',
    readTime: '8 min read',
    tags: ['Education', 'History'],
  },
]

export default async function BlogPage() {
  let POSTS
  try {
    const firestorePosts = await getPublishedPosts()
    POSTS = firestorePosts.length > 0
      ? firestorePosts.map((p) => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt || '',
          coverImage: p.coverImageUrl || '',
          date: p.publishedAt ? new Date(p.publishedAt.seconds * 1000).toISOString().split('T')[0] : '',
          readTime: `${Math.ceil((p.content?.length || 0) / 1000)} min read`,
          tags: p.tags || [],
        }))
      : FALLBACK_POSTS
  } catch {
    POSTS = FALLBACK_POSTS
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl mb-4">
          The Love Blooms Journal
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Floral inspiration, expert care tips, and seasonal guides to help
          you make the most of beautiful blooms.
        </p>
      </div>

      {/* Featured Post */}
      <Link
        href={`/blog/${POSTS[0].slug}`}
        className="block mb-12 group"
      >
        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative aspect-[4/3] md:aspect-auto">
            <Image
              src={POSTS[0].coverImage}
              alt={POSTS[0].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="p-8 flex flex-col justify-center">
            <div className="flex gap-2 mb-3">
              {POSTS[0].tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-secondary/10 text-secondary font-medium px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="font-serif text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors">
              {POSTS[0].title}
            </h2>
            <p className="text-muted-foreground mb-4">{POSTS[0].excerpt}</p>
            <p className="text-sm text-muted-foreground">
              {POSTS[0].date} &middot; {POSTS[0].readTime}
            </p>
          </div>
        </div>
      </Link>

      {/* Post Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {POSTS.slice(1).map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group"
          >
            <article className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex gap-2 mb-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-secondary/10 text-secondary font-medium px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-serif text-lg mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground flex-1">
                  {post.excerpt}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  {post.date} &middot; {post.readTime}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
