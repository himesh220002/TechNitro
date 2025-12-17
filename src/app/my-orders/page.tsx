'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import type { Order } from '@/types/order'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import OrderList from './components/OrderList'
import OrderStats from './components/OrderStats'
import OrderFilters from './components/OrderFilters'
import Link from 'next/link'
import { Package } from 'lucide-react'

export default function MyOrdersPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Filter states
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token

      // Fetch active orders (not archived, not hidden)
      const res = await fetch('/api/my-orders?archived=false&hidden=false', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : undefined
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setOrders(data)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [supabase.auth])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = useMemo(() => {
    let result = [...orders]

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.products.some(p => p.name.toLowerCase().includes(q))
      )
    }

    // Status
    if (status !== 'all') {
      result = result.filter(o => o.orderStatus === status)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'amount-desc': return b.payment - a.payment
        case 'amount-asc': return a.payment - b.payment
        case 'date-desc':
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return result
  }, [orders, search, status, sortBy])

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-24 sm:pt-24 lg:pt-34">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="text-purple-500" size={32} />
              My Orders
            </h1>
            <p className="text-gray-400 mt-1">Track and manage your recent purchases</p>
          </div>

          <div className="flex gap-4">
            <Link
              href="/my-orders/archived"
              className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all text-sm font-medium"
            >
              Archived Orders
            </Link>
            <Link
              href="/my-orders/hidden"
              className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all text-sm font-medium"
            >
              Hidden Orders
            </Link>
          </div>
        </div>

        {!loading && orders.length > 0 && <OrderStats orders={orders} />}

        <OrderFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <OrderList orders={filteredOrders} loading={loading} onUpdate={fetchOrders} />
      </main>
      <Footer />
    </div>
  )
}
