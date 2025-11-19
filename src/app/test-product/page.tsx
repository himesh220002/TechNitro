'use client'
import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  inventory: number
  rating?: number
  images?: string[]
}

export default function TestProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/test-product')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setProducts(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Products</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id} className="mb-2">
            {p.name} - ₹{p.price.toLocaleString()} ({p.inventory} in stock)
          </li>
        ))}
      </ul>
    </div>
  )
}
