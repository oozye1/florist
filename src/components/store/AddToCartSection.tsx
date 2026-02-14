'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, ShoppingBag, Gift, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/types'

export default function AddToCartSection({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.id || '')
  const [quantity, setQuantity] = useState(1)
  const [showGiftMessage, setShowGiftMessage] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const [added, setAdded] = useState(false)
  const addItem = useCart((s) => s.addItem)

  const variant = product.variants.find((v) => v.id === selectedVariant)
  const totalPrice = (product.price + (variant?.priceModifier || 0)) * quantity

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        variantId: selectedVariant || undefined,
        name: product.name,
        variantName: variant?.name,
        price: product.price + (variant?.priceModifier || 0),
        imageUrl: product.images[0]?.url || '',
        giftMessage: giftMessage || undefined,
        slug: product.slug,
      })
    }
    setAdded(true)
    toast.success(`${product.name} added to cart!`)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Variant Selector */}
      {product.variants.length > 1 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Size</label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v.id)}
                disabled={!v.inStock}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedVariant === v.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-input hover:border-primary/50 text-foreground'
                } ${!v.inStock ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}`}
              >
                {v.name}
                {v.priceModifier !== 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({v.priceModifier > 0 ? '+' : ''}
                    {formatPrice(v.priceModifier)})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium mb-2 block">Quantity</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-input hover:bg-muted transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-lg font-medium w-8 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-input hover:bg-muted transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gift Message */}
      <div>
        <button
          onClick={() => setShowGiftMessage(!showGiftMessage)}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Gift className="w-4 h-4" />
          {showGiftMessage ? 'Remove gift message' : 'Add a gift message'}
        </button>
        {showGiftMessage && (
          <div className="mt-3">
            <Textarea
              placeholder="Write your personal message here (max 200 characters)..."
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value.slice(0, 200))}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {giftMessage.length}/200 characters
            </p>
          </div>
        )}
      </div>

      {/* Add to Cart */}
      <div className="flex items-center gap-4">
        <Button
          size="xl"
          onClick={handleAddToCart}
          disabled={!product.inStock || added}
          className="flex-1"
        >
          {added ? (
            <>
              <Check className="w-5 h-5" />
              Added!
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              Add to Cart — {formatPrice(totalPrice)}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
