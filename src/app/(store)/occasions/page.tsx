import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { OCCASIONS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Shop by Occasion',
  description:
    'Find the perfect flowers for every occasion — birthdays, anniversaries, weddings, sympathy, and more. Hand-crafted bouquets delivered with love.',
}

export default function OccasionsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary/5 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-primary md:text-5xl">
            Shop by Occasion
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Whatever the occasion, we have the perfect arrangement to help you
            express your feelings. Each bouquet is hand-crafted with care.
          </p>
        </div>
      </section>

      {/* Occasions Grid */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {OCCASIONS.map((occasion) => (
            <Link
              key={occasion.slug}
              href={`/occasions/${occasion.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-primary/5">
                <Image
                  src={occasion.image}
                  alt={`${occasion.name} flowers`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <h2 className="absolute bottom-4 left-4 font-serif text-2xl font-bold text-white">
                  {occasion.name}
                </h2>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {occasion.description}
                </p>
                <span className="mt-3 inline-flex items-center text-sm font-medium text-primary group-hover:text-secondary transition-colors">
                  Browse {occasion.name} Flowers
                  <svg
                    className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
