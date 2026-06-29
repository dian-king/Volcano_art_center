"use client"
import { create } from "zustand"
import type { CartItem } from "@/types"

interface CartStore {
  guestItems: CartItem[]
  count: number
  isOpen: boolean
  setCount: (n: number) => void
  setOpen: (open: boolean) => void
  addGuestItem: (productId: string) => void
  removeGuestItem: (productId: string) => void
  clearGuestCart: () => void
  loadFromStorage: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  guestItems: [],
  count: 0,
  isOpen: false,
  setCount: (count) => set({ count }),
  setOpen: (isOpen) => set({ isOpen }),
  addGuestItem: (productId) => {
    const items = get().guestItems
    const existing = items.find((i) => i.productId === productId)
    const newItems = existing
      ? items.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i))
      : [...items, { productId, quantity: 1 }]
    localStorage.setItem("vac-cart", JSON.stringify(newItems))
    set({ guestItems: newItems, count: newItems.reduce((s, i) => s + i.quantity, 0) })
  },
  removeGuestItem: (productId) => {
    const newItems = get().guestItems.filter((i) => i.productId !== productId)
    localStorage.setItem("vac-cart", JSON.stringify(newItems))
    set({ guestItems: newItems, count: newItems.reduce((s, i) => s + i.quantity, 0) })
  },
  clearGuestCart: () => {
    localStorage.removeItem("vac-cart")
    set({ guestItems: [], count: 0 })
  },
  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem("vac-cart")
      if (stored) {
        const items = JSON.parse(stored) as CartItem[]
        set({ guestItems: items, count: items.reduce((s, i) => s + i.quantity, 0) })
      }
    } catch {}
  },
}))