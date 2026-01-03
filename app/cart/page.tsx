import CartClient from "./cart-client"
import { getCartWithDetails } from "@/lib/actions"
import { getCurrentCustomerId } from "@/lib/currentCustomer"

export default async function CartPage() {
  const customerId = getCurrentCustomerId()
  const rows = await getCartWithDetails(customerId)

  const items = rows.map((r) => ({
    itemId: r.itemId,
    name: r.name,
    image: r.image,
    unitPrice: r.unitPrice,
    quantity: r.quantity,
  }))

  return <CartClient initialItems={items} customerId={customerId} />
}