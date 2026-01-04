"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useTransition,
  ReactNode,
} from "react"
import {
  addItemToCart as serverAddItem,
  removeItemFromCart as serverRemoveItem,
  updateCartItemQuanity as serverUpdateQuantity,
  clearCustomerCart as serverClearCart,
  checkoutCustomerCart as serverCheckout,
} from "./actions"

export type CartItem = {
  itemId: number
  name: string
  image: string | null
  unitPrice: number
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  count: number
  isPending: boolean
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (itemId: number) => void
  updateQuantity: (itemId: number, quantity: number) => void
  clear: () => void
  checkout: () => Promise<{ orderId: number } | null>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({
  children,
  initialItems,
  customerId,
}: {
  children: ReactNode
  initialItems: CartItem[]
  customerId: number
}) {
  const [items, setItems] = useState<CartItem[]>(initialItems)
  const [isPending, startTransition] = useTransition()

  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      // instant UI update
      setItems((prev) => {
        const existing = prev.find((i) => i.itemId === item.itemId)
        if (existing) {
          return prev.map((i) =>
            i.itemId === item.itemId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        }
        return [...prev, { ...item, quantity }]
      })

      // background server sync
      startTransition(async () => {
        await serverAddItem(customerId, item.itemId, quantity)
      })
    },
    [customerId]
  )

  const removeItem = useCallback(
    (itemId: number) => {
      // Instant UI update
      setItems((prev) => prev.filter((i) => i.itemId !== itemId))

      // background server sync
      startTransition(async () => {
        await serverRemoveItem(customerId, itemId)
      })
    },
    [customerId]
  )

  const updateQuantity = useCallback(
    (itemId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId)
        return
      }

      // instant UI update
      setItems((prev) =>
        prev.map((i) => (i.itemId === itemId ? { ...i, quantity } : i))
      )

      // background server sync
      startTransition(async () => {
        await serverUpdateQuantity(customerId, itemId, quantity)
      })
    },
    [customerId, removeItem]
  )

  const clear = useCallback(() => {
    // instant UI update
    setItems([])

    // background server sync
    startTransition(async () => {
      await serverClearCart(customerId)
    })
  }, [customerId])

  const checkout = useCallback(async (): Promise<{ orderId: number } | null> => {
    const itemIds = items.map((i) => i.itemId)
    if (itemIds.length === 0) return null

    // clear cart immediately
    setItems([])

    // wait for server to process checkout
    const result = await serverCheckout(customerId, itemIds)
    return { orderId: result.orderId }
  }, [customerId, items])

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        isPending,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
