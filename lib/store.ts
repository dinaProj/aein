import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from './types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, size: string) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product, size: string) => {
        const items = get().items
        const existingItem = items.find(
          (item) => item.product.id === product.id && item.selectedSize === size
        )
        
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id && item.selectedSize === size
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          })
        } else {
          set({
            items: [...items, { product, quantity: 1, selectedSize: size }],
          })
        }
      },
      
      removeItem: (productId: string, size: string) => {
        set({
          items: get().items.filter(
            (item) => !(item.product.id === productId && item.selectedSize === size)
          ),
        })
      },
      
      updateQuantity: (productId: string, size: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId && item.selectedSize === size
              ? { ...item, quantity }
              : item
          ),
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'aein-cart',
    }
  )
)
