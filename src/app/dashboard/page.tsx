'use client'

import { Product } from '@/types/product'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'
import GradientBackground from '@/components/GradientBackground'
import { GradientHeading, LoadingCard } from '@/components/ui/LoadingStates'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'inventory'>('name')
  const [filterBy, setFilterBy] = useState<'all' | 'accessories' | 'laptops'|'smartphones'|'tablets'>('all')

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

  const filteredProducts = products
  .filter((product) => {
    const matchesCategory =
      filterBy === 'all' || product.category.toLowerCase() === filterBy
    const matchesSearch =
      product.name.toLowerCase().includes(filter.toLowerCase()) ||
      product.category.toLowerCase().includes(filter.toLowerCase())
    return matchesCategory && matchesSearch
  })
  .sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'price') return a.price - b.price
    return a.inventory - b.inventory
  })


  const stockStatus = products.reduce(
    (acc, product) => {
      if (product.inventory === 0) acc.outOfStock++
      else if (product.inventory < 5) acc.lowStock++
      acc.total++
      return acc
    },
    { outOfStock: 0, lowStock: 0, total: 0 }
  )

  return (
    <GradientBackground>
      <Navbar />
      <main className="min-h-screen py-8">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1600px] mx-auto px-6 py-16"
        >
          <GradientHeading>Inventory Overview</GradientHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { label: 'Total Products', value: stockStatus.total, color: 'from-blue-400 to-blue-600' },
              { label: 'Low Stock', value: stockStatus.lowStock, color: 'from-yellow-400 to-orange-600' },
              { label: 'Out of Stock', value: stockStatus.outOfStock, color: 'from-red-400 to-red-600' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg 
                         border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
              >
                <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="Search products..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 
                       text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <div className='flex gap-5'>
              <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
                    className="px-4 py-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                    <option className='bg-gray-900' value="all">All</option>
                    <option className='bg-gray-900' value="accessories">Accessories</option>
                    <option className='bg-gray-900' value="laptops">Laptop</option>
                    <option className='bg-gray-900' value="smartphones">Smartphone</option>
                    <option className='bg-gray-900' value="tablets">Tablet</option>
                  </select>    
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 
                        text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option className='bg-gray-900' value="name">Sort by Name</option>
                <option className='bg-gray-900' value="price">Sort by Price</option>
                <option className='bg-gray-900' value="inventory">Sort by Stock</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <LoadingCard key={i} />)
            ) : filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="block group rounded-xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 
                           backdrop-blur-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="relative aspect-square">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover bg-white transform group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-100 group-hover:text-purple-400 transition-colors">
                      {product.name}
                    </h2>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-sm ${
                        product.inventory === 0 ? 'text-red-400' :
                        product.inventory < 5 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {product.inventory === 0 ? 'Out of Stock' :
                         product.inventory < 5 ? 'Low Stock' :
                         `In Stock: ${product.inventory}`}
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        →
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </GradientBackground>
  )
}
