'use client'

import { useState, useMemo } from 'react'
import { Product } from '@/types/product'
import ProductCard from '@/components/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, ArrowUpDown, Sparkles, Flame, Clock } from 'lucide-react'

interface RecommendationsGridProps {
    initialProducts: Product[]
}

export default function RecommendationsGrid({ initialProducts }: RecommendationsGridProps) {
    // products are static for this component - use the prop directly
    const products = initialProducts
    const [category, setCategory] = useState('all')
    const [sortBy, setSortBy] = useState('recommended')
    const [visibleCount, setVisibleCount] = useState(8)
    const [loading, setLoading] = useState(false)

    // Mock personalization - in a real app, this would come from user context/history
    const [userInterests] = useState<string[]>(() => {
        if (typeof window === 'undefined') return []
        try {
            const viewed = localStorage.getItem('viewedCategories')
            return viewed ? JSON.parse(viewed) : []
        } catch {
            return []
        }
    })

    const filteredProducts = useMemo(() => {
        let result = [...products]

        // Filter
        if (category !== 'all') {
            result = result.filter(p => p.category.toLowerCase() === category)
        }

        // Sort
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price)
                break
            case 'price-desc':
                result.sort((a, b) => b.price - a.price)
                break
            case 'newest':
                result.sort((a, b) => b.id.localeCompare(a.id))
                break
            case 'recommended':
            default:
                if (userInterests.length > 0) {
                    result.sort((a, b) => {
                        const aMatch = userInterests.includes(a.category) ? 1 : 0
                        const bMatch = userInterests.includes(b.category) ? 1 : 0
                        return bMatch - aMatch
                    })
                }
                break
        }

        return result
    }, [products, category, sortBy, userInterests])

    const loadMore = () => {
        setLoading(true)
        // Simulate network delay
        setTimeout(() => {
            setVisibleCount(prev => prev + 4)
            setLoading(false)
        }, 600)
    }

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-white/10 p-8 md:p-12 text-center">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
                        <Sparkles size={16} />
                        <span>Curated Just For You</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        Hand-picked products based on your style
                    </h1>
                    <p className="text-gray-400 text-lg">
                        We&pos;ve analyzed your preferences to bring you the best tech gear that matches your needs.
                    </p>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/50 p-4 rounded-2xl border border-gray-800 backdrop-blur-sm">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                    {['all', 'accessories', 'laptops', 'smartphones'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${category === cat
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full md:w-48 pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white appearance-none focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer text-sm"
                        >
                            <option value="recommended" className="bg-gray-800 text-gray-200">Recommended</option>
                            <option value="newest" className="bg-gray-800 text-gray-200">Newest Arrivals</option>
                            <option value="price-asc" className="bg-gray-800 text-gray-200">Price: Low to High</option>
                            <option value="price-desc" className="bg-gray-800 text-gray-200">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.slice(0, visibleCount).map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <div className="relative h-full">
                                        {/* Context Badge */}
                                        {index < 2 && sortBy === 'recommended' && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                                                <Flame size={12} />
                                                Top Pick
                                            </div>
                                        )}
                                        <ProductCard product={product} />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Load More */}
                    {visibleCount < filteredProducts.length && (
                        <div className="flex justify-center pt-8">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="px-8 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white font-medium hover:bg-gray-700 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    'Load More Recommendations'
                                )}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Filter className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
                    <p className="text-gray-400">Try adjusting your filters to see more recommendations.</p>
                    <button
                        onClick={() => { setCategory('all'); setSortBy('recommended') }}
                        className="mt-4 text-purple-400 hover:text-purple-300 font-medium"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-gray-800">
                {[
                    { label: 'Secure Payments', icon: '🛡️' },
                    { label: 'Verified Seller', icon: '✅' },
                    { label: 'Free Returns', icon: 'cw' }, // Using text for now or lucide if available
                    { label: '24/7 Support', icon: '🎧' },
                ].map((badge, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-gray-900/30 border border-gray-800/50">
                        <span className="text-2xl">{badge.icon}</span>
                        <span className="text-sm font-medium text-gray-300">{badge.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
