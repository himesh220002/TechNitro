'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Product } from '@/types/product'
import DashboardWrapper from '@/components/dashboard/DashboardWrapper'
import AdminProductCard from '@/components/dashboard/AdminProductCard'
import SpecsModal from '@/components/SpecsModal'
import { Plus, Search, X, Lock, Unlock, Key } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import { motion, AnimatePresence } from 'framer-motion'
import { useBudgetLock } from '@/hooks/useBudgetLock'

export default function ProductsPageContent() {
    const supabase = createBrowserClient()
    const searchParams = useSearchParams()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'inventory'>('name')
    const [openAddProduct, setOpenAddProduct] = useState(false)
    const [showSpecsModal, setShowSpecsModal] = useState(false)
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [imageFiles, setImageFiles] = useState<File[]>([])

    // Edit Lock State (Hook)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordInput, setPasswordInput] = useState('')
    const { isEditingEnabled, formatTime, lock, unlock, awayBudget } = useBudgetLock('admin_products_unlock_expiry')

    const handleUnlockClick = () => {
        setShowPasswordModal(true)
        setPasswordInput('')
    }

    const handleLockClick = () => {
        lock()
        setOpenAddProduct(false)
    }

    const verifyPassword = (e: React.FormEvent) => {
        e.preventDefault()
        const validPassword = process.env.NEXT_PUBLIC_ADMIN_EDIT_PASSWORD || 'admin123'
        if (passwordInput === validPassword) {
            unlock()
            setShowPasswordModal(false)
        } else {
            toast.error('Incorrect password')
        }
    }

    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        category: '',
        inventory: '',
        rating: '',
        specs: {} as Record<string, string>,
    })

    // declare fetchProducts before using it in effects to satisfy react-hooks lint
    const fetchProducts = async () => {
        setLoading(true)
        const res = await fetch('/api/products')
        const data = await res.json()
        if (Array.isArray(data)) {
            setProducts(data)
        } else if (data && Array.isArray((data as unknown as { products?: Product[] }).products)) {
            setProducts((data as unknown as { products?: Product[] }).products || [])
        } else {
            console.error('Unexpected /api/products response:', data)
            setProducts([])
        }
        setLoading(false)
    }

    useEffect(() => {
        // call async fetch from inside effect
        ; (async () => {
            await fetchProducts()
        })()
    }, [])

    // Handle scroll to product when edit param is present
    useEffect(() => {
        const editProductId = searchParams?.get('edit')
        if (editProductId && products.length > 0) {
            // Wait for DOM to be ready
            setTimeout(() => {
                const element = document.getElementById(`product-${editProductId}`)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    setHighlightedProductId(editProductId)
                    // Remove highlight after 3 seconds
                    setTimeout(() => setHighlightedProductId(null), 3000)
                }
            }, 300)
        }
    }, [searchParams, products])



    const handleAddProduct = async () => {
        setStatus('loading')

        try {
            // Upload images first
            const uploadedImageUrls: string[] = []
            for (const file of imageFiles) {
                const filePath = `product-images/${Date.now()}-${file.name}`
                const { error } = await supabase.storage.from('product-images').upload(filePath, file)
                if (!error) {
                    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`
                    uploadedImageUrls.push(publicUrl)
                }
            }

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    inventory: Number(form.inventory),
                    rating: Number(form.rating) || 0,
                    imageUrl: uploadedImageUrls[0] || '',
                    images: uploadedImageUrls,
                }),
            })

            if (res.ok) {
                setStatus('success')
                toast.success('✅ Product added successfully!')
                setForm({
                    name: '',
                    slug: '',
                    description: '',
                    price: '',
                    category: '',
                    inventory: '',
                    rating: '',
                    specs: {},
                })
                setImageFiles([])
                setOpenAddProduct(false)
                fetchProducts()
            } else {
                setStatus('error')
                toast.error('❌ Failed to add product')
            }
        } catch (error) {
            setStatus('error')
            toast.error('❌ Error adding product')
            console.error('Add product error:', error)
        }
    }

    const filteredProducts = products
        .filter((p) => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.category.toLowerCase().includes(search.toLowerCase())
            return matchesSearch
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'price') return a.price - b.price
            if (sortBy === 'inventory') return a.inventory - b.inventory
            return 0
        })

    return (
        <DashboardWrapper>
            <Breadcrumbs items={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Products' }]} />
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Product Management</h1>
                    <p className="text-gray-400 mt-1">Manage your product catalog</p>
                </div>
                <div className="flex gap-2">
                    {!isEditingEnabled ? (
                        <button
                            onClick={handleUnlockClick}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-sm font-medium"
                        >
                            <Lock size={16} />
                            Enable Edits
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                <span className="text-xs font-medium text-purple-200">
                                    Active
                                </span>
                                <span className="text-xs text-gray-500 border-l border-gray-700 pl-2 ml-1 font-mono min-w-[40px]">
                                    {formatTime()}
                                </span>
                            </div>
                            <button
                                onClick={handleLockClick}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20"
                            >
                                <Unlock size={16} />
                                Lock Edits
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setOpenAddProduct(!openAddProduct)}
                        disabled={!isEditingEnabled}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isEditingEnabled
                            ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                        title={isEditingEnabled ? (openAddProduct ? 'Cancel' : 'Add Product') : 'Unlock Edits First'}
                    >
                        {openAddProduct ? <X size={20} /> : <Plus size={20} />}
                        {openAddProduct ? 'Cancel' : 'Add Product'}
                    </button>
                </div>
            </div>

            {/* Add Product Form */}
            {openAddProduct && (
                <div className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-4">Add New Product</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Category"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <input
                            type="number"
                            placeholder="Inventory"
                            value={form.inventory}
                            onChange={(e) => setForm({ ...form, inventory: e.target.value })}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <input
                            type="number"
                            placeholder="Rating (0-5)"
                            value={form.rating}
                            onChange={(e) => setForm({ ...form, rating: e.target.value })}
                            onInput={(e) => {
                                const input = e.currentTarget;
                                const value = input.value;
                                // Allow empty, numbers with max 1 decimal place
                                if (value && !/^\d*\.?\d?$/.test(value)) {
                                    input.value = value.slice(0, -1);
                                }
                                // Enforce max value of 5
                                if (parseFloat(value) > 5) {
                                    input.value = '5.0';
                                }
                            }}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            min="0"
                            max="5"
                            step="0.1"
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setImageFiles(Array.from(e.target.files))
                                    }
                                }}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-purple-500 transition-colors"
                            >
                                {imageFiles.length > 0 ? `${imageFiles.length} image(s) selected` : 'Upload Images'}
                            </button>
                        </div>
                        <textarea
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="md:col-span-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]"
                        />
                        <button
                            onClick={() => setShowSpecsModal(true)}
                            className="md:col-span-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-purple-500 transition-colors"
                        >
                            {Object.keys(form.specs).length > 0 ? `Edit Specs (${Object.keys(form.specs).length})` : 'Add Specifications'}
                        </button>
                    </div>
                    <button
                        onClick={handleAddProduct}
                        disabled={status === 'loading' || !form.name || !form.price}
                        className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? 'Adding...' : 'Add Product'}
                    </button>
                </div>
            )}

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                    <option value="name">Sort by Name</option>
                    <option value="price">Sort by Price</option>
                    <option value="inventory">Sort by Inventory</option>
                </select>
            </div>

            {/* Products Grid */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    : filteredProducts.map((product) => (
                        <div key={product.id} id={`product-${product.id}`}>
                            <AdminProductCard
                                product={product}
                                highlighted={highlightedProductId === product.id}
                                isEditingEnabled={isEditingEnabled}
                            />
                        </div>
                    ))}
                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>No products found</p>
                    </div>
                )}
            </div>

            {/* Specs Modal */}
            {showSpecsModal && (
                <SpecsModal
                    initialSpecs={form.specs}
                    onSave={(updatedSpecs) => {
                        setForm({ ...form, specs: updatedSpecs })
                        setShowSpecsModal(false)
                    }}
                    onClose={() => setShowSpecsModal(false)}
                />
            )}

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
                                    <p className="text-xs text-gray-500 mt-2">Entering correct password unlocks edits (session stays active while on this page).</p>
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
        </DashboardWrapper>
    )
}

function SkeletonCard() {
    return (
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-gray-800" />
            <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-800 rounded w-3/4" />
                <div className="h-4 bg-gray-800 rounded w-full" />
                <div className="h-4 bg-gray-800 rounded w-2/3" />
            </div>
        </div>
    )
}
