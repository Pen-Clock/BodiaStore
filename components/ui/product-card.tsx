"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-store"

type Product = {
  itemId: number
  itemName: string
  itemPrice: number
  itemImagePath: string | null
}

function normalizeNextImageSrc(raw: string | null) {
  if (!raw) return null
  const s = raw.trim().replace(/^['"]|['"]$/g, "")
  if (!s) return null
  if (s.startsWith("/")) return s

  try {
    const u = new URL(s)
    if (u.protocol === "http:" || u.protocol === "https:") return s
  } catch {
    // ignore
  }

  return null
}

export function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart()
  const imgSrc = normalizeNextImageSrc(p.itemImagePath)

  const handleAddToCart = () => {
    // This is now INSTANT - no waiting
    addItem({
      itemId: p.itemId,
      name: p.itemName,
      unitPrice: p.itemPrice,
      image: p.itemImagePath,
    })
  }

  return (
    <div className="w-full rounded-lg border bg-white p-4">
      <div className="relative mb-3 aspect-4/5 w-full overflow-hidden rounded-md bg-gray-100">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={p.itemName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gray-100" />
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-gray-900">
            {p.itemName}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            €{p.itemPrice.toFixed(2)}
          </p>
        </div>
      </div>

      <Button className="mt-4 w-full" onClick={handleAddToCart}>
        Add to cart
      </Button>
    </div>
  )
}