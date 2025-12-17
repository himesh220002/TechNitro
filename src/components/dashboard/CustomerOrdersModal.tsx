'use client'

import { useState, useEffect } from 'react'
import { X, Package, Calendar, CreditCard, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase/client'
import { Order } from '@/types/order'

interface CustomerOrdersModalProps {
    customerId: string | null
    customerName: string
    isOpen: boolean
    onClose: () => void
}

export default function CustomerOrdersModal({ customerId, customerName, isOpen, onClose }: CustomerOrdersModalProps) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createBrowserClient()

    useEffect(() => {
        if (isOpen && customerId) {
            fetchOrders()
        } else {
            setOrders([]) // Clear orders when closed
        }
    }, [isOpen, customerId])

    const fetchOrders = async () => {
        if (!customerId) return

        setLoading(true)
        setError(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            const res = await fetch(`/api/admin/orders?userId=${customerId}`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            })

            if (!res.ok) throw new Error('Failed to fetch orders')

            const data = await res.json()
            setOrders(data)
        } catch (err) {
            console.error('Error fetching customer orders:', err)
            setError('Failed to load order history')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Package className="text-purple-500" size={24} />
                                Order History
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                For {customerName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Loader2 className="animate-spin mb-3 text-purple-500" size={32} />
                                <p>Loading orders...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 text-red-400">
                                <AlertCircle size={32} className="mb-3" />
                                <p>{error}</p>
                                <button
                                    onClick={fetchOrders}
                                    className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Package size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No orders found for this customer.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${order.orderStatus === 'Delivered' ? 'bg-green-500' :
                                                    order.orderStatus === 'Cancelled' ? 'bg-red-500' :
                                                        'bg-yellow-500'
                                                    }`} />
                                                <span className="font-mono text-sm text-gray-400">#{order.id.slice(0, 8)}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.orderStatus === 'Delivered' ? 'bg-green-500/10 text-green-400' :
                                                    order.orderStatus === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-yellow-500/10 text-yellow-400'
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CreditCard size={14} />
                                                    ₹{order.payment.toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {order.products.map((product) => (
                                                <div key={product.id} className="flex items-center gap-3 text-sm">
                                                    <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                                                        {product.quantity}x
                                                    </div>
                                                    <span className="text-gray-300 flex-1 truncate">{product.name}</span>
                                                    <span className="text-gray-400">₹{product.price.toLocaleString('en-IN')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
