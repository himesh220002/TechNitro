//src/components/ProductFilter.tsx
'use client'

import React, { useState } from 'react'
import { Product } from '@/types/product'
import ProductCard from '@/components/ProductCard'

interface Props {
  products: Product[]
}

export default function ProductFilter({ products }: Props) {
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(9)

  const sorted = [...products].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  )

  const filtered = query
    ? sorted.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : sorted

  const visibleProducts = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleLoadMore = () => {
    const remaining = filtered.length - visibleCount
    const nextBatch = remaining >= 6 ? 6 : remaining
    setVisibleCount(visibleCount + nextBatch)
  }

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by name or category"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setVisibleCount(9) // reset count on new search
          }}
          className="mb-4 flex-1 px-4 py-1 sm:py-3 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none w-full max-w-xl"
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-6">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
