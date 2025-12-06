'use client'

import { useState } from 'react'
import { Product } from '@/types/product'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function StickyBuyPanel({ product }: { product: Product }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState<number>(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const increase = () => setQuantity((q) => Math.min(q + 1, product.inventory))
  const decrease = () => setQuantity((q) => Math.max(1, q - 1))

  const handleAddToCart = async () => {
    if (product.inventory <= 0) {
      toast.error('Out of stock')
      return
    }

    setIsAdding(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600))

    // Add multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }

    setIsAdding(false)
    setIsAdded(true)

    setTimeout(() => setIsAdded(false), 2000)
  }

  const buyNow = () => {
    if (product.inventory <= 0) return toast.error('Out of stock')
    localStorage.setItem('checkoutItem', JSON.stringify({ ...product, quantity }))
    router.push('/checkout?source=buy-now')
  }

  return (
    <aside className="hidden md:block sticky top-24 self-start">
      <div className="w-72 rounded-xl bg-gray-800/60 border border-gray-700 p-6 backdrop-blur-lg">
        <div className="mb-4">
          <div className="text-sm text-gray-300">Price</div>
          <div className="text-2xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">₹{product.price.toLocaleString('en-IN')}</div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-300">Quantity</div>
          <div className="mt-2 flex items-center gap-3">
            <button onClick={decrease} className="px-3 py-1 rounded bg-gray-700 text-white">−</button>
            <div className="px-3 py-1 rounded border border-gray-700 bg-gray-900 text-white">{quantity}</div>
            <button onClick={increase} className="px-3 py-1 rounded bg-gray-700 text-white">+</button>
            <div className="ml-auto text-sm text-gray-400">{product.inventory} available</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded text-white transition-all duration-300 ${product.inventory > 0
              ? isAdded
                ? 'bg-green-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-gray-600 cursor-not-allowed'
              }`}
            disabled={product.inventory <= 0 || isAdding}
          >
            {isAdding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isAdded ? (
              <>
                <Check className="w-5 h-5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Add to cart</span>
              </>
            )}
          </button>
          <button onClick={buyNow} className={`px-4 py-2 rounded text-white ${product.inventory > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`} disabled={product.inventory <= 0}>Buy now</button>
          <div className="flex gap-2 mt-2">
            <button className="flex-1 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center gap-2">
              ❤️ Wishlist
            </button>
            <button className="flex-1 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center gap-2">
              🔍 Compare
            </button>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-400">Secure payment • 7-day returns</div>
      </div>
    </aside>
  )
}
