import Image from 'next/image'
import Link from 'next/link'
import { OCCASIONS } from '@/lib/constants'
import type { OccasionItem } from '@/types'

interface OccasionGridProps {
  occasions?: OccasionItem[]
}

export default function OccasionGrid({ occasions }: OccasionGridProps) {
  const items = occasions && occasions.length > 0 ? occasions : OCCASIONS

  return (
    <section className="py-16 sm:py-20 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Shop By Occasion
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Find the perfect arrangement for every moment
          </p>
        </div>

        {/* Occasion Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {items.map((occasion) => (
            <Link
              key={occasion.slug}
              href={`/occasions/${occasion.slug}`}
              className="group relative block overflow-hidden rounded-xl"
            >
              {/* Image */}
              <div className="relative aspect-[4/3]">
                <Image
                  src={occasion.image}
                  alt={occasion.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-colors duration-300 group-hover:from-black/55 group-hover:via-black/20" />

                {/* Occasion Name */}
                <div className="absolute inset-0 flex items-end p-5 sm:p-6">
                  <h3 className="font-serif text-xl font-bold text-white sm:text-2xl">
                    {occasion.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
