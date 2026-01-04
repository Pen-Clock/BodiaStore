"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-store"

export default function CartClient() {
  const router = useRouter()
  const { items, isPending, removeItem, updateQuantity, clear, checkout } =
    useCart()

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  }, [items])

  const handleCheckout = async () => {
    const result = await checkout()
    if (result) {
      router.push(`/account?orderId=${result.orderId}`)
    }
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
        <Button variant="outline" onClick={clear}>
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
                  updateQuantity(item.itemId, q)
                }}
              />

              <div className="w-28 text-right text-sm text-gray-900">
                €{(item.unitPrice * item.quantity).toFixed(2)}
              </div>

              <Button variant="ghost" onClick={() => removeItem(item.itemId)}>
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
        <Button onClick={handleCheckout} disabled={isPending}>
          {isPending ? "Processing..." : "Checkout"}
        </Button>
      </div>
    </div>
  )
}