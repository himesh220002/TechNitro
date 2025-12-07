//src/components/ProductCard.tsx
'use client'

import { Product } from '@/types/product'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, ShoppingCart, Star, Heart, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import QuickViewModal from './QuickViewModal'
import { useCart } from '@/context/CartContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()

  // Load wishlist state from local storage
  useEffect(() => {
    const saved = localStorage.getItem('wishlist')
    if (saved) {
      const wishlist = JSON.parse(saved)
      setIsWishlisted(wishlist.includes(product.id))
    }
  }, [product.id])

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newState = !isWishlisted
    setIsWishlisted(newState)

    const saved = localStorage.getItem('wishlist')
    let wishlist: string[] = saved ? JSON.parse(saved) : []

    if (newState) {
      if (!wishlist.includes(product.id)) wishlist.push(product.id)
    } else {
      wishlist = wishlist.filter(id => id !== product.id)
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowQuickView(true)
  }

  return (
    <>
      <div className="group relative rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square bg-white overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
              No image
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-sm transition-colors ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-400 hover:text-red-500'
              }`}
          >
            <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
          </button>

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={handleQuickView}
              className="p-3 bg-white text-gray-900 rounded-full hover:bg-purple-500 hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg"
              title="Quick View"
            >
              <Eye size={20} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`p-3 rounded-full transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 shadow-lg ${isAdded
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-900 hover:bg-purple-500 hover:text-white'
                }`}
              title="Add to Cart"
            >
              {isAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
            </button>
          </div>
        </div>

        {/* Content */}
        <Link href={`/products/${product.slug}`} className="flex-1 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <Star className="w-3 h-3 fill-yellow-400" />
              <span>4.5</span>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
            <span className={`text-xs px-2 py-1 rounded-full self-start ${product.inventory > 0
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
              {product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </Link>
      </div>

      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  )
}
