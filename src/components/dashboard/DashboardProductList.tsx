'use client'

import { Product } from '@/types/product'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Edit, Trash2, Eye, CheckSquare, Square, Lock, Unlock, Key, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'

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

    // Edit Lock State
    const [isEditingEnabled, setIsEditingEnabled] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordInput, setPasswordInput] = useState('')
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Clear timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    const handleUnlockClick = () => {
        setShowPasswordModal(true)
        setPasswordInput('')
    }

    const handleLockClick = () => {
        setIsEditingEnabled(false)
        if (timerRef.current) clearTimeout(timerRef.current)
        toast.success('Edits locked')
    }

    const verifyPassword = (e: React.FormEvent) => {
        e.preventDefault()
        // Simple hardcoded check as requested
        const validPassword = process.env.NEXT_PUBLIC_ADMIN_EDIT_PASSWORD
        if (passwordInput === validPassword) {
            setIsEditingEnabled(true)
            setShowPasswordModal(false)
            toast.success('Edits enabled for 30 minutes')

            // Auto-lock after 30 minutes
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
                setIsEditingEnabled(false)
                toast('Edit session expired. Edits locked.', { icon: '🔒' })
            }, 30 * 60 * 1000)
        } else {
            toast.error('Incorrect password')
        }
    }

    const handleEdit = (productId: string) => {
        if (!isEditingEnabled) return
        router.push(`/admin/dashboard/products?edit=${productId}`)
    }

    const handleDelete = async (product: Product) => {
        if (!isEditingEnabled) return
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
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-xl relative">
            {/* Header / Toolbar */}
            <div className="p-4 border-b border-gray-800 flex justify-end">
                {!isEditingEnabled ? (
                    <button
                        onClick={handleUnlockClick}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                        <Lock size={14} />
                        Enable Edits
                    </button>
                ) : (
                    <button
                        onClick={handleLockClick}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20"
                    >
                        <Unlock size={14} />
                        Lock Edits
                    </button>
                )}
            </div>

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
                                        <div className="flex items-center justify-end gap-1 sm:gap-2 lg:opacity-80 lg:group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/products/${product.slug}`}
                                                className="p-1.5 sm:p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                                title="View Product"
                                            >
                                                <Eye size={14} className="sm:w-4 sm:h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleEdit(product.id)}
                                                disabled={!isEditingEnabled}
                                                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isEditingEnabled
                                                    ? 'bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                                                    : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                                    }`}
                                                title={isEditingEnabled ? "Edit Product" : "Edits Locked"}
                                            >
                                                <Edit size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                disabled={!isEditingEnabled}
                                                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isEditingEnabled
                                                    ? 'bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                                                    : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                                    }`}
                                                title={isEditingEnabled ? "Delete Product" : "Edits Locked"}
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

            {/* Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Key className="text-purple-500" size={20} />
                                    Unlock Edits
                                </h3>
                                <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={verifyPassword}>
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-400 mb-2">Editor Password</label>
                                    <input
                                        type="password"
                                        autoFocus
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Enter password..."
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Entering correct password unlocks edits for 30 minutes.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 font-medium"
                                    >
                                        Unlock
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
