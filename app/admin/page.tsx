import { revalidatePath } from "next/cache"

import { createNewItem, deleteItem, getAllItems } from "@/lib/actions"

function normalizeImageInput(raw: string) {
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

export default async function AdminPage() {
  const products = await getAllItems()

  async function createProduct(formData: FormData) {
    "use server"

    const name = String(formData.get("name") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const imageUrlRaw = String(formData.get("imageUrl") || "")
    const priceRaw = String(formData.get("price") || "").trim()

    const price = Number.parseFloat(priceRaw)

    if (!name) throw new Error("Name is required")
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Price must be a valid non-negative number")
    }

    const imageUrl = normalizeImageInput(imageUrlRaw)

    await createNewItem(name, description || "", imageUrl ?? "", price)

    revalidatePath("/")
    revalidatePath("/admin")
  }

  async function removeProduct(formData: FormData) {
    "use server"

    const idRaw = String(formData.get("itemId") || "")
    const itemId = Number.parseInt(idRaw, 10)
    if (!Number.isFinite(itemId)) return

    await deleteItem(itemId)

    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/cart")
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Admin</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add and remove products (no auth enabled).
        </p>
      </div>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Add product</h2>

        <form action={createProduct} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Name
              <input
                name="name"
                className="mt-1 h-10 w-full rounded-md border border-gray-200 px-3"
                placeholder="Black Hoodie"
                required
              />
            </label>
          </div>

          <label className="text-sm font-medium text-gray-700">
            Price (EUR)
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              className="mt-1 h-10 w-full rounded-md border border-gray-200 px-3"
              placeholder="70.00"
              required
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Image URL (optional)
            <input
              name="imageUrl"
              className="mt-1 h-10 w-full rounded-md border border-gray-200 px-3"
              placeholder="https://... or /local-image.jpg"
            />
          </label>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Description (optional)
              <textarea
                name="description"
                className="mt-1 min-h-24 w-full rounded-md border border-gray-200 px-3 py-2"
                placeholder="Soft, warm, everyday hoodie."
              />
            </label>
          </div>

          <div className="sm:col-span-2">
            <button className="h-10 rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800">
              Create product
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Products</h2>

        {products.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">No products yet.</p>
        ) : (
          <div className="mt-4 divide-y">
            {products.map((p) => (
              <div
                key={p.itemId}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {p.itemName}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    €{p.itemPrice.toFixed(2)} · ID {p.itemId}
                  </p>
                </div>

                <form action={removeProduct}>
                  <input type="hidden" name="itemId" value={p.itemId} />
                  <button className="h-9 rounded-md border border-gray-200 px-3 text-sm hover:bg-gray-50">
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}