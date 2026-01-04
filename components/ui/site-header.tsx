import Link from "next/link"
import { Suspense } from "react"
import { getCartItems } from "@/lib/actions"
import { getCurrentCustomerId } from "@/lib/currentCustomer"

async function CartCount() {
  const customerId = getCurrentCustomerId()
  const cartRows = await getCartItems(customerId)
  const count = cartRows.reduce((sum, r) => sum + (r.cartItemQuantity ?? 0), 0)

  return <>({count})</>
}

function CartCountFallback() {
  return (
    <span className="inline-block h-4 w-4 animate-pulse rounded bg-gray-200" />
  )
}

export default function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-base font-semibold text-gray-900">
          Simple Store
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            Products
          </Link>
          <Link href="/cart" className="text-gray-700 hover:text-gray-900">
            Cart{" "}
            <Suspense fallback={<CartCountFallback />}>
              <CartCount />
            </Suspense>
          </Link>
          <Link href="/account" className="text-gray-700 hover:text-gray-900">
            Account
          </Link>
        </nav>
      </div>
    </header>
  )
}