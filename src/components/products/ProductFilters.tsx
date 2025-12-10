'use client'

import { useState, useEffect } from 'react'
import { Filter, X, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductFiltersProps {
    filters: {
        category: string[]
        priceRange: [number, number]
        rating: number | null
    }
    setFilters: (filters: any) => void
    minPrice: number
    maxPrice: number
    categories: string[]
}

export default function ProductFilters({ filters, setFilters, minPrice, maxPrice, categories }: ProductFiltersProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        price: true,
        rating: true
    })

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const handleCategoryChange = (category: string) => {
        const newCategories = filters.category.includes(category)
            ? filters.category.filter(c => c !== category)
            : [...filters.category, category]
        setFilters({ ...filters, category: newCategories })
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
        const val = parseInt(e.target.value)
        const newRange = [...filters.priceRange] as [number, number]
        newRange[index] = val
        setFilters({ ...filters, priceRange: newRange })
    }

    return (
        <>
            {/* Mobile Filter Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 bg-purple-600 text-white p-4 rounded-full shadow-lg shadow-purple-500/30 flex items-center gap-2"
            >
                <Filter size={20} />
                <span className="font-bold">Filters</span>
            </button>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 lg:top-24 left-0 h-screen lg:h-[calc(100vh-8rem)] 
                w-[280px] bg-gray-900/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none
                border-r border-gray-800 lg:border-none z-50 lg:z-0
                transition-transform duration-300 ease-in-out overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                p-6 lg:p-0 lg:pr-6
            `}>
                <div className="flex items-center justify-between mb-6 lg:hidden">
                    <h2 className="text-xl font-bold text-white">Filters</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Categories */}
                    <div className="border-b border-gray-800 pb-6">
                        <button
                            onClick={() => toggleSection('category')}
                            className="flex items-center justify-between w-full text-white font-semibold mb-4"
                        >
                            <span>Categories</span>
                            {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <AnimatePresence>
                            {expandedSections.category && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        {categories.map(category => (
                                            <label key={category} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.category.includes(category)}
                                                        onChange={() => handleCategoryChange(category)}
                                                        className="peer appearance-none w-5 h-5 border border-gray-600 rounded bg-gray-800 checked:bg-purple-600 checked:border-purple-600 transition-colors"
                                                    />
                                                    <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 12 10" fill="none">
                                                        <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                                <span className={`text-sm capitalize transition-colors ${filters.category.includes(category) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                                    {category}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Price Range */}
                    <div className="border-b border-gray-800 pb-6">
                        <button
                            onClick={() => toggleSection('price')}
                            className="flex items-center justify-between w-full text-white font-semibold mb-4"
                        >
                            <span>Price Range</span>
                            {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <AnimatePresence>
                            {expandedSections.price && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-4 px-1">
                                        <div className="flex items-center justify-between text-sm text-gray-400">
                                            <span>₹{filters.priceRange[0].toLocaleString()}</span>
                                            <span>₹{filters.priceRange[1].toLocaleString()}</span>
                                        </div>
                                        <div className="relative h-2 bg-gray-700 rounded-full">
                                            <div
                                                className="absolute h-full bg-purple-500 rounded-full"
                                                style={{
                                                    left: `${((filters.priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                                                    right: `${100 - ((filters.priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="relative -top-8 w-full h-6 flex items-center">
                                                <input
                                                    type="range"
                                                    min={minPrice}
                                                    max={maxPrice}
                                                    value={filters.priceRange[0]}
                                                    onChange={(e) => {
                                                        const val = Math.min(Number(e.target.value), filters.priceRange[1] - 100)
                                                        const newRange = [val, filters.priceRange[1]] as [number, number]
                                                        setFilters({ ...filters, priceRange: newRange })
                                                    }}
                                                    className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:z-30 z-20"
                                                />
                                                <input
                                                    type="range"
                                                    min={minPrice}
                                                    max={maxPrice}
                                                    value={filters.priceRange[1]}
                                                    onChange={(e) => {
                                                        const val = Math.max(Number(e.target.value), filters.priceRange[0] + 100)
                                                        const newRange = [filters.priceRange[0], val] as [number, number]
                                                        setFilters({ ...filters, priceRange: newRange })
                                                    }}
                                                    className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:z-30 z-20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Rating */}
                    <div>
                        <button
                            onClick={() => toggleSection('rating')}
                            className="flex items-center justify-between w-full text-white font-semibold mb-4"
                        >
                            <span>Rating</span>
                            {expandedSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <AnimatePresence>
                            {expandedSections.rating && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        {[4, 3, 2, 1].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => setFilters({ ...filters, rating: filters.rating === rating ? null : rating })}
                                                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors ${filters.rating === rating ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-gray-800'}`}
                                            >
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm">& Up</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </aside>
        </>
    )
}
