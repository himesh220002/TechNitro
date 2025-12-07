'use client'

import { Product } from '@/types/product'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Edit, Trash2, Eye, CheckSquare, Square } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

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
    const router = useRouter()
    const allSelected = products.length > 0 && selectedIds.length === products.length

    const handleEdit = (productId: string) => {
        // Navigate to products page where edit functionality exists
        router.push(`/admin/dashboard/products?edit=${productId}`)
    }

    const handleDelete = async (product: Product) => {
        if (!confirm(`Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`)) {
            return
        }

        try {
            const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success(`✅ ${product.name} deleted successfully`)
                window.location.reload()
            } else {
                toast.error('❌ Failed to delete product')
                console.error('Delete failed')
            }
        } catch (error) {
            toast.error('❌ Error deleting product')
            console.error('Delete error:', error)
        }
    }

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                    <thead>
                        <tr className="border-b border-gray-800 bg-gray-900/80">
                            <th className="p-3 sm:p-4 w-12">
                                <button onClick={toggleAll} className="text-gray-400 hover:text-white">
                                    {allSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Product</th>
                            <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                            <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Price</th>
                            <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                            <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="p-3 sm:p-4 text-right text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Actions</th>
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
                                    <td className="p-3 sm:p-4">
                                        <button
                                            onClick={() => toggleSelection(product.id)}
                                            className={`${selectedIds.includes(product.id) ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`}
                                        >
                                            {selectedIds.includes(product.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white overflow-hidden shrink-0">
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
                                            <div className="min-w-0">
                                                <div className="font-medium text-white text-sm truncate">{product.name}</div>
                                                <div className="text-xs text-gray-500 md:hidden">{product.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 text-gray-400 capitalize hidden md:table-cell text-sm">{product.category}</td>
                                    <td className="p-3 sm:p-4 font-medium text-white text-sm">₹{product.price.toLocaleString('en-IN')}</td>
                                    <td className="p-3 sm:p-4 text-gray-400 hidden sm:table-cell text-sm">{product.inventory}</td>
                                    <td className="p-3 sm:p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${product.inventory > 10
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : product.inventory > 0
                                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {product.inventory > 10 ? 'In Stock' : product.inventory > 0 ? 'Low Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="p-3 sm:p-4 text-right">
                                        <div className="flex items-center justify-end gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/products/${product.slug}`}
                                                className="p-1.5 sm:p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                                title="View Product"
                                            >
                                                <Eye size={14} className="sm:w-4 sm:h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleEdit(product.id)}
                                                className="p-1.5 sm:p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                title="Edit Product"
                                            >
                                                <Edit size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="p-1.5 sm:p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={14} className="sm:w-4 sm:h-4" />
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
