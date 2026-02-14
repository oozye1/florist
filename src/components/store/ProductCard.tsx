'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Star, Zap } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { cn, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0]

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: primaryImage?.url || '',
      slug: product.slug,
    })
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: primaryImage?.url || '',
      slug: product.slug,
    })
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className={cn(
              'object-cover transition-transform duration-500 ease-out',
              isHovered && 'scale-105'
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}

        {/* Wishlist Heart */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isWishlisted
                ? 'fill-red-500 text-red-500'
                : 'text-muted-foreground'
            )}
          />
        </button>

        {/* Same Day Badge */}
        {product.allowsSameDay && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm">
            <Zap className="h-3 w-3" />
            Same Day
          </div>
        )}

        {/* Quick Add Button */}
        <div
          className={cn(
            'absolute inset-x-3 bottom-3 z-10 transition-all duration-300',
            isHovered
              ? 'translate-y-0 opacity-100'
              : 'translate-y-2 opacity-0'
          )}
        >
          <button
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-sm font-medium text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-white"
          >
            <ShoppingBag className="h-4 w-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-4 space-y-1.5">
        {/* Category Badge */}
        <span className="inline-block rounded-full bg-secondary/15 px-2.5 py-0.5 text-xs font-medium text-secondary-dark">
          {product.categoryName}
        </span>

        {/* Product Name */}
        <h3 className="font-serif text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>

        {/* Star Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5',
                    i < Math.round(product.averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-muted text-muted'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
