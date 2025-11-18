//src/app/admin/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import AdminProductCard from './AdminProductCard'
import { Product } from '@/types/product'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import SpecsModal from '@/components/SpecsModal'
import Image from 'next/image'



export default function AdminPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showSpecsModal, setShowSpecsModal] = useState(false)

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

  const [products, setProducts] = useState<Product[]>([]) 
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'inventory'>('name')
  const [loading, setLoading] = useState(true)
  const [openAddProduct, setOpenAddProduct] = useState(false);


  useEffect(() => {
    async function fetchProducts() {
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
    fetchProducts()
  }, [])

  // Client-side guard: redirect non-admin users to admin login. This is a secondary
  // protection layer in addition to the middleware.
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const user = data?.user
        if (!mounted) return
        if (!user || user.user_metadata?.role !== 'admin') {
          router.replace('/admin/login')
        }
      } catch (err) {
        console.error('Admin page auth check failed', err)
        if (mounted) router.replace('/admin/login')
      }
    })()
    return () => { mounted = false }
  }, [supabase.auth, router])


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    let imageUrl = ''
    const images: string[] = []

    // upload all selected imageFiles (if any)
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
        setStatus('error')
        return
      }
      imageUrl = images.length ? images[0] : ''
    } else if (imageFile) {
      // backward-compatible single file flow
      const filePath = `categoryImage/${Date.now()}-${imageFile.name}`
  const { error } = await supabase.storage.from('product-images').upload(filePath, imageFile)
      if (error) {
        console.error('Image upload failed:', error)
        setStatus('error')
        return
      }
      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`
      images.push(imageUrl)
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
        imageUrl,
        images: images.length ? images : undefined,
        lastUpdated: new Date().toISOString(),
      }),
    })

    if (res.ok) {
      setStatus('success')
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
      setImageFile(null)
      setOpenAddProduct(false)
    } else {
      setStatus('error')
    }
  }

   const filteredProducts = products.filter((p) =>
    `${p.name} ${p.category} ${p.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    }
    if (sortBy === 'price') {
      return a.price - b.price
    }
    if (sortBy === 'inventory') {
      return a.inventory - b.inventory
    }
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

  useEffect(() => {
  if (status === 'success') {
    const timer = setTimeout(() => setStatus('idle'), 3000)
    return () => clearTimeout(timer)
  }
}, [status])



  

  return (
    <>
        <Navbar />
    
    <main className="p-6 max-w-7xl mx-auto">
      <div className='flex flex-col items-start gap-10 mb-10'>
      <div className='flex items-center gap-5'>
        <h1 className="text-2xl font-bold ">🛠️ Add Product</h1>
        {openAddProduct === false? <button
          onClick={()=> setOpenAddProduct(true)}
          className='border border-gray-400/40 rounded bg-gray-800/40 px-3 py-1 '
        >
          + Add
        </button> 
        : <button 
            onClick={()=> setOpenAddProduct(false)}
            className='border border-gray-400/40 rounded bg-gray-800/40 px-3 py-1 '
          >
            close
          </button>}
        
      </div>
      
      {openAddProduct ? 
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mb-8">
        {['name', 'slug', 'price', 'category', 'inventory'].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full p-2 border rounded"
          />
        ))}
        {/* Rating input */}
          <input
            type="text"
            placeholder="rating out of 10"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            className="w-full p-2 border rounded"
          />

          {/* Add Specs Button */}
          <div className="flex items-center justify-between border p-4 rounded bg-gray-800">
            <ul className="text-sm text-gray-300 space-y-1">
              {Object.entries(form.specs).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
            <div className='flex flex-col gap-2'>
              <span className="text-sm text-gray-500">
                Specs: {
                  Object.values(form.specs).filter((v) => v.trim() !== '').length
                } filled
              </span>
            <button
              type="button"
              onClick={() => setShowSpecsModal(true)}
              className="text-indigo-300 hover:underline text-sm"
            >
              ➕ Add/Edit Specs
            </button>
            </div>
          </div>
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
          

        <textarea
          placeholder="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-2 border rounded resize-y min-h-[110px]"
        />
        {/* Multi-image picker: hidden input + Add images button */}
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

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border border-gray-400/40 rounded bg-gray-800/40 px-3 py-1"
            >
              + Add images
            </button>
            <span className="text-sm text-gray-400">{imageFiles.length} selected</span>
          </div>

          {/* Previews */}
          {imageFiles.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {imageFiles.map((f, idx) => (
                <div key={`${f.name}-${f.size}-${idx}`} className="flex flex-col items-center gap-1">
                  <Image
                    width={80}
                    height={56}
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="w-20 h-14 object-cover rounded border"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setImageFiles((prev) => {
                          const copy = [...prev]
                          const [file] = copy.splice(idx, 1)
                          copy.unshift(file)
                          return copy
                        })
                      }}
                      className="text-xs text-blue-300"
                    >
                      Set cover
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-xs text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </form>
      : ''}
      </div>
      

      {status === 'success' && (
        <p className="mt-4 text-green-600">✅ Product added successfully!</p>
      )}
      {status === 'error' && (
        <p className="mt-4 text-red-600">❌ Failed to add product.</p>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ">

        <button
          onClick={() => router.push('/admin-orders')}
          className="bg-gray-800 text-gray-100 px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer"
        >
          View Orders
        </button>
        <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="p-2 border rounded bg-white text-black w-full sm:w-auto"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="inventory">Sort by Inventory</option>
          </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="p-2 rounded border bg-gray-100 text-black w-full sm:w-64"
        />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filteredProducts.map((product) => (
              <AdminProductCard key={product.id} product={product} />
            ))}
      </div>

    </main>
    </>
  )
}
