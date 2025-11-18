'use client'

import { Product } from '@/types/product'
import { useRouter } from 'next/navigation'
import { Toaster, toast} from 'react-hot-toast'


export default function ProductActions({ product }: { product: Product }) {

  const router = useRouter()
  const handleAddToCart = () => {
    if (product.inventory <= 0) {
      toast.error('Out of stock')
      return
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const exists = cart.find((item: Product) => item.id === product.id)
    if (!exists) {
      cart.push({ ...product, quantity: 1 })
      localStorage.setItem('cart', JSON.stringify(cart))
      toast.success('Added to cart')
    } else {
      toast.error('Product already in cart')
    }
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
    <div className="mt-8 flex gap-4">
      <button
        className={`px-6 py-2 rounded transition ${product.inventory > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
        onClick={handleAddToCart}
        disabled={product.inventory <= 0}
      >
        {product.inventory > 0 ? 'Add to Cart' : 'Out of stock'}
      </button>
      <button
        className={`px-6 py-2 rounded transition ${product.inventory > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
        onClick={handleBuyNow}
        disabled={product.inventory <= 0}
      >
        {product.inventory > 0 ? 'Buy Now' : 'Out of stock'}
      </button>
      <Toaster  position='top-right'/>
    </div>
  )
}
