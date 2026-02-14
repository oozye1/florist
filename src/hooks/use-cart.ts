'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, DeliveryType } from '@/types'

interface CartStore {
  items: CartItem[]
  deliveryDate: string | null
  deliveryType: DeliveryType | null
  deliveryPostcode: string
  deliveryFee: number
  couponCode: string | null
  discountAmount: number

  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  setGiftMessage: (productId: string, message: string) => void
  setDelivery: (date: string, type: DeliveryType, postcode: string, fee: number) => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  clearCart: () => void

  getSubtotal: () => number
  getTotal: () => number
  getItemCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryDate: null,
      deliveryType: null,
      deliveryPostcode: '',
      deliveryFee: 0,
      couponCode: null,
      discountAmount: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        })),

      updateQuantity: (productId, quantity, variantId) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.productId === productId && i.variantId === variantId)
              ),
            }
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity }
                : i
            ),
          }
        }),

      setGiftMessage: (productId, message) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, giftMessage: message } : i
          ),
        })),

      setDelivery: (date, type, postcode, fee) =>
        set({
          deliveryDate: date,
          deliveryType: type,
          deliveryPostcode: postcode,
          deliveryFee: fee,
        }),

      applyCoupon: (code, discount) =>
        set({ couponCode: code, discountAmount: discount }),

      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),

      clearCart: () =>
        set({
          items: [],
          deliveryDate: null,
          deliveryType: null,
          deliveryPostcode: '',
          deliveryFee: 0,
          couponCode: null,
          discountAmount: 0,
        }),

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getTotal: () => {
        const { items, deliveryFee, discountAmount } = get()
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        return Math.max(0, subtotal + deliveryFee - discountAmount)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'love-blooms-cart',
    }
  )
)
