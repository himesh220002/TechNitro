'use client'

import { Product } from '@/types/product'
import { useState, useEffect } from 'react'
import DashboardWrapper from '@/components/dashboard/DashboardWrapper'
import DashboardStats from '@/components/dashboard/DashboardStats'
import DashboardFilters from '@/components/dashboard/DashboardFilters'
import DashboardProductList from '@/components/dashboard/DashboardProductList'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import { Plus, Download, Upload, Trash2, X } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import { toast } from 'react-hot-toast'

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

  // Bulk Delete Handler
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    const selectedProducts = products.filter(p => selectedIds.includes(p.id))
    const productNames = selectedProducts.map(p => p.name).join(', ')

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} product(s)?\n\n${productNames}\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      // Delete all selected products
      const deletePromises = selectedIds.map(id =>
        fetch(`/api/products/${id}`, { method: 'DELETE' })
      )

      const results = await Promise.all(deletePromises)
      const successCount = results.filter(r => r.ok).length

      if (successCount === selectedIds.length) {
        toast.success(`Successfully deleted ${successCount} product(s)`)
        setSelectedIds([])
        // Refresh products
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)
      } else {
        toast.error(`Deleted ${successCount} of ${selectedIds.length} products. Some failed.`)
      }
    } catch (error) {
      toast.error('Error deleting products')
      console.error('Bulk delete error:', error)
    }
  }

  return (
    <DashboardWrapper>
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage your products and view performance</p>
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
      <DashboardCharts products={products} />

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

      {/* Bulk Actions Bar - Right above table */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium">{selectedIds.length} product(s) selected</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-gray-400 hover:text-white transition-colors"
              title="Clear selection"
            >
              <X size={18} />
            </button>
          </div>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
          >
            <Trash2 size={18} />
            Delete Selected
          </button>
        </div>
      )}

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
    </DashboardWrapper>
  )
}
