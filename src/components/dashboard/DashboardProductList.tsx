'use client'

import { Product } from '@/types/product'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Edit, Trash2, Eye, CheckSquare, Square } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ProductListProps {
    products: Product[]
    selectedIds: string[]
    toggleSelection: (id: string) => void
    toggleAll: () => void
}

export default function DashboardProductList({
    products,
    selectedIds,
    toggleSelection,
    toggleAll
}: ProductListProps) {
    const allSelected = products.length > 0 && selectedIds.length === products.length

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-800 bg-gray-900/80">
                            <th className="p-4 w-12">
                                <button onClick={toggleAll} className="text-gray-400 hover:text-white">
                                    {allSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                </button>
                            </th>
                            <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Product</th>
                            <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Price</th>
                            <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                            <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        <AnimatePresence>
                            {products.map((product) => (
                                <motion.tr
                                    key={product.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`group transition-colors ${selectedIds.includes(product.id) ? 'bg-purple-900/10' : 'hover:bg-gray-800/30'
                                        }`}
                                >
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleSelection(product.id)}
                                            className={`${selectedIds.includes(product.id) ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`}
                                        >
                                            {selectedIds.includes(product.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0">
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-800" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{product.name}</div>
                                                <div className="text-xs text-gray-500">ID: {product.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400 capitalize">{product.category}</td>
                                    <td className="p-4 font-medium text-white">₹{product.price.toLocaleString('en-IN')}</td>
                                    <td className="p-4 text-gray-400">{product.inventory}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${product.inventory > 10
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : product.inventory > 0
                                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {product.inventory > 10 ? 'In Stock' : product.inventory > 0 ? 'Low Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/products/${product.slug}`}
                                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                            <button className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Pagination (Mock) */}
            <div className="p-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-400">
                <div>Showing 1-{products.length} of {products.length} products</div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50" disabled>Next</button>
                </div>
            </div>
        </div>
    )
}
