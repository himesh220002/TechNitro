'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Product } from '@/types/product'
import DashboardWrapper from '@/components/dashboard/DashboardWrapper'
import AdminProductCard from '@/components/dashboard/AdminProductCard'
import SpecsModal from '@/components/SpecsModal'
import { Plus, Search, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

export default function ProductsPage() {
    const supabase = createClientComponentClient()
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

    useEffect(() => {
        fetchProducts()
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus('loading')

        const images: string[] = []

        // Upload all selected imageFiles
        if (imageFiles.length > 0) {
            try {
                await Promise.all(
                    imageFiles.map(async (file) => {
                        const filePath = `product-images/${Date.now()}-${file.name}`
                        const { error } = await supabase.storage.from('product-images').upload(filePath, file)
                        if (error) throw error
                        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`
                        images.push(publicUrl)
                    })
                )
            } catch (err) {
                console.error('One or more uploads failed', err)
                toast.error('Image upload failed')
                setStatus('error')
                return
            }
        }

        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                price: Number(form.price),
                inventory: Number(form.inventory),
                rating: Number(form.rating),
                specs: form.specs,
                imageUrl: images.length ? images[0] : '',
                images: images.length ? images : undefined,
                lastUpdated: new Date().toISOString(),
            }),
        })

        if (res.ok) {
            setStatus('idle')
            toast.success('Product added successfully!')
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
            setStatus('idle')
            toast.error('Failed to add product')
        }
    }

    const filteredProducts = products
        .filter((p) =>
            `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            if (sortBy === 'price') return a.price - b.price
            if (sortBy === 'inventory') return a.inventory - b.inventory
            return 0
        })

    function SkeletonCard() {
        return (
            <div className="animate-pulse bg-gray-800 rounded-lg p-4 space-y-4">
                <div className="h-40 bg-gray-700 rounded" />
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-700 rounded w-2/3" />
            </div>
        )
    }

    return (
        <DashboardWrapper>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Product Management</h1>
                    <p className="text-gray-400 mt-1">Manage your product catalog</p>
                </div>
                <button
                    onClick={() => setOpenAddProduct(!openAddProduct)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                    {openAddProduct ? <X size={20} /> : <Plus size={20} />}
                    <span>{openAddProduct ? 'Close' : 'Add Product'}</span>
                </button>
            </div>

            {/* Add Product Form */}
            {openAddProduct && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Add New Product</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['name', 'slug', 'price', 'category', 'inventory'].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm text-gray-400 mb-2 capitalize">{field}</label>
                                    <input
                                        type="text"
                                        value={form[field as keyof typeof form] as string}
                                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>
                            ))}

                            {/* Rating Dropdown */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Rating (1-10)</label>
                                <select
                                    value={form.rating}
                                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                >
                                    <option value="">Select rating</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-y min-h-[100px] focus:ring-2 focus:ring-purple-500 outline-none"
                                required
                            />
                        </div>

                        {/* Specs */}
                        <div className="flex items-center justify-between border border-gray-700 p-4 rounded-lg bg-gray-800">
                            <div>
                                <p className="text-sm text-gray-400">
                                    Specifications: {Object.keys(form.specs).length} added
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSpecsModal(true)}
                                className="text-purple-400 hover:text-purple-300 text-sm"
                            >
                                Add/Edit Specs
                            </button>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Product Images</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    if (files.length) {
                                        setImageFiles((prev) => [...prev, ...files])
                                    }
                                    if (fileInputRef.current) fileInputRef.current.value = ''
                                }}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700"
                            >
                                + Add Images ({imageFiles.length} selected)
                            </button>

                            {imageFiles.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto py-2 mt-2">
                                    {imageFiles.map((f, idx) => (
                                        <div key={`${f.name}-${idx}`} className="flex flex-col items-center gap-1">
                                            <Image
                                                width={80}
                                                height={56}
                                                src={URL.createObjectURL(f)}
                                                alt={f.name}
                                                className="w-20 h-14 object-cover rounded border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                                                className="text-xs text-red-400"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Adding...' : 'Add Product'}
                        </button>
                    </form>
                </div>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
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
        </DashboardWrapper>
    )
}
