// src/components/products/ProductSort.tsx
'use client'

import { LayoutGrid, List, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductSortProps {
    totalProducts: number
    sortBy: string
    setSortBy: (sort: string) => void
    viewMode: 'grid' | 'list'
    setViewMode: (mode: 'grid' | 'list') => void
}

export default function ProductSort({ totalProducts, sortBy, setSortBy, viewMode, setViewMode }: ProductSortProps) {
    const [isOpen, setIsOpen] = useState(false)

    const sortOptions = [
        { value: 'featured', label: 'Featured' },
        { value: 'newest', label: 'Newest Arrivals' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'rating', label: 'Top Rated' },
    ]

    return (
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-gray-900/40 p-4 rounded-2xl border border-gray-800 backdrop-blur-sm">
            <p className="text-gray-400 text-sm">
                Showing <span className="text-white font-bold">{totalProducts}</span> results
            </p>

            <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                            ? 'bg-gray-700 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list'
                            ? 'bg-gray-700 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <List size={18} />
                    </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative z-20">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white hover:bg-gray-750 transition-colors min-w-[180px] justify-between"
                    >
                        <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-full min-w-[180px] bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
                                >
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSortBy(option.value)
                                                setIsOpen(false)
                                            }}
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-700 ${sortBy === option.value ? 'text-purple-400 bg-purple-500/10' : 'text-gray-300'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
