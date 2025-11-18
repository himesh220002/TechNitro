'use client'

import { useState } from 'react'
import { Product } from '@/types/product'
import { useRouter } from 'next/navigation'
import { Toaster, toast } from 'react-hot-toast'

export default function StickyBuyPanel({ product }: { product: Product }) {
  const router = useRouter()
  const [quantity, setQuantity] = useState<number>(1)

  const increase = () => setQuantity((q) => Math.min(q + 1, product.inventory))
  const decrease = () => setQuantity((q) => Math.max(1, q - 1))

  const addToCart = () => {
    if (product.inventory <= 0) return toast.error('Out of stock')
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((p: { id: string; quantity?: number }) => p.id === product.id)
    if (existing) {
        const newQuantity = Math.min((existing.quantity || 0) + quantity, product.inventory)
        if (newQuantity === existing.quantity) {
        toast('Already added to cart at max quantity', { icon: '⚠️' })
        } else {
        existing.quantity = newQuantity
        toast.success(`Updated quantity to ${newQuantity}`)
        }
    } else {
        cart.push({ ...product, quantity })
        toast.success('Added to cart')
    }

    localStorage.setItem('cart', JSON.stringify(cart))
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
          <button onClick={addToCart} className={`px-4 py-2 rounded text-white ${product.inventory > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 cursor-not-allowed'}`} disabled={product.inventory <= 0}>Add to cart</button>
          <button onClick={buyNow} className={`px-4 py-2 rounded text-white ${product.inventory > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`} disabled={product.inventory <= 0}>Buy now</button>
        </div>

        <div className="mt-4 text-xs text-gray-400">Secure payment • 7-day returns</div>
      </div>
      <Toaster position="bottom-right" />
    </aside>
  )
}
