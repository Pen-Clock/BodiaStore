import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import {SiteHeader} from "../components/ui/site-header"
import { CartProvider } from "@/lib/cart-store"
import { getCartWithDetails } from "@/lib/actions"
import { getCurrentCustomerId } from "@/lib/currentCustomer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "BodiaStore",
  description: "prototype I",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customerId = getCurrentCustomerId()
  const cartRows = await getCartWithDetails(customerId)

  const initialCart = cartRows.map((r) => ({
    itemId: r.itemId,
    name: r.name,
    image: r.image,
    unitPrice: r.unitPrice,
    quantity: r.quantity,
  }))

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider initialItems={initialCart} customerId={customerId}>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}