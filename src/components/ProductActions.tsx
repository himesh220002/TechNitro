'use client'

import { useState } from 'react'
import { Product } from '@/types/product'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function ProductActions({ product }: { product: Product }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = async () => {
    if (product.inventory <= 0) {
      toast.error('Out of stock')
      return
    }

    setIsAdding(true)

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 600))

    addToCart(product)
    setIsAdding(false)
    setIsAdded(true)

    // Reset state after 2 seconds
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (product.inventory <= 0) {
      toast.error('Out of stock')
      return
    }
    localStorage.setItem('checkoutItem', JSON.stringify({ ...product, quantity: 1 }))
    router.push('/checkout?source=buy-now')
  }

  return (
    <div className="mt-0 sm:mt-8 flex gap-2 sm:gap-4">
      <button
        className={`relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-semibold rounded-xl transition-all duration-300 overflow-hidden ${product.inventory > 0
          ? isAdded
            ? 'bg-green-600 text-white'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30'
          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        onClick={handleAddToCart}
        disabled={product.inventory <= 0 || isAdding}
      >
        {isAdding ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isAdded ? (
          <>
            <Check className="w-5 h-5" />
            <span className="hidden sm:inline">Added</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Add to Cart</span>
          </>
        )}
      </button>

      <button
        className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-semibold rounded-xl transition-all duration-300 ${product.inventory > 0
          ? 'bg-white text-black hover:bg-gray-100 hover:shadow-lg hover:shadow-white/10'
          : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
          }`}
        onClick={handleBuyNow}
        disabled={product.inventory <= 0}
      >
        <ShoppingCart className="w-5 h-5 sm:hidden" />
        <span>{product.inventory > 0 ? 'Buy Now' : 'Out of stock'}</span>
      </button>
    </div>
  )
}
