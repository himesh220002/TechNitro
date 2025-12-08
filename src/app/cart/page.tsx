'use client'

import { useEffect, useState, startTransition } from 'react'
import { Product } from '@/types/product'
import { useCart } from '@/context/CartContext'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const router = useRouter()
  const { items: cart, updateQuantity, removeFromCart } = useCart()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate hydration delay or just set loading false immediately since context handles hydration
    setLoading(false)
  }, [])

  const increaseQty = (id: string) => {
    const item = cart.find(i => i.id === id)
    if (item && item.quantity < item.inventory) {
      updateQuantity(id, item.quantity + 1)
    }
  }

  const decreaseQty = (id: string) => {
    const item = cart.find(i => i.id === id)
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1)
    }
  }

  const removeItem = (id: string) => {
    removeFromCart(id)
  }

  const handleCheckout = () => {
    router.push('/checkout?source=cart')
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  function SkeletonCartItem() {
    return (
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 p-6 animate-pulse">
        <div className="flex gap-6">
          <div className="w-24 h-24 bg-gray-700/50 rounded-lg" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-700/50 rounded-full w-48" />
            <div className="h-4 bg-gray-700/50 rounded-full w-24" />
            <div className="flex items-center gap-4">
              <div className="h-8 bg-gray-700/50 rounded-lg w-32" />
              <div className="h-8 bg-gray-700/50 rounded-full w-24" />
            </div>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-8">
          <span className="text-2xl sm:text-3xl">🛒</span>
          <h1 className="text-xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Your Cart
          </h1>
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCartItem key={i} />
            ))}
          </div>
        ) : cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-6xl mb-4">🛍️</span>
            <h2 className="text-2xl font-semibold text-gray-400 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some awesome products to your cart</p>
            <Link
              href="/products"
              className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 
                     transition-colors flex items-center gap-2"
            >
              <span>🏪</span> Continue Shopping
            </Link>
          </div>
        ) : (
          <div>
            <div className="space-y-2 sm:space-y-6 mb-8">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 
                         backdrop-blur-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="p-3 sm:p-6">
                    <div className="flex gap-6">
                      <div className="relative w-24 h-24 hidden sm:block">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="96px"
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 rounded-lg">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-200">{item.name}</h2>
                        <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 
                                  bg-clip-text text-transparent mt-1">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-3 px-3 py-1 rounded-lg bg-gray-800/50 
                                      backdrop-blur-sm border border-gray-700">
                            <button
                              onClick={() => decreaseQty(item.id)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              −
                            </button>
                            <span className="text-gray-200 font-medium min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseQty(item.id)}
                              disabled={item.quantity >= item.inventory}
                              className={`transition-colors ${item.quantity >= item.inventory
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'text-gray-400 hover:text-white'
                                }`}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm text-gray-400">
                            {item.quantity >= item.inventory ? (
                              <span className="text-yellow-500">Max quantity reached</span>
                            ) : (
                              `${item.inventory - item.quantity} more available`
                            )}
                          </p>
                          <p className="ml-auto text-lg font-medium text-gray-300">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-500 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800/95 to-gray-900/95 
                         backdrop-blur-lg border border-gray-700/50 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Total ({cart.length} items)</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 
                             bg-clip-text text-transparent">
                    ₹{total.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 
                         text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all
                         flex items-center justify-center gap-2"
                >
                  <span>🔒</span> Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
