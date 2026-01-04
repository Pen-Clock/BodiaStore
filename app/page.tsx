import { ProductCard } from "@/components/ui/product-card"
import { getAllItems } from "@/lib/actions"

export default async function Home() {
  const items = await getAllItems()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <p className="mt-1 text-sm text-gray-600">
          BodiaStore.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-gray-700">
          No products yet. Add some in the admin page.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p.itemId} p={p} />
          ))}
        </div>
      )}
    </div>
  )
}