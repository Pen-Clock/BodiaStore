import { cookies } from "next/headers"

export const DEFAULT_CUSTOMER_ID = 1

export function getCurrentCustomerId() {
  // For now everyone is treated as customer 1.
  // Later can set a cookie like: customerId=2 to switch customers.
//   const raw = cookies().get("customerId")?.value
//   const id = raw ? Number.parseInt(raw, 10) : NaN

//   if (Number.isFinite(id) && id > 0) return id
  return DEFAULT_CUSTOMER_ID
}