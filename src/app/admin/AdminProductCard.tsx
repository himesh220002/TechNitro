'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/types/product'
import supabase from '@/lib/supabase'
import React from 'react'

interface AdminProductCardProps {
  product: Product
}

export default function AdminProductCard({ product }: AdminProductCardProps) {
  const [editing, setEditing] = useState(false)
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
    <div className="rounded-lg p-4 space-y-4 shadow-sm bg-gray-800 text-white">
      {/* Image / Images carousel preview */}
      {(form.images && form.images.length > 0) || form.imageUrl ? (
        <div className="relative w-full h-90 overflow-hidden bg-white rounded">
          <Image
            src={(form.images && form.images.length ? form.images[0] : form.imageUrl) as string}
            alt={form.name}
            width={400}
            height={300}
            className="object-cover w-full h-full rounded"
          />
          {/* small thumbnails */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            {(form.images || (form.imageUrl ? [form.imageUrl] : [])).map((img, idx) => (
              <div key={img} className="w-12 h-8 rounded overflow-hidden border border-gray-700">
                <Image src={img} alt={`thumb-${idx}`} width={48} height={32} className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 rounded">
          No image available
        </div>
      )}

      {/* Editable Form */}
      {editing ? (
        <div className="space-y-2">
          {['name', 'price', 'category', 'inventory'].map((field) => (
            <React.Fragment key={field}>
              <label className="block text-sm mt-2">{field}:</label>
              <input
                value={form[field as keyof typeof form] as string | number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [field]:
                      field === 'price' || field === 'inventory'
                        ? Number(e.target.value)
                        : e.target.value,
                  })
                }
                className="w-full p-2 border rounded bg-gray-100 text-black"
                placeholder={field}
              />
            </React.Fragment>
          ))}

          {/* Rating */}
          <label className="block text-sm mt-2">Rating:</label>
          <input
            type="number"
            value={form.rating ?? ''}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            className="w-full p-2 border rounded bg-gray-100 text-black"
            placeholder="Rating (e.g. 4.5)"
            min={0}
            max={10}
            step={1}
          />

          {/* Specs */}
<label className="block text-sm mt-2">Specs:</label>
{specList.map((spec, idx) => (
  <div key={idx} className="flex gap-2 mb-1">
    <input
      type="text"
      value={spec.key}
      onChange={(e) => {
        const updated = [...specList]
        updated[idx].key = e.target.value
        setSpecList(updated)
      }}
      className="w-1/3 p-2 border rounded bg-gray-100 text-black"
      placeholder="Spec name"
    />
    <input
      type="text"
      value={spec.value}
      onChange={(e) => {
        const updated = [...specList]
        updated[idx].value = e.target.value
        setSpecList(updated)
      }}
      className="w-2/3 p-2 border rounded bg-gray-100 text-black"
      placeholder="Spec value"
    />
    <button
      onClick={() => {
        const updated = specList.filter((_, i) => i !== idx)
        setSpecList(updated)
      }}
      className="text-red-400 hover:text-red-600 text-sm px-2"
      title="Delete spec"
    >
      ✕
    </button>
  </div>
))}

{/* Add new spec */}
<div className="flex gap-2 mt-2">
  <input
    type="text"
    placeholder="New spec name"
    value={newSpecKey}
    onChange={(e) => setNewSpecKey(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        const key = newSpecKey.trim()
        if (key && !specList.some((s) => s.key === key)) {
          setSpecList([...specList, { key, value: '' }])
          setNewSpecKey('')
          e.preventDefault()
        }
      }
    }}
    className="w-1/3 p-2 border rounded bg-gray-100 text-black"
  />
  <span className="text-sm text-gray-400 pt-2">↵ to add</span>
</div>


          {/* Description */}
          <label className="block text-sm mt-2">Description:</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-2 border rounded bg-gray-100 text-black resize-y min-h-[110px]"
            placeholder="Description"
          />

          {/* Image Upload */}
          <label className="block text-sm mt-2">Change image:</label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const filePath = `product-images/${Date.now()}-${file.name}`
                  supabase.storage
                    .from('product-images')
                    .upload(filePath, file)
                    .then(({ error }) => {
                      if (!error) {
                        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`
                        const imgs = Array.isArray(form.images) ? [...form.images, publicUrl] : [publicUrl]
                        setForm({ ...form, images: imgs, imageUrl: imgs[0] })
                      } else {
                        console.error('Upload failed:', error.message)
                      }
                    })
                }
              }}
              className="w-full p-2 border rounded bg-gray-100 text-black"
            />

            {/* Manage images list */}
            <div className="flex flex-wrap gap-2">
              {(form.images || []).map((img, idx) => (
                <div key={img} className="flex items-center gap-1">
                  <div className="w-16 h-12 overflow-hidden rounded border">
                    <Image src={img} alt={`img-${idx}`} width={64} height={48} className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <button
                      onClick={() => {
                        // set as cover => move to index 0
                        const imgs = [...(form.images || [])]
                        imgs.splice(idx, 1)
                        imgs.unshift(img)
                        setForm({ ...form, images: imgs, imageUrl: imgs[0] })
                      }}
                      className="text-xs text-blue-400 hover:underline"
                      type="button"
                    >
                      Set cover
                    </button>
                    <button
                      onClick={() => {
                        const imgs = (form.images || []).filter((i) => i !== img)
                        setForm({ ...form, images: imgs, imageUrl: imgs[0] ?? '' })
                      }}
                      className="text-xs text-red-400 hover:underline"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {hasChanged && (
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
            )}
            <button
              onClick={() => {
                setForm(originalProduct)
                setEditing(false)
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1 bg-gradient-to-tl from-sky-100/40 to-gray-900/40 p-3 rounded text-black">
          <h2 className="text-xl text-gray-400 font-bold">{form.name}</h2>
          <p className="text-green-400 font-semibold">₹{form.price}</p>
          <p className="text-sm text-gray-300">{form.category}</p>
          <p className="text-gray-200">{(form.description).slice(0, 200)+"..."}</p>
          <p className="text-sm text-gray-200">Stocks: {form.inventory}</p>
          {form.rating !== undefined && (
            <p className="text-sm text-yellow-400">⭐ Rating: {form.rating}</p>
          )}
          {form.specs && Object.keys(form.specs).length > 0 && (
            <ul className="text-sm text-gray-200 list-disc list-inside mt-2">
              {Object.entries(form.specs).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
