'use client'

import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartPreview() {
    const { items, total, removeFromCart } = useCart()

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <ShoppingBag size={18} className="text-purple-400" />
                    Your Cart ({items.length})
                </h3>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Your cart is empty
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="flex gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors group relative">
                            <div className="relative w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0">
                                {item.imageUrl ? (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-700" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-200 truncate pr-6">{item.name}</h4>
                                <p className="text-xs text-gray-400 mt-1">
                                    {item.quantity} x ₹{item.price.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    removeFromCart(item.id)
                                }}
                                className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {items.length > 0 && (
                <div className="p-4 bg-gray-800/50 border-t border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">Total:</span>
                        <span className="text-lg font-bold text-white">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <Link
                        href="/cart"
                        className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center font-semibold py-2 rounded-lg transition-colors"
                    >
                        Checkout
                    </Link>
                </div>
            )}
        </div>
    )
}
