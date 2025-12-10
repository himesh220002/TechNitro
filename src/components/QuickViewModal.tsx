'use client'

import { Product } from '@/types/product'
import Image from 'next/image'
import { X, ShoppingCart, Star, Check, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useState } from 'react'

interface QuickViewModalProps {
    product: Product
    isOpen: boolean
    onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const router = useRouter()
    const { addToCart } = useCart()
    const [isAdded, setIsAdded] = useState(false)

    if (!isOpen) return null

    const handleAddToCart = () => {
        addToCart(product)
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors backdrop-blur-sm"
                    >
                        <X size={24} />
                    </button>

                    {/* Left Section: Image + Actions */}
                    <div className="w-full md:w-1/2 bg-gray-900 flex flex-col">
                        {/* Image Container */}
                        <div className="relative flex-1 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-8 min-h-[300px]">
                            <div className="relative w-full h-full max-h-[400px]">
                                {product.imageUrl ? (
                                    <Image
                                        src={encodeURI(product.imageUrl)}
                                        alt={product.name}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        unoptimized={true}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        No Image Available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons - Fixed below image */}
                        <div className="p-6 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => router.push(`/products/${product.slug}`)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] border border-gray-700"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdded}
                                    className={`flex-1 font-semibold py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${isAdded
                                        ? 'bg-green-600 text-white'
                                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                                        }`}
                                >
                                    {isAdded ? (
                                        <>
                                            <Check size={20} /> Added
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={20} /> Add to Cart
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Details (Scrollable) */}
                    <div className="w-full md:w-1/2 p-8 md:p-10 overflow-y-auto bg-gray-900 border-l border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-500/20">
                                {product.category}
                            </span>
                            {product.inventory > 5 ? (
                                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider border border-green-500/20 flex items-center gap-1">
                                    <Check size={12} /> In Stock
                                </span>
                            ) : product.inventory > 0 ? (
                                <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider border border-yellow-500/20 flex items-center gap-1">
                                    <Check size={12} /> Low Stock
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider border border-red-500/20">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                            {product.name}
                        </h2>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                ₹{product.price.toLocaleString('en-IN')}
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-yellow-500 font-bold">{(product.rating || 0).toFixed(1)}</span>
                                <span className="text-gray-400 text-sm">({product.review_count || 0} reviews)</span>
                            </div>          </div>

                        <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                            {product.description || "Experience premium quality with this amazing product. Designed for performance and built to last, it features state-of-the-art technology and superior craftsmanship."}
                        </p>

                        {/* Trust Indicators */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                                <ShieldCheck className="text-blue-400 w-6 h-6" />
                                <div>
                                    <p className="text-white text-sm font-semibold">2 Year Warranty</p>
                                    <p className="text-gray-500 text-xs">Full coverage included</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                                <Check className="text-green-400 w-6 h-6" />
                                <div>
                                    <p className="text-white text-sm font-semibold">Free Shipping</p>
                                    <p className="text-gray-500 text-xs">On all orders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
