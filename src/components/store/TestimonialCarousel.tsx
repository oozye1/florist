'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TestimonialItem } from '@/types'

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    quote: 'The roses were absolutely stunning. My wife was over the moon!',
    name: 'James T.',
    location: 'London',
    rating: 5,
  },
  {
    quote: 'Beautiful sympathy arrangement. Delivered on time with such care.',
    name: 'Sarah M.',
    location: 'Manchester',
    rating: 5,
  },
  {
    quote: 'I use Love Blooms for every occasion. Never disappointed!',
    name: 'Emily R.',
    location: 'Bristol',
    rating: 5,
  },
  {
    quote: 'The subscription service is brilliant. Fresh flowers every month!',
    name: 'Charlotte W.',
    location: 'Edinburgh',
    rating: 5,
  },
  {
    quote: 'Wedding flowers were beyond our dreams. Thank you!',
    name: 'David & Anna K.',
    location: 'Leeds',
    rating: 5,
  },
]

interface TestimonialCarouselProps {
  testimonials?: TestimonialItem[]
}

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const items = testimonials && testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused, items.length])

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            What Our Customers Say
          </h2>
        </div>

        {/* Carousel */}
        <div
          className="relative mx-auto mt-12 max-w-3xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Cards */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
              }}
            >
              {items.map((testimonial, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="rounded-2xl bg-card p-8 text-center shadow-sm sm:p-10">
                    {/* Quote Icon */}
                    <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Quote className="h-5 w-5 text-primary" />
                    </div>

                    {/* Star Rating */}
                    <div className="mb-6 flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-5 w-5',
                            i < testimonial.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-muted text-muted'
                          )}
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="font-serif text-xl leading-relaxed text-foreground sm:text-2xl">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>

                    {/* Customer Info */}
                    <div className="mt-6">
                      <p className="text-sm font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="mt-8 flex items-center justify-center gap-2.5">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'h-2.5 rounded-full transition-all duration-300',
                  index === activeIndex
                    ? 'w-8 bg-primary'
                    : 'w-2.5 bg-primary/25 hover:bg-primary/50'
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
