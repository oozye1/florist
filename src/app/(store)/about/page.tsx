import type { Metadata } from 'next'
import Image from 'next/image'
import { Leaf, Heart, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Love Blooms Florist — a family-run florist based in London, dedicated to crafting beautiful, sustainable floral arrangements since 2010.',
}

const values = [
  {
    icon: Leaf,
    title: 'Sustainability',
    description:
      'We are committed to eco-friendly packaging, seasonal sourcing, and reducing our environmental footprint. Every bouquet is wrapped in recyclable materials, and we work closely with growers who share our respect for the planet.',
  },
  {
    icon: Heart,
    title: 'Craftsmanship',
    description:
      'Every arrangement is hand-tied by our expert florists with meticulous attention to detail. We blend colour, texture, and fragrance to create compositions that are as unique as the moments they celebrate.',
  },
  {
    icon: Users,
    title: 'Community',
    description:
      'We proudly support local growers and British flower farms wherever possible. From our workshop in London, we nurture relationships with suppliers, customers, and the neighbourhood we call home.',
  },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex min-h-[400px] items-center justify-center overflow-hidden bg-primary/5">
        <Image
          src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1600&q=80"
          alt="Beautiful floral arrangement in our workshop"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-primary md:text-5xl">
            Our Story
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            A passion for flowers, a commitment to beauty, and a love for bringing joy to
            every doorstep.
          </p>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80"
              alt="Hand-tying a bouquet in the Love Blooms workshop"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="mb-6 font-serif text-3xl font-bold text-foreground">
              Founded with Passion
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Love Blooms Florist was born in 2010 from a simple dream: to share the
                beauty and emotion of fresh flowers with as many people as possible. What
                started as a small market stall in London has blossomed into one of the
                city&apos;s most beloved independent florists.
              </p>
              <p>
                As a family-run business based in the heart of London, we take immense pride
                in every arrangement that leaves our workshop. Our founder&apos;s love for
                horticulture and design has shaped a brand that values quality above all
                else — from the first petal to the final bow.
              </p>
              <p>
                Over the years, we&apos;ve had the honour of being part of countless
                weddings, celebrations, memorials, and everyday moments of joy. Each bouquet
                tells a story, and we are privileged to help you tell yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/50 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">
              What We Stand For
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Our values guide every decision we make, from the flowers we source to the
              way we wrap them.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 font-serif text-xl font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">
            Meet the Team
          </h2>
          <p className="mx-auto max-w-2xl leading-relaxed text-muted-foreground">
            Behind every bouquet is a team of dedicated artisans who live and breathe
            flowers. From our head florist with over 20 years of experience to our delivery
            drivers who ensure every arrangement arrives in perfect condition, we are a
            close-knit family united by a shared love for what we do. Together, we create
            something beautiful every single day.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-16 text-center text-primary-foreground">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 font-serif text-3xl font-bold">
            Ready to Send Some Love?
          </h2>
          <p className="mb-8 text-primary-foreground/80">
            Browse our collection and find the perfect arrangement for every occasion.
          </p>
          <a
            href="/products"
            className="inline-block rounded-lg bg-white px-8 py-3 font-medium text-primary transition-colors hover:bg-white/90"
          >
            Shop Now
          </a>
        </div>
      </section>
    </div>
  )
}
