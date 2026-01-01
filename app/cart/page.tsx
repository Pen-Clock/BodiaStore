"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, User, Heart, CarIcon as CartIcon, X } from "lucide-react"
import Image from "next/image"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Black Hoodie",
      price: 70.0,
      quantity: 1,
      image: "/black-hoodie-model.jpg",
    },
    {
      id: 2,
      name: "Sleveless Shirt",
      price: 135.0,
      quantity: 1,
      image: "/blue-tank-top-model.jpg",
    },
  ])

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Shopping Cart - Left Side */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-normal text-gray-900 mb-12">Shopping cart</h1>

            {/* Cart Table Header */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-12 gap-4 mb-8 text-sm text-gray-600">
                <div className="col-span-5">Product</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-3">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Cart Items */}
              <div className="space-y-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center pb-8 border-b border-gray-100">
                    {/* Product */}
                    <div className="col-span-5 flex items-center gap-4">
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-gray-900">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="w-28 h-28 bg-gray-100 rounded shrink-0 overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-gray-900">{item.name}</span>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-gray-600">€{item.price.toFixed(2)}</div>

                    {/* Quantity */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-200 rounded text-center focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-2 text-right text-gray-900">
                      €{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Totals - Right Side */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-normal text-gray-900 mb-12">Cart totals</h2>

            <div className="space-y-8 border-t border-gray-200 pt-8">
              {/* Subtotal */}
              <div className="flex justify-between items-center pb-8 border-b border-gray-100">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">€{subtotal.toFixed(2)}</span>
              </div>

              {/* Shipping */}
              <div className="pb-8 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-gray-600">Shipping</span>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span>Free shipping</span>
                      <span className="w-1.5 h-1.5 bg-black rounded-full" />
                    </span>
                  </label>
                  <div className="text-xs text-gray-500 pl-0">Flat rate: €10.00</div>
                  <div className="text-xs text-gray-500 pl-0">Pickup: €15.00</div>
                </div>
                <p className="text-xs text-gray-500 mt-4">Shipping options will be updated during checkout.</p>
                <button className="text-sm text-gray-900 underline mt-2">Calculate shipping</button>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pb-8">
                <span className="text-gray-900 font-medium">Total</span>
                <span className="text-2xl font-medium text-gray-900">€{subtotal.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 h-14 text-base rounded">
                Proceed to checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}