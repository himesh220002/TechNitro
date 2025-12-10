'use client'

import { Product } from '@/types/product'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye, Star, Check } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useState } from 'react'
import QuickViewModal from '@/components/QuickViewModal'

interface ProductGridProps {
    products: Product[]
    viewMode: 'grid' | 'list'
    loading: boolean
}

export default function ProductGrid({ products, viewMode, loading }: ProductGridProps) {
    const { addToCart } = useCart()
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
    const [addedIds, setAddedIds] = useState<string[]>([])

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart(product)
        setAddedIds(prev => [...prev, product.id])
        setTimeout(() => {
            setAddedIds(prev => prev.filter(id => id !== product.id))
        }, 2000)
    }

    const handleQuickView = (e: React.MouseEvent, product: Product) => {
        e.preventDefault()
        e.stopPropagation()
        setQuickViewProduct(product)
    }

    if (loading) {
        return (
            <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
                }`}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={`bg-gray-900/50 rounded-2xl p-4 animate-pulse ${viewMode === 'list' ? 'flex gap-4' : ''}`}>
                        <div className={`bg-gray-800 rounded-xl ${viewMode === 'list' ? 'w-48 h-48' : 'w-full aspect-square mb-4'}`} />
                        <div className="flex-1 space-y-3">
                            <div className="h-6 bg-gray-800 rounded w-3/4" />
                            <div className="h-4 bg-gray-800 rounded w-1/2" />
                            <div className="h-8 bg-gray-800 rounded w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart size={40} className="text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
                <p className="text-gray-400">Try adjusting your filters or search criteria</p>
            </div>
        )
    }

    return (
        <>
            <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
                }`}>
                {products.map((product, idx) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className={`group relative bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 ${viewMode === 'list' ? 'flex' : ''}`}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            className={`w-full h-full flex flex-col ${viewMode === 'list' ? 'md:flex-row' : ''}`}
                        >
                            {/* Image Section */}
                            <div className={`relative overflow-hidden bg-gray-800 ${viewMode === 'list' ? 'w-full md:w-64 shrink-0' : 'aspect-[4/3]'}`}>
                                {product.imageUrl ? (
                                    <Image
                                        src={encodeURI(product.imageUrl)}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        unoptimized={true}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        No Image
                                    </div>
                                )}

                                {/* Overlay Actions (Grid Mode) - Hidden on mobile */}
                                {viewMode === 'grid' && (
                                    <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-3 backdrop-blur-[2px]">
                                        <button
                                            onClick={(e) => handleQuickView(e, product)}
                                            className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform shadow-lg"
                                            title="Quick View"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className={`p-3 rounded-full hover:scale-110 transition-transform shadow-lg ${addedIds.includes(product.id)
                                                ? 'bg-green-500 text-white'
                                                : 'bg-purple-600 text-white'
                                                }`}
                                            title="Add to Cart"
                                        >
                                            {addedIds.includes(product.id) ? <Check size={20} /> : <ShoppingCart size={20} />}
                                        </button>
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {product.inventory < 5 && product.inventory > 0 && (
                                        <span className="px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-md backdrop-blur-sm">
                                            Low Stock
                                        </span>
                                    )}
                                    {product.inventory === 0 && (
                                        <span className="px-2 py-1 bg-gray-800/90 text-white text-xs font-bold rounded-md backdrop-blur-sm">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                                        {product.category}
                                    </div>
                                    {product.rating && (
                                        <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-1 rounded-full">
                                            <Star size={12} className="fill-yellow-400" />
                                            {product.rating.toFixed(1)}
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-purple-400 transition-colors mb-2">
                                    {product.name}
                                </h3>

                                {viewMode === 'list' && (
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{product.description}</p>
                                )}

                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-white">
                                            ₹{product.price.toLocaleString('en-IN')}
                                        </span>
                                        {product.inventory > 0 && (
                                            <span className="text-xs text-green-400 font-medium">In Stock</span>
                                        )}
                                    </div>

                                    {viewMode === 'list' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={(e) => handleQuickView(e, product)}
                                                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                                            >
                                                Quick View
                                            </button>
                                            <button
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${addedIds.includes(product.id)
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                                                    }`}
                                            >
                                                {addedIds.includes(product.id) ? (
                                                    <>
                                                        <Check size={16} /> Added
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart size={16} /> Add to Cart
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Quick View Modal */}
            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    isOpen={!!quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                />
            )}
        </>
    )
}
