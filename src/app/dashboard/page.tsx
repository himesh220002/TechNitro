'use client'

import { Product } from '@/types/product'
import GradientBackground from '@/components/GradientBackground'
import { useState, useEffect } from 'react'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardStats from '@/components/dashboard/DashboardStats'
import DashboardFilters from '@/components/dashboard/DashboardFilters'
import DashboardProductList from '@/components/dashboard/DashboardProductList'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import { Plus, Download, Upload } from 'lucide-react'

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showInStockOnly, setShowInStockOnly] = useState(false)

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Filtering Logic
  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = category === 'all' || product.category.toLowerCase() === category
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase())
      const matchesStock = !showInStockOnly || product.inventory > 0

      return matchesCategory && matchesSearch && matchesStock
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'stock': return a.inventory - b.inventory
        case 'newest': return -1 // Mock newest
        default: return 0 // Default (name or id)
      }
    })

  // Stats Logic
  const stats = products.reduce(
    (acc, product) => {
      if (product.inventory === 0) acc.outOfStock++
      else if (product.inventory < 5) acc.lowStock++
      acc.totalValue += product.price * product.inventory
      return acc
    },
    { outOfStock: 0, lowStock: 0, totalValue: 0 }
  )

  // Selection Logic
  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map(p => p.id))
    }
  }

  return (
    <GradientBackground>
      <div className="flex min-h-screen">
        <DashboardSidebar />

        <main className="flex-1 lg:ml-64 p-6 lg:p-10">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage your products and view performance</p>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 transition-colors">
                <Upload size={18} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 transition-colors">
                <Download size={18} />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/25 transition-all">
                <Plus size={18} />
                <span>Add Product</span>
              </button>
            </div>
          </header>

          {/* Stats */}
          <DashboardStats
            totalProducts={products.length}
            lowStock={stats.lowStock}
            outOfStock={stats.outOfStock}
            totalValue={stats.totalValue}
          />

          {/* Charts */}
          <DashboardCharts />

          {/* Filters */}
          <DashboardFilters
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showInStockOnly={showInStockOnly}
            setShowInStockOnly={setShowInStockOnly}
          />

          {/* Product List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
            </div>
          ) : (
            <DashboardProductList
              products={filteredProducts}
              selectedIds={selectedIds}
              toggleSelection={toggleSelection}
              toggleAll={toggleAll}
            />
          )}
        </main>
      </div>
    </GradientBackground>
  )
}
