'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/types'

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const selectedImage = images[selectedIndex] || images[0]

  if (!images.length) {
    return (
      <div className="aspect-[3/4] bg-muted rounded-2xl flex items-center justify-center">
        <span className="text-muted-foreground">No image available</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted cursor-zoom-in group"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt || productName}
          fill
          className={`object-cover transition-transform duration-500 ${
            isZoomed ? 'scale-150' : 'group-hover:scale-105'
          }`}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedIndex(index)
                setIsZoomed(false)
              }}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-primary/30'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
