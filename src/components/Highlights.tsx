// src/components/Highlights.tsx
import { Product } from '@/types/product'

export default function Highlights({ product }: { product: Product }) {
  const specs = product.specs

  if (!specs || Object.keys(specs).length === 0) {
    return <p className="text-sm text-white/80">No specifications available.</p>
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {Object.entries(specs).reverse().map(([key, value]) => (
        <div
          key={key}
          className="p-2 border border-gray-400/10 rounded text-sm text-white/80 bg-gray-400/40"
        >
          <span className="font-medium capitalize">{key}:</span> {value}
        </div>
      ))}
    </div>
  )
}

