'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Order as OrderType, ShippingEvent as ShippingEventType } from '@/types/order'
import Navbar from '@/components/Navbar'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Truck, Package, CheckCircle, MapPin, RefreshCw,
  Share2, AlertCircle, Phone, ArrowRight, Copy,
  MessageCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

// Use shared types from src/types/order
type ShippingEvent = ShippingEventType
// Extend shared Order type with a few optional legacy fields used in this component
type Order = OrderType & {
  tracking_link?: string
  customer_tracking_link?: string
  delivery_agent_name?: string
  delivery_agent_phone?: string
}

type SupportMessage = {
  id: string
  order_id: string
  user_id?: string
  message: string
  is_admin_reply?: boolean
  created_at: string
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
  const initialOpenChat = searchParams?.get('openChat') === '1' || searchParams?.get('openChat') === 'true'

  const [orderId, setOrderId] = useState<string>(initialId)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [shippingEvents, setShippingEvents] = useState<ShippingEvent[]>([])
  const [error, setError] = useState<string>('')
  const [order, setOrder] = useState<Order | null>(null)

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60000) // 1 min default
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Location sharing state
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [customerLocationLink, setCustomerLocationLink] = useState('')
  const [sharingLocation, setSharingLocation] = useState(false)

  // Chat support state
  const [showChat, setShowChat] = useState<boolean>(initialOpenChat)
  const [chatMessage, setChatMessage] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([])




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
      setOrder(data)
      setStatus(data.orderStatus)
      setShippingEvents(data.shippingEvents || [])
      setUserId(data.user_id || '')
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch status:', err)
      setError('Order not found. Please check the ID and try again.')
      setStatus('')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (initialId) {
      setOrderId(initialId)
    }
  }, [initialId])

  // Fetch chat messages when chat opens
  const fetchChatMessages = useCallback(async () => {
    if (!orderId) return

    try {
      const res = await fetch(`/api/support-messages?orderId=${orderId}`)
      if (res.ok) {
        const messages: SupportMessage[] = await res.json()
        setChatMessages(messages)

        // mark admin messages as seen for this order in localStorage
        try {
          const lastAdmin = messages
            .filter((m) => m.is_admin_reply)
            .map((m) => m.created_at)
            .sort()
            .pop()

          if (lastAdmin) {
            localStorage.setItem(`lastSeenAdminMsg:${orderId}`, lastAdmin)
          }
        } catch (e) {
          // ignore localStorage errors (e.g., SSR or blocked storage)
          console.error('Failed to update last seen admin message:', e)
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }, [orderId])

  useEffect(() => {
    if (showChat) {
      fetchChatMessages()
    }
  }, [showChat, fetchChatMessages])

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
      <main className="max-w-4xl mx-auto sm:mt-20 mt-15 p-4 sm:p-6 lg:p-8">

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
                          className="bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer px-2 py-1 text-xs"
                        >
                          <option value={30000} className="bg-gray-800 text-gray-200">30s</option>
                          <option value={60000} className="bg-gray-800 text-gray-200">1m</option>
                          <option value={300000} className="bg-gray-800 text-gray-200">5m</option>
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

                  {/* Delivery Agent Info Card */}
                  {order?.delivery_agent_name && ['Out for Delivery'].includes(status) && (
                    <div className="mb-6 px-4">
                      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div>
                              <p className="text-xs text-gray-400">Your Delivery Agent</p>
                              <p className="text-white font-semibold">{order.delivery_agent_name}</p>
                            </div>
                            <div>
                              {/* Live Tracking Button */}
                              {order?.tracking_link && ['Out for Delivery'].includes(status) && (
                                <div className=" px-4">
                                  <a
                                    href={order.tracking_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block"
                                  >
                                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 group">
                                      <svg
                                        className="w-4 h-4 group-hover:scale-110 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                      </svg>
                                      <span className="text-sm">Track Delivery Agent Live</span>
                                      <svg
                                        className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                    </button>
                                  </a>

                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}



                  {/* Share My Location Button */}
                  {['Out for Delivery'].includes(status) && (
                    <div className="mb-8 px-4">
                      {order?.customer_tracking_link ? (
                        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-400" />
                              <span className="text-green-400 font-medium text-sm">Location Shared with Agent</span>
                            </div>
                            <button
                              onClick={async () => {
                                if (confirm('Remove your shared location?')) {
                                  try {
                                    await fetch(`/api/share-customer-location?orderId=${orderId}`, { method: 'DELETE' })
                                    setOrder(prev => prev ? { ...prev, customer_tracking_link: undefined } : null)
                                    toast.success('Location sharing removed')
                                  } catch {
                                    toast.error('Failed to remove location')
                                  }
                                }
                              }}
                              className="text-xs text-red-400 hover:text-red-300 underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowLocationModal(true)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-purple-600/50 backdrop-blur-sm hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <MapPin size={18} />
                          Share My Location with Agent
                        </button>
                      )}
                      <p className="text-xs text-gray-400 mt-2">Notice: <span className='font-semibold text-blue-400'>Required to track your address pin location for the delivery agent to reach you.</span> Your location will be shared with the delivery agent for better service. It will be removed after the order is delivered.</p>
                    </div>
                  )}

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
                    <button
                      onClick={() => setShowChat(true)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <MessageCircle size={16} />
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

        {/* Location Sharing Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800"
            >
              <h3 className="text-xl font-bold text-white mb-4">Share Your Live Location</h3>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-300 mb-2">📱 How to generate your Google Maps link:</p>
                <ol className="text-xs text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Open Google Maps on your phone</li>
                  <li>Tap your profile picture (top right)</li>
                  <li>Select - Location sharing</li>
                  <li>Tap - Share location or New share</li>
                  <li>Choose duration (e.g., set to 3 hours)</li>
                  <li>Tap - Copy to clipboard</li>
                  <li>Paste the link below</li>
                </ol>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-300">
                  🔒 Privacy: Your location will only be shared with the delivery agent and will be automatically removed when your order is delivered.
                </p>
              </div>

              <input
                type="text"
                placeholder="Paste your Google Maps location link here..."
                value={customerLocationLink}
                onChange={(e) => setCustomerLocationLink(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm mb-4 focus:ring-2 focus:ring-green-500 outline-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLocationModal(false)
                    setCustomerLocationLink('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!customerLocationLink.trim()) {
                      toast.error('Please enter a location link')
                      return
                    }

                    setSharingLocation(true)
                    try {
                      const res = await fetch('/api/share-customer-location', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          orderId,
                          customerTrackingLink: customerLocationLink.trim()
                        })
                      })

                      if (res.ok) {
                        const updated = await res.json()
                        setOrder(prev => prev ? { ...prev, customer_tracking_link: updated.customer_tracking_link } : null)
                        toast.success('Location shared successfully!')
                        setShowLocationModal(false)
                        setCustomerLocationLink('')
                      } else {
                        toast.error('Failed to share location')
                      }
                    } catch {
                      toast.error('Error sharing location')
                    } finally {
                      setSharingLocation(false)
                    }
                  }}
                  disabled={sharingLocation}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {sharingLocation ? 'Sharing...' : 'Share Location'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Chat Support Modal */}
        {showChat && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-800 flex flex-col max-h-[600px]"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-900/30 to-indigo-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Support Chat</h3>
                    <p className="text-xs text-gray-400">We&apos;re here to help</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-950/50">
                <div className="space-y-4">
                  {/* Welcome Message */}
                  {chatMessages.length === 0 && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-purple-400">🎧</span>
                      </div>
                      <div className="bg-gray-800 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                        <p className="text-sm text-gray-300">
                          Hi! How can we help you with your order today?
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Just now</p>
                      </div>
                    </div>
                  )}

                  {/* Display all messages */}
                  {chatMessages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex gap-3 ${msg.is_admin_reply ? '' : 'justify-end'}`}>
                      {msg.is_admin_reply && (
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-purple-100">🎧</span>
                        </div>
                      )}
                      <div className={`rounded-2xl p-3 max-w-[80%] ${msg.is_admin_reply
                        ? 'bg-gray-800/50 backdrop-blur-sm rounded-tl-none'
                        : 'bg-purple-600/50 backdrop-blur-sm rounded-tr-none'
                        }`}>
                        <p className="text-sm text-gray-100">{msg.message}</p>
                        <p className="text-xs text-gray-300 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Order Info */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300 mb-1">📦 Your Order</p>
                    <p className="text-sm text-white font-mono">#{orderId.slice(0, 12)}...</p>
                    <p className="text-xs text-gray-400 mt-1">Status: {status}</p>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter' && chatMessage.trim()) {
                        try {
                          const res = await fetch('/api/support-messages', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              orderId,
                              message: chatMessage.trim(),
                              userId
                            })
                          })
                          if (res.ok) {
                            toast.success('Message sent to support team!')
                            setChatMessage('')
                            fetchChatMessages() // Refresh messages
                          } else {
                            toast.error('Failed to send message')
                          }
                        } catch {
                          toast.error('Error sending message')
                        }
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    onClick={async () => {
                      if (chatMessage.trim()) {
                        try {
                          const res = await fetch('/api/support-messages', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              orderId,
                              message: chatMessage.trim(),
                              userId
                            })
                          })
                          if (res.ok) {
                            toast.success('Message sent to support team!')
                            setChatMessage('')
                            fetchChatMessages() // Refresh messages
                          } else {
                            toast.error('Failed to send message')
                          }
                        } catch {
                          toast.error('Error sending message')
                        }
                      }
                    }}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Our support team will respond as soon as possible
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
