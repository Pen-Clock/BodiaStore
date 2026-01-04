"use client"

import { useMemo, useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  checkoutCustomerCart,
  clearCustomerCart,
  removeItemFromCart,
  updateCartItemQuanity,
} from "@/lib/actions"

export type CartLine = {
  itemId: number
  name: string
  image: string | null
  unitPrice: number
  quantity: number
}

type OptimisticAction =
  | { type: "update"; itemId: number; quantity: number }
  | { type: "remove"; itemId: number }
  | { type: "clear" }

function cartReducer(state: CartLine[], action: OptimisticAction): CartLine[] {
  switch (action.type) {
    case "update":
      return state.map((item) =>
        item.itemId === action.itemId
          ? { ...item, quantity: action.quantity }
          : item
      )
    case "remove":
      return state.filter((item) => item.itemId !== action.itemId)
    case "clear":
      return []
  }
}

export default function CartClient({
  initialItems,
  customerId,
}: {
  initialItems: CartLine[]
  customerId: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [items, addOptimistic] = useOptimistic(initialItems, cartReducer)

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  }, [items])

  const handleQuantityChange = (itemId: number, quantity: number) => {
    startTransition(async () => {
      addOptimistic({ type: "update", itemId, quantity })
      await updateCartItemQuanity(customerId, itemId, quantity)
      router.refresh()
    })
  }

  const remove = (itemId: number) => {
    startTransition(async () => {
      addOptimistic({ type: "remove", itemId })
      await removeItemFromCart(customerId, itemId)
      router.refresh()
    })
  }

  const clear = () => {
    startTransition(async () => {
      addOptimistic({ type: "clear" })
      await clearCustomerCart(customerId)
      router.refresh()
    })
  }

  const checkoutAll = () => {
    const itemIds = items.map((i) => i.itemId)

    startTransition(async () => {
      const res = await checkoutCustomerCart(customerId, itemIds)
      router.push(`/account?orderId=${res.orderId}`)
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">Cart</h1>
        <p className="mt-2 text-sm text-gray-600">Your cart is empty.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Cart</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update quantities or remove items.
          </p>
        </div>
        <Button variant="outline" disabled={isPending} onClick={clear}>
          Clear cart
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.itemId}
            className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">{item.name}</p>
              <p className="mt-1 text-sm text-gray-600">
                €{item.unitPrice.toFixed(2)} each
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                className="h-9 w-20 rounded-md border border-gray-200 px-2 text-center"
                value={item.quantity}
                onChange={(e) => {
                  const q = Math.max(0, parseInt(e.target.value || "0", 10))
                  handleQuantityChange(item.itemId, q)
                }}
              />

              <div className="w-28 text-right text-sm text-gray-900">
                €{(item.unitPrice * item.quantity).toFixed(2)}
              </div>

              <Button
                variant="ghost"
                disabled={isPending}
                onClick={() => remove(item.itemId)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-stretch justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
        <div className="text-sm text-gray-700">
          Subtotal:{" "}
          <span className="font-semibold text-gray-900">
            €{subtotal.toFixed(2)}
          </span>
        </div>
        <Button disabled={isPending} onClick={checkoutAll}>
          {isPending ? "Processing..." : "Checkout"}
        </Button>
      </div>
    </div>
  )
}