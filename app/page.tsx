import { Suspense } from "react"
import { ProductCard } from "@/components/ui/product-card"
import { getAllItems } from "@/lib/actions"
import { getCurrentCustomerId } from "@/lib/currentCustomer"

function ProductSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-lg border bg-white p-4">
      <div className="mb-3 aspect-4/5 w-full rounded-md bg-gray-200" />
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-1/4 rounded bg-gray-200" />
      <div className="mt-4 h-9 w-full rounded bg-gray-200" />
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}

async function ProductGrid() {
  const items = await getAllItems()
  const customerId = getCurrentCustomerId()

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm text-gray-700">
        No products yet. Add some in the admin page.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={p.itemId} p={p} customerId={customerId} />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <p className="mt-1 text-sm text-gray-600">
          Bodia Store
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  )
}