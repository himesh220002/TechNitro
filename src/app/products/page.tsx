'use client'

import { useEffect, useState, useMemo } from 'react'
import { Product } from '@/types/product'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GradientBackground from '@/components/GradientBackground'
import ProductFilters from '@/components/products/ProductFilters'
import ProductSort from '@/components/products/ProductSort'
import ProductGrid from '@/components/products/ProductGrid'
import { Search } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: [] as string[],
    priceRange: [0, 200000] as [number, number],
    rating: null as number | null
  })
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Derived data for filters
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return Array.from(cats)
  }, [products])

  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 200000 }
    const prices = products.map(p => p.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  }, [products])

  useEffect(() => {
    fetchProducts()
  }, [])

  // Update price range when products load
  useEffect(() => {
    if (products.length > 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: [priceBounds.min, priceBounds.max]
      }))
    }
  }, [priceBounds.min, priceBounds.max, products.length])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch products', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }

    // Category
    if (filters.category.length > 0) {
      result = result.filter(p => filters.category.includes(p.category))
    }

    // Price
    result = result.filter(p =>
      p.price >= filters.priceRange[0] &&
      p.price <= filters.priceRange[1]
    )

    // Rating
    if (filters.rating) {
      result = result.filter(p => (p.rating || 0) >= filters.rating!)
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default: // featured - keep default order or randomize
        break
    }

    return result
  }, [products, searchQuery, filters, sortBy])

  return (
    <GradientBackground>
      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-32 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
        <div className="max-w-[1600px] mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Collection</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-8">
            Discover premium tech gadgets designed to elevate your lifestyle. From high-performance laptops to next-gen accessories.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900/60 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none backdrop-blur-xl transition-all shadow-xl"
            />
          </div>
        </div>
      </div>

      <main className="px-6 pb-20 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-[280px] shrink-0">
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              minPrice={priceBounds.min}
              maxPrice={priceBounds.max}
              categories={categories}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <ProductSort
              totalProducts={filteredProducts.length}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            <ProductGrid
              products={filteredProducts}
              viewMode={viewMode}
              loading={loading}
            />
          </div>
        </div>
      </main>

      <Footer />
    </GradientBackground>
  )
}
