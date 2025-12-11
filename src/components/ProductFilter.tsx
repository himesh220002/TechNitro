//src/components/ProductFilter.tsx
'use client'

import React, { useState } from 'react'
import { Product } from '@/types/product'
import ProductCard from '@/components/ProductCard'
import { Search, SlidersHorizontal } from 'lucide-react'

interface Props {
  products: Product[]
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular'

export default function ProductFilter({ products }: Props) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [visibleCount, setVisibleCount] = useState(10)

  const getSortedProducts = (items: Product[]) => {
    switch (sortBy) {
      case 'price-low':
        return [...items].sort((a, b) => a.price - b.price)
      case 'price-high':
        return [...items].sort((a, b) => b.price - a.price)
      case 'popular':
        // Mock popularity based on ID or random
        return [...items].sort((a, b) => (b.id.length) - (a.id.length))
      case 'newest':
      default:
        return [...items].sort(
          (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        )
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  )

  const sortedAndFiltered = getSortedProducts(filtered)
  const visibleProducts = sortedAndFiltered.slice(0, visibleCount)
  const hasMore = visibleCount < sortedAndFiltered.length

  const handleLoadMore = () => {
    const remaining = sortedAndFiltered.length - visibleCount
    const nextBatch = remaining >= 5 ? 5 : remaining
    setVisibleCount(visibleCount + nextBatch)
  }

  return (
    <div className="mt-10">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-gray-900/50 p-4 rounded-2xl backdrop-blur-sm border border-gray-800">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setVisibleCount(10)
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <SlidersHorizontal className="text-gray-400 w-5 h-5 hidden md:block" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full md:w-48 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
          >
            <option value="newest" className="bg-gray-800 text-gray-200">Newest Arrivals</option>
            <option value="price-low" className="bg-gray-800 text-gray-200">Price: Low to High</option>
            <option value="price-high" className="bg-gray-800 text-gray-200">Price: High to Low</option>
            <option value="popular" className="bg-gray-800 text-gray-200">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products found matching your criteria.</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="group relative px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Load More Products</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </button>
        </div>
      )}
    </div>
  )
}
