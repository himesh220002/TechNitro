'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Truck, Package, CheckCircle, Clock, MapPin, RefreshCw,
  Share2, AlertCircle, Phone, ArrowRight, Copy
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

type ShippingEvent = {
  location: string
  status: 'active' | 'inactive'
  visible: boolean
  timestamp: string
  mode?: 'train' | 'flight' | 'truck'
  arrivalTime?: string
}

const statusStages = [
  { label: 'Order Placed', icon: Package },
  { label: 'Order Confirmed', icon: CheckCircle },
  { label: 'Packed', icon: Package },
  { label: 'Shipping', icon: Truck },
  { label: 'Shipped', icon: Truck },
  { label: 'Out for Delivery', icon: Truck },
  { label: 'Delivered', icon: CheckCircle },
]

export default function TrackOrderClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialId = searchParams?.get('id') || ''

  const [orderId, setOrderId] = useState<string>(initialId)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [shippingEvents, setShippingEvents] = useState<ShippingEvent[]>([])
  const [error, setError] = useState<string>('')

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60000) // 1 min default
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const validateId = (id: string) => {
    // Basic UUID validation or length check
    if (id.length < 8) return 'Order ID is too short'
    return ''
  }

  const fetchStatus = useCallback(async () => {
    if (!orderId) return

    const validationError = validateId(orderId)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/order-status?id=${orderId}`)
      if (!res.ok) throw new Error('Order not found')

      const data = await res.json()
      setStatus(data.orderStatus)
      setShippingEvents(data.shippingEvents || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch status:', err)
      setError('Order not found. Please check the ID and try again.')
      setStatus('')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (initialId) {
      fetchStatus()
    }
  }, [initialId, fetchStatus])

  useEffect(() => {
    if (!autoRefresh || !status || status === 'Delivered') return

    const interval = setInterval(fetchStatus, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, status, fetchStatus])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderId) {
      router.push(`/track-order?id=${orderId}`)
      fetchStatus()
    }
  }

  const copyTrackingLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Tracking link copied!')
  }

  const currentStageIndex = statusStages.findIndex(s => s.label === status)
  const progress = Math.max(0, (currentStageIndex / (statusStages.length - 1)) * 100)

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4">
            <Truck className="w-8 h-8 text-purple-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Track Your Order</h1>
          <p className="text-gray-400">Enter your order ID to get real-time updates</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12 relative">
          <input
            type="text"
            placeholder="Enter Order ID (e.g., 123e4567...)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none transition-all pl-14"
          />
          <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors"
          >
            Track
          </button>
        </form>

        {error && (
          <div className="max-w-xl mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Tracking Result */}
        <AnimatePresence mode="wait">
          {status && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <div className="rounded-3xl bg-gray-900/50 border border-gray-800 backdrop-blur-xl overflow-hidden">
                {/* Top Bar */}
                <div className="p-6 border-b border-gray-800 flex flex-wrap gap-4 justify-between items-center bg-gray-900/80">
                  <div>
                    <p className="text-sm text-gray-400">Order ID</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white font-medium">{orderId}</span>
                      <button onClick={() => { navigator.clipboard.writeText(orderId); toast.success('ID Copied') }} className="text-gray-500 hover:text-white">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                      <span>Updated: {lastUpdated?.toLocaleTimeString()}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                      <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${autoRefresh ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'
                          }`}
                      >
                        Auto {autoRefresh ? 'On' : 'Off'}
                      </button>
                      {autoRefresh && (
                        <select
                          value={refreshInterval}
                          onChange={(e) => setRefreshInterval(Number(e.target.value))}
                          className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer"
                        >
                          <option value={30000}>30s</option>
                          <option value={60000}>1m</option>
                          <option value={300000}>5m</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-10">
                  {/* Current Status Large */}
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium mb-4">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                      </span>
                      {status}
                    </div>
                    {status === 'Delivered' ? (
                      <h2 className="text-2xl font-bold text-white">Arrived on {new Date().toLocaleDateString()}</h2>
                    ) : (
                      <h2 className="text-2xl font-bold text-white">Estimated Delivery: {new Date(Date.now() + 86400000 * 2).toLocaleDateString()}</h2>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="relative mb-12 px-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 rounded-full" />
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />

                    <div className="relative flex justify-between w-full">
                      {statusStages.map((stage, index) => {
                        const isActive = index <= currentStageIndex
                        const isCurrent = index === currentStageIndex

                        return (
                          <div key={stage.label} className="flex flex-col items-center gap-2 group">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${isActive
                                  ? 'bg-gray-900 border-purple-500 text-purple-500'
                                  : 'bg-gray-900 border-gray-700 text-gray-600'
                                } ${isCurrent ? 'ring-4 ring-purple-500/20 scale-110' : ''}`}
                            >
                              <stage.icon size={14} />
                            </div>
                            <span className={`absolute top-10 text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors ${isActive ? 'text-white' : 'text-gray-600'
                              } ${isCurrent ? 'opacity-100' : 'opacity-0 sm:opacity-100 group-hover:opacity-100'}`}>
                              {stage.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Detailed Timeline */}
                  {shippingEvents.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-gray-800">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <MapPin className="text-purple-500" size={20} />
                        Shipping Activity
                      </h3>

                      <div className="relative border-l-2 border-gray-800 ml-3 space-y-8 pb-4">
                        {[...shippingEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((event, index) => (
                          <div key={index} className="relative pl-8">
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-gray-900 ${index === 0 ? 'border-purple-500 animate-pulse' : 'border-gray-600'
                              }`} />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <p className="text-white font-medium">{event.location}</p>
                                <p className="text-sm text-gray-400">{event.mode ? `Departed via ${event.mode}` : 'Arrived at facility'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-400">
                                  {new Date(event.timestamp).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(event.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-900/80 border-t border-gray-800 flex flex-wrap gap-4 justify-between">
                  <div className="flex gap-4">
                    <button onClick={copyTrackingLink} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                      <Share2 size={16} />
                      Share Status
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                      <Phone size={16} />
                      Contact Support
                    </button>
                  </div>

                  {status === 'Delivered' && (
                    <button
                      onClick={() => router.push('/products')}
                      className="flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300"
                    >
                      Buy Again <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-gray-900/30 border border-gray-800">
                  <p className="text-2xl mb-1">🛡️</p>
                  <p className="text-xs text-gray-400">Secure Tracking</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-900/30 border border-gray-800">
                  <p className="text-2xl mb-1">⚡</p>
                  <p className="text-xs text-gray-400">Real-time Updates</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-900/30 border border-gray-800">
                  <p className="text-2xl mb-1">🎧</p>
                  <p className="text-xs text-gray-400">24/7 Support</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
