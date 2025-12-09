'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Order, ProductInOrder } from '@/types/order'
import OrderActions from './OrderActions'
import { ChevronDown, ChevronUp, Package, Truck, CheckCircle, XCircle, Clock, MapPinHouse, Ship } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OrderRowProps {
    order: Order
    onUpdate?: () => void
}

export default function OrderRow({ order, onUpdate }: OrderRowProps) {
    const router = useRouter()
    const [isExpanded, setIsExpanded] = useState(false)
    const [openCancelId, setOpenCancelId] = useState<string | null>(null)

    const cancelOrder = async (id: string) => {
        const res = await fetch('/api/update-order-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'Cancelled' }),
        })

        if (res.ok) {
            toast.success('Order cancelled')
            router.refresh()
            if (onUpdate) onUpdate()
        } else {
            toast.error('Failed to cancel order')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Order Confirmed': return 'bg-blue-500/10 text-blue-400 border-green-500/20'
            case 'Packed': return 'bg-blue-900/10 text-blue-400 border-blue-500/20'
            case 'Out for Delivery': return 'bg-yellow-500/10 text-yellow-400 border-blue-500/20'
            case 'Delivered': return 'bg-green-500/10 text-green-400 border-green-500/20'
            case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
            case 'Shipping': return 'bg-blue-500/10 text-blue-200 border-blue-500/20'
            case 'Shipped': return 'bg-blue-500/10 text-yellow-200 border-blue-500/20'
            case 'Order Placed': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Out for Delivery': return <MapPinHouse size={16} />
            case 'Delivered': return <CheckCircle size={16} />
            case 'Cancelled': return <XCircle size={16} />
            case 'Shipping': return <Ship size={16} />
            case 'Shipped': return <Truck size={16} />
            case 'Order Placed': return <Package size={16} />
            case 'Packed': return <Package size={16} />
            default: return <Clock size={16} />
        }
    }

    return (
        <div className="group border border-gray-800 rounded-xl bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border ${getStatusColor(order.orderStatus)}`}>
                            {getStatusIcon(order.orderStatus)}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Order #{order.id.slice(0, 8)}</h3>
                            <p className="text-sm text-gray-400">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Total Amount</p>
                            <p className="font-bold text-white text-lg">₹{order.payment.toLocaleString('en-IN')}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                        </div>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                </div>

                {/* Product Thumbnails Preview */}
                {!isExpanded && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {order.products.slice(0, 5).map((product) => (
                            <div key={product.id} className="relative w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden shrink-0">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                        {order.products.length > 5 && (
                            <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-400 font-medium">
                                +{order.products.length - 5}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-800 bg-gray-900/30"
                    >
                        <div className="p-4 sm:p-6 space-y-6">
                            {/* Timeline (Simplified) */}
                            <div className="relative py-4">
                                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-800 -translate-y-1/2" />
                                <div className="relative flex justify-between">
                                    {['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, i) => {
                                        // Define progress levels
                                        const statusLevels: Record<string, number> = {
                                            'Order Placed': 0,
                                            'Order Confirmed': 1,
                                            'Packed': 2,
                                            'Shipping': 2.5, // In progress
                                            'Shipped': 3,    // Completed
                                            'Out for Delivery': 4,
                                            'Delivered': 5,
                                            'Returned': 6,
                                            'Cancelled': -1
                                        }

                                        const currentLevel = statusLevels[order.orderStatus] ?? 0
                                        const stepLevel = i + 2 // Packed(2), Shipped(3), etc.

                                        // Check if this step is fully completed
                                        const isCompleted = currentLevel >= stepLevel

                                        // Check if this step is currently in progress (specifically for Shipping)
                                        const isCurrent = (step === 'Shipped' && currentLevel === 2.5)

                                        let dotClass = 'bg-gray-800 border-gray-600'
                                        let textClass = 'text-gray-600'

                                        if (isCompleted) {
                                            dotClass = 'bg-green-500 border-green-500'
                                            textClass = 'text-green-400'
                                        } else if (isCurrent) {
                                            dotClass = 'bg-blue-500 border-blue-500 animate-pulse'
                                            textClass = 'text-blue-400 font-medium'
                                        }

                                        return (
                                            <div key={step} className="flex flex-col items-center gap-2 bg-gray-900 px-2 py-1 z-10 rounded-lg">
                                                <div className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 ${dotClass}`} />
                                                <span className={`text-[10px] sm:text-xs transition-colors duration-300 ${textClass}`}>{step}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Products List */}
                            <div className="space-y-4">
                                {order.products.map((product: ProductInOrder) => (
                                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                                        <div className="relative w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0">
                                            <Image
                                                src={product.imageUrl}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-1"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-white line-clamp-1">{product.name}</p>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                                <span>Qty: {product.quantity}</span>
                                                <span>•</span>
                                                <span className="text-green-400">₹{(product.price * product.quantity).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                router.push(`/products/${product.id}`) // Assuming ID matches slug or handle redirect
                                            }}
                                            className="px-3 py-1.5 text-xs font-medium text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition-colors"
                                        >
                                            Buy Again
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Actions Footer */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-800">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => router.push(`/track-order?id=${order.id}`)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                    >
                                        Track Order
                                    </button>
                                    <button
                                        onClick={() => router.push(`/orders/${order.id}/confirmation`)}
                                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        View Invoice
                                    </button>
                                </div>

                                {['Order Placed', 'Order Confirmed', 'Packed'].includes(order.orderStatus) && (
                                    <button
                                        onClick={() => setOpenCancelId(order.id)}
                                        className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-lg transition-colors"
                                    >
                                        Cancel Order
                                    </button>
                                )}

                                {openCancelId === order.id && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
                                            <h3 className="text-lg font-bold text-white mb-2">Cancel Order?</h3>
                                            <p className="text-gray-400 mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        cancelOrder(order.id)
                                                        setOpenCancelId(null)
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 font-medium"
                                                >
                                                    Yes, Cancel
                                                </button>
                                                <button
                                                    onClick={() => setOpenCancelId(null)}
                                                    className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 font-medium"
                                                >
                                                    Keep Order
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
