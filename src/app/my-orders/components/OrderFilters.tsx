'use client'

import { Search, Filter, ArrowUpDown } from 'lucide-react'

interface OrderFiltersProps {
    search: string
    setSearch: (val: string) => void
    status: string
    setStatus: (val: string) => void
    sortBy: string
    setSortBy: (val: string) => void
}

export default function OrderFilters({
    search,
    setSearch,
    status,
    setStatus,
    sortBy,
    setSortBy
}: OrderFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-900/50 border border-gray-800 rounded-xl backdrop-blur-sm">
            {/* Search */}
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by Order ID or Product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                />
            </div>

            <div className="flex gap-3">
                {/* Status Filter */}
                <div className="relative min-w-[140px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white appearance-none focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="Order Placed">Placed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Sort */}
                <div className="relative min-w-[140px]">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white appearance-none focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer text-sm"
                    >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="amount-desc">Highest Amount</option>
                        <option value="amount-asc">Lowest Amount</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
