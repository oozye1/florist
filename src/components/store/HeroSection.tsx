'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { HeroContent } from '@/types'

interface HeroSectionProps {
  content?: HeroContent
}

export default function HeroSection({ content }: HeroSectionProps) {
  const imageUrl = content?.imageUrl || 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1920&q=80'
  const imageAlt = content?.imageAlt || 'Beautiful floral arrangement'
  const heading = content?.heading || 'Where Every Petal Tells a Story'
  const subheading = content?.subheading || 'Hand-crafted luxury floral arrangements, delivered with love across the UK'
  const primaryButton = content?.primaryButton || { text: 'Shop Collection', href: '/products' }
  const secondaryButton = content?.secondaryButton || { text: 'Send Flowers Today', href: '/products?delivery=same_day' }

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[85vh] items-end pb-20 sm:items-center sm:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl animate-hero-fade-in">
            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {heading}
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85 sm:text-xl">
              {subheading}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="xl" className="rounded-full">
                <Link href={primaryButton.href}>{primaryButton.text}</Link>
              </Button>

              <Button
                asChild
                size="xl"
                variant="outline"
                className="rounded-full border-white text-white hover:bg-white hover:text-primary"
              >
                <Link href={secondaryButton.href}>
                  {secondaryButton.text}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animation keyframes */}
      <style jsx>{`
        @keyframes hero-fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :global(.animate-hero-fade-in) {
          animation: hero-fade-in 1s ease-out forwards;
        }
      `}</style>
    </section>
  )
}
