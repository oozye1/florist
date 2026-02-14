import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { getBlogPostBySlug } from '@/lib/firebase/services/blog'

// Fallback post when Firestore is not configured
const FALLBACK_POST = {
  title: "Valentine's Day 2026: The Ultimate Flower Guide",
  slug: 'valentines-day-flowers-guide',
  excerpt:
    "From classic red roses to unexpected blooms, discover the perfect flowers to express your love this Valentine's Day.",
  coverImage: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1200&q=80',
  date: '2026-02-01',
  readTime: '5 min read',
  author: 'Love Blooms Team',
  tags: ['Valentines', 'Gift Guide'],
  content: `
## The Language of Love Through Flowers

Valentine's Day is the perfect occasion to let flowers speak for you. Whether you're celebrating a new romance or decades of love, the right blooms can say it all.

### Classic Red Roses — The Timeless Choice

Nothing says "I love you" quite like a bouquet of velvety red roses. Our **Velvet Red Romance** arrangement features twelve premium long-stem Ecuadorian roses, each chosen for their rich colour and intoxicating fragrance.

*Why they're special:* Red roses have symbolised deep love and passion since the Victorian era. Their beauty is universal and never goes out of style.

### Pink Roses — For New Love

If your relationship is blossoming, pink roses convey admiration, gratitude, and joy. Our **Blush Pink Elegance** bouquet captures the excitement of new romance beautifully.

### Beyond Roses

Don't limit yourself! Here are some stunning alternatives:

- **Peonies** — Represent romance, prosperity, and happy marriage
- **Tulips** — Red tulips declare "perfect love"
- **Orchids** — Symbolise luxury, strength, and rare beauty
- **Ranunculus** — Their layered petals whisper "I am dazzled by your charms"

### Making It Extra Special

1. **Add a gift message** — A heartfelt note makes any bouquet more meaningful
2. **Choose same-day delivery** — Order by 2pm for a Valentine's Day surprise
3. **Pair with chocolates** — Our Chocolate & Blooms hamper is a bestseller
4. **Go luxury** — The Grand Gesture (100 roses in a hat box) is unforgettable

### Order Early!

Valentine's Day is our busiest day of the year. We recommend placing your order at least 3 days in advance to guarantee your preferred delivery slot.

---

*Ready to sweep them off their feet? [Browse our Valentine's collection](/products?occasion=romance) and let us help you make this day truly special.*
  `.trim(),
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  try {
    const post = await getBlogPostBySlug(slug)
    if (post) {
      return {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        coverImage: post.coverImageUrl || '',
        date: post.publishedAt
          ? new Date(post.publishedAt.seconds * 1000).toISOString().split('T')[0]
          : '',
        readTime: `${Math.ceil((post.content?.length || 0) / 1000)} min read`,
        author: post.authorName || 'Love Blooms Team',
        tags: post.tags || [],
        content: post.content,
      }
    }
  } catch {
    // fallback
  }
  return FALLBACK_POST
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const POST = await getPost(slug)
  return {
    title: POST.title,
    description: POST.excerpt,
    openGraph: {
      title: POST.title,
      description: POST.excerpt,
      type: 'article',
      publishedTime: POST.date,
      authors: [POST.author],
      images: [{ url: POST.coverImage }],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${POST.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const POST = await getPost(slug)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: POST.title,
    description: POST.excerpt,
    image: POST.coverImage,
    datePublished: POST.date,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          {POST.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-secondary/10 text-secondary font-medium px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="font-serif text-3xl md:text-5xl mb-6">{POST.title}</h1>

        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {POST.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {POST.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {POST.readTime}
          </span>
        </div>

        {/* Cover Image */}
        <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-12">
          <Image
            src={POST.coverImage}
            alt={POST.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-li:text-muted-foreground">
          {POST.content.split('\n').map((line, i) => {
            if (line.startsWith('## '))
              return (
                <h2 key={i} className="text-2xl mt-10 mb-4">
                  {line.replace('## ', '')}
                </h2>
              )
            if (line.startsWith('### '))
              return (
                <h3 key={i} className="text-xl mt-8 mb-3">
                  {line.replace('### ', '')}
                </h3>
              )
            if (line.startsWith('- '))
              return (
                <li key={i} className="ml-6 list-disc">
                  {line.replace('- ', '')}
                </li>
              )
            if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. '))
              return (
                <li key={i} className="ml-6 list-decimal">
                  {line.replace(/^\d+\.\s/, '')}
                </li>
              )
            if (line.startsWith('---'))
              return <hr key={i} className="my-8" />
            if (line.startsWith('*') && line.endsWith('*'))
              return (
                <p key={i} className="italic">
                  {line.replace(/^\*|\*$/g, '')}
                </p>
              )
            if (line.trim() === '') return <br key={i} />
            return (
              <p key={i} className="mb-4 leading-relaxed">
                {line}
              </p>
            )
          })}
        </div>
      </article>
    </>
  )
}
