'use client'

import { Product } from '@/types/product'
import { useState, useEffect } from 'react'
import DashboardWrapper from '@/components/dashboard/DashboardWrapper'
import DashboardStats from '@/components/dashboard/DashboardStats'
import DashboardFilters from '@/components/dashboard/DashboardFilters'
import DashboardProductList from '@/components/dashboard/DashboardProductList'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import { Plus, Download, Upload, Trash2, X, Lock, Unlock, Key } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import { toast } from 'react-hot-toast'
import { useBudgetLock } from '@/hooks/useBudgetLock'
import { motion, AnimatePresence } from 'framer-motion'

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

  // Edit Lock State
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const { isEditingEnabled, formatTime, lock, unlock } = useBudgetLock('admin_dashboard_unlock_expiry')

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

  const handleUnlockClick = () => {
    setShowPasswordModal(true)
    setPasswordInput('')
  }

  const verifyPassword = (e: React.FormEvent) => {
    e.preventDefault()
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_EDIT_PASSWORD || 'admin123'
    if (passwordInput === validPassword) {
      unlock()
      setShowPasswordModal(false)
    } else {
      toast.error('Incorrect password')
    }
  }


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
        <div className="flex gap-2">
          {!isEditingEnabled ? (
            <button
              onClick={handleUnlockClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <Lock size={16} />
              Unlock Dashboard
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-xs font-medium text-purple-200">
                  Active
                </span>
                <span className="text-xs text-gray-500 border-l border-gray-700 pl-2 ml-1 font-mono min-w-[40px]">
                  {formatTime()}
                </span>
              </div>
              <button
                onClick={lock}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20"
              >
                <Unlock size={16} />
                Lock Dashboard
              </button>
            </div>
          )}
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

      {/* Locked Content Check */}
      {!isEditingEnabled ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center mt-8">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
            <Lock size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Product List Locked</h3>
          <p className="text-gray-400 max-w-md">
            Management actions and product lists are protected.
            Please unlock to view or edit.
          </p>
          <button
            onClick={handleUnlockClick}
            className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium"
          >
            Unlock Dashboard
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}


      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Key className="text-purple-500" size={20} />
                  Unlock Dashboard
                </h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={verifyPassword}>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Editor Password</label>
                  <input
                    type="password"
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Enter password..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 font-medium"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardWrapper>
  )
}
