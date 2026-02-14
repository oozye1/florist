'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  productId: string
  name: string
  price: number
  imageUrl: string
  slug: string
}

interface WishlistStore {
  items: WishlistItem[]

  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  toggleItem: (item: WishlistItem) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getItemCount: () => number
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.productId === item.productId)) {
            return state
          }
          return { items: [...state.items, item] }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId)
          if (exists) {
            return { items: state.items.filter((i) => i.productId !== item.productId) }
          }
          return { items: [...state.items, item] }
        }),

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId)
      },

      clearWishlist: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.length
      },
    }),
    {
      name: 'love-blooms-wishlist',
    }
  )
)
