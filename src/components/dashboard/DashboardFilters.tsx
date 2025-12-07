'use client'

import { Search, Filter, ArrowUpDown } from 'lucide-react'

interface FilterProps {
    search: string
    setSearch: (val: string) => void
    category: string
    setCategory: (val: string) => void
    sortBy: string
    setSortBy: (val: string) => void
    showInStockOnly: boolean
    setShowInStockOnly: (val: boolean) => void
}

export default function DashboardFilters({
    search,
    setSearch,
    category,
    setCategory,
    sortBy,
    setSortBy,
    showInStockOnly,
    setShowInStockOnly
}: FilterProps) {
    return (
        <div className="flex flex-col gap-4 mb-6 p-3 sm:p-4 bg-gray-900/50 border border-gray-800 rounded-2xl backdrop-blur-xl">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Category Filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm appearance-none focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                        <option value="all">All Categories</option>
                        <option value="accessories">Accessories</option>
                        <option value="laptops">Laptops</option>
                        <option value="smartphones">Smartphones</option>
                        <option value="tablets">Tablets</option>
                    </select>
                </div>

                {/* Sort */}
                <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm appearance-none focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="stock">Stock Level</option>
                    </select>
                </div>

                {/* In Stock Toggle */}
                <button
                    onClick={() => setShowInStockOnly(!showInStockOnly)}
                    className={`px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${showInStockOnly
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    In Stock Only
                </button>
            </div>
        </div>
    )
}
