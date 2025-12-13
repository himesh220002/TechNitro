'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/types/product'
import supabase from '@/lib/supabase'
import React from 'react'
import { Edit, Trash2, Save, X, Image as ImageIcon, Star, Package, Tag, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SpecsModal from '@/components/SpecsModal'

interface AdminProductCardProps {
  product: Product
  highlighted?: boolean
  isEditingEnabled?: boolean
}

export default function AdminProductCard({ product, highlighted = false, isEditingEnabled = false }: AdminProductCardProps) {
  const [editing, setEditing] = useState(false)
  const [showSpecsModal, setShowSpecsModal] = useState(false)
  const [form, setForm] = useState<Product>({
    ...product,
    rating: product.rating ?? 0,
    specs: product.specs ?? {},
    images: (product as unknown as { images?: string[] }).images ?? (product.imageUrl ? [product.imageUrl] : []),
  })
  const [originalProduct, setOriginalProduct] = useState(form)

  const [specList, setSpecList] = useState<{ key: string; value: string }[]>(
    Object.entries(form.specs ?? {}).map(([key, value]) => ({ key, value }))
  )
  const [newSpecKey, setNewSpecKey] = useState('')


  const hasChanged =
    form.name !== originalProduct.name ||
    form.price !== originalProduct.price ||
    form.category !== originalProduct.category ||
    form.description !== originalProduct.description ||
    form.inventory !== originalProduct.inventory ||
    JSON.stringify(form.images || []) !== JSON.stringify(originalProduct.images || []) ||
    form.imageUrl !== originalProduct.imageUrl ||
    form.rating !== originalProduct.rating ||
    JSON.stringify(specList) !==
    JSON.stringify(Object.entries(originalProduct.specs ?? {}).map(([key, value]) => ({ key, value: String(value) })))

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product?')) return

    const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
    if (res.ok) {
      window.location.reload()
    } else {
      console.error('Delete failed')
    }
  }

  // Update form.specs before saving
  async function handleUpdate() {
    const specsObject = Object.fromEntries(specList.map(({ key, value }) => [key, value]))
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, specs: specsObject }),
    })

    if (res.ok) {
      const updated = await res.json()
      setForm(updated)
      setOriginalProduct(updated)
      setSpecList(Object.entries(updated.specs ?? {}).map(([key, value]) => ({ key, value: String(value), })))
      setEditing(false)
    } else {
      console.error('Update failed')
    }
  }

  return (
    <motion.div
      layout
      initial={{ scale: highlighted ? 1.05 : 1 }}
      animate={{ scale: 1 }}
      className={`group relative bg-gray-900/40 backdrop-blur-xl border overflow-hidden transition-all duration-300 rounded-2xl ${highlighted
        ? 'ring-2 ring-purple-500 border-purple-500 shadow-lg shadow-purple-500/50'
        : editing
          ? 'ring-2 ring-purple-500/50 scale-[1.02] z-10 border-white/10'
          : 'hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 border-white/10'
        }`}
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-800">
        {(form.images && form.images.length > 0) || form.imageUrl ? (
          <>
            <Image
              src={(form.imageUrl || (form.images && form.images.length ? form.images[0] : '')) as string}
              alt={form.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium text-white flex items-center gap-1">
                <Tag size={12} className="text-purple-400" />
                {form.category}
              </span>
            </div>

            <div className="absolute top-3 right-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${form.inventory > 10
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : form.inventory > 0
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                {form.inventory > 10 ? 'In Stock' : form.inventory > 0 ? 'Low Stock' : 'Out of Stock'}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col gap-2">
            <ImageIcon size={32} />
            <span className="text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 space-y-4">
        {!editing ? (
          // View Mode
          <>
            <div className="flex justify-between items-start gap-4">
              <h3 className="font-bold text-lg text-white leading-tight line-clamp-2" title={form.name}>
                {form.name}
              </h3>
              <div className="flex flex-col items-end shrink-0">
                <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  ₹{Number(form.price).toLocaleString('en-IN')}
                </span>
                {form.rating && (
                  <div className="flex items-center gap-1 text-xs text-yellow-400 mt-1">
                    <Star size={12} fill="currentColor" />
                    <span>{form.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5em]">
              {form.description}
            </p>

            {/* Specs Preview */}
            {form.specs && Object.keys(form.specs).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(form.specs).slice(0, 3).map(([key, value]) => (
                  <span key={key} className="text-[10px] px-2 py-1 rounded bg-gray-800/50 border border-gray-700 text-gray-300">
                    {key}: {value}
                  </span>
                ))}
                {Object.keys(form.specs).length > 3 && (
                  <span className="text-[10px] px-2 py-1 rounded bg-gray-800/50 border border-gray-700 text-gray-400">
                    +{Object.keys(form.specs).length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-gray-800/50">
              <button
                onClick={() => setEditing(true)}
                disabled={!isEditingEnabled}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm font-medium group/btn ${isEditingEnabled
                  ? 'bg-gray-800 text-gray-300 lg:hover:bg-purple-600/20 lg:hover:text-purple-400 cursor-pointer lg:opacity-80 lg:hover:opacity-100'
                  : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                  }`}
                title={isEditingEnabled ? "Edit Product" : "Edits Locked"}
              >
                <Edit size={16} className={`transition-transform ${isEditingEnabled ? 'group-hover/btn:scale-110' : ''}`} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={!isEditingEnabled}
                className={`flex items-center justify-center p-2 rounded-lg transition-all ${isEditingEnabled
                  ? 'bg-gray-800 text-gray-300 lg:hover:bg-red-500/20 lg:hover:text-red-400 cursor-pointer lg:opacity-80 lg:hover:opacity-100'
                  : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                  }`}
                title={isEditingEnabled ? "Delete Product" : "Edits Locked"}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-950/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm"
                  placeholder="Product Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Price</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 bg-gray-950/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Stock</label>
                  <div className="relative">
                    <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="number"
                      value={form.inventory}
                      onChange={(e) => setForm({ ...form, inventory: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 bg-gray-950/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-950/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Rating (0-5)</label>
                  <input
                    type="number"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Math.round(Number(e.target.value) * 10) / 10 })}
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
                    className="w-full px-3 py-2 bg-gray-950/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 outline-none text-sm"
                    min="0" max="5" step="0.1"
                    placeholder="e.g., 4.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-950/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 outline-none text-sm min-h-[80px] resize-y"
                />
              </div>

              {/* Specs Editor */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Specifications</label>
                <button
                  type="button"
                  onClick={() => setShowSpecsModal(true)}
                  className="w-full px-3 py-2 bg-gray-950/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-purple-500 transition-colors text-sm text-left"
                >
                  {Object.keys(form.specs ?? {}).length > 0
                    ? `Edit Specifications (${Object.keys(form.specs ?? {}).length} items)`
                    : 'Add Specifications'}
                </button>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Images</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <label className="flex-shrink-0 w-16 h-16 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-gray-800/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files
                        if (files && files.length > 0) {
                          const uploadedUrls: string[] = []

                          // Upload all selected files
                          for (let i = 0; i < files.length; i++) {
                            const file = files[i]
                            const filePath = `product-images/${Date.now()}-${i}-${file.name}`
                            const { error } = await supabase.storage
                              .from('product-images')
                              .upload(filePath, file)

                            if (!error) {
                              const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`
                              uploadedUrls.push(publicUrl)
                            }
                          }

                          // Add all uploaded images to the form
                          if (uploadedUrls.length > 0) {
                            const imgs = Array.isArray(form.images) ? [...form.images, ...uploadedUrls] : uploadedUrls
                            setForm({ ...form, images: imgs, imageUrl: form.imageUrl || imgs[0] })
                          }

                          // Reset input so same files can be selected again if needed
                          e.target.value = ''
                        }
                      }}
                    />
                    <PlusIcon />
                  </label>
                  {(form.images || []).map((img, idx) => (
                    <div
                      key={img}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 group/img cursor-pointer transition-all ${form.imageUrl === img
                        ? 'border-purple-500 ring-2 ring-purple-500/50'
                        : 'border-gray-700 hover:border-purple-400'
                        }`}
                      onClick={() => setForm({ ...form, imageUrl: img })}
                      title={form.imageUrl === img ? 'Cover Image' : 'Click to set as cover'}
                    >
                      <Image src={img} alt="" fill className="object-cover" />

                      {/* Cover Badge */}
                      {form.imageUrl === img && (
                        <div className="absolute top-0 left-0 right-0 bg-purple-500 text-white text-[8px] font-bold text-center py-0.5">
                          COVER
                        </div>
                      )}

                      {/* Delete Button - Bottom Right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const imgs = (form.images || []).filter((i) => i !== img)
                          // If deleting cover image, set first remaining image as cover
                          const newCover = form.imageUrl === img ? (imgs[0] ?? '') : form.imageUrl
                          setForm({ ...form, images: imgs, imageUrl: newCover })
                        }}
                        className="absolute bottom-0 right-0 p-1 bg-red-500/90 hover:bg-red-600 text-white rounded-tl-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                        title="Delete image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleUpdate}
                disabled={!hasChanged}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setForm(originalProduct)
                  setEditing(false)
                }}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Specs Modal */}
      {showSpecsModal && (
        <SpecsModal
          initialSpecs={form.specs ?? {}}
          onSave={(updatedSpecs) => {
            setForm({ ...form, specs: updatedSpecs })
            setShowSpecsModal(false)
          }}
          onClose={() => setShowSpecsModal(false)}
        />
      )}
    </motion.div>
  )
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}
