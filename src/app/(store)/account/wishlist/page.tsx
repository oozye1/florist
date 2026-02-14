'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/hooks/use-wishlist'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist()
  const { addItem } = useCart()

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      slug: item.slug,
    })
    removeItem(item.productId)
    toast.success(`${item.name} added to cart`)
  }

  if (items.length === 0) {
    return (
      <div>
        <h2 className="font-serif text-2xl mb-6">My Wishlist</h2>
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">
            Your wishlist is empty. Browse our collection and save your favourites!
          </p>
          <Link href="/products">
            <Button>Browse Flowers</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl">My Wishlist</h2>
        <Button variant="ghost" size="sm" onClick={clearWishlist}>
          Clear All
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-xl border border-border overflow-hidden group"
          >
            <Link href={`/products/${item.slug}`} className="block">
              <div className="relative aspect-[3/4] bg-muted">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Heart className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </Link>

            <div className="p-4 space-y-3">
              <Link href={`/products/${item.slug}`}>
                <h3 className="font-serif text-lg font-semibold leading-snug text-foreground hover:text-primary transition-colors">
                  {item.name}
                </h3>
              </Link>

              <p className="text-lg font-bold text-foreground">
                {formatPrice(item.price)}
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
