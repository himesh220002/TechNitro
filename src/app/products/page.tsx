'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/types/product'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GradientBackground from '@/components/GradientBackground'
import { motion } from 'framer-motion'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'inventory'>('name')
  const [filterBy, setFilterBy] = useState<'all' | 'accessories' | 'laptops'|'smartphones'|'tablets'>('all')
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const res = await fetch('/api/products')
      const data: Product[] = await res.json()

      // ✅ Step 1: Filter by category
    const filtered = filterBy === 'all'
      ? data
      : data.filter((product) => product.category.toLowerCase() === filterBy)

      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'price') return a.price - b.price
        if (sortBy === 'inventory') return a.inventory - b.inventory
        return 0
      })
      setProducts(sorted)
      setLoading(false)
    }
    fetchProducts()
  }, [filterBy, sortBy])

  function SkeletonCard() {
  return (
    <div className="rounded p-4 shadow-sm bg-gradient-to-tr from-gray-700/40 to-black/60 animate-pulse space-y-4">
      <div className="w-full h-60 bg-gray-600 rounded" />
      <div className="h-4 bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-700 rounded w-1/2" />
      <div className="h-4 bg-gray-700 rounded w-2/3" />
    </div>
  )
}


  return (
    <GradientBackground>
      <Navbar />
      <main className="p-6 max-w-[1600px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            🛍️ Explore Products
          </h1>
          <div className='flex gap-10'>
            <div className="flex items-center gap-4">
                <label className="text-gray-400 text-sm">Filter by:</label>
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
            </div>

            <div className="flex items-center gap-4">
              <label className="text-gray-400 text-sm">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option className='bg-gray-900' value="name">Name</option>
                <option className='bg-gray-900' value="price">Price</option>
                <option className='bg-gray-900' value="inventory">Stock</option>
              </select>
            </div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))
            : products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="group block rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300
                    bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg
                    border border-gray-700/50 hover:border-purple-500/50"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="object-cover bg-white w-full h-60 rounded-lg transform group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-60 bg-gray-800 flex items-center justify-center text-gray-500 rounded-lg">
                          No image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <h2 className="text-lg font-semibold text-gray-100 group-hover:text-purple-400 transition-colors">
                        {product.name}
                      </h2>
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        ₹{(product.price).toLocaleString("en-IN")}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                          {product.inventory > 0 ? (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              In Stock: {product.inventory}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              Out of Stock
                            </span>
                          )}
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
      </main>
      <Footer />
    </GradientBackground>
  )
}
