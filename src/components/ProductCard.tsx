//src/components/ProductCard.tsx
import { Product } from '@/types/product'
import Link from 'next/link'
import Image from 'next/image'


interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`}>
      <div className="rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer bg-gradient-to-tr from-gray-700/60 to-black/70">
        {product.imageUrl ? (
          <div className="relative w-full h-40 sm:h-64 bg-white rounded overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded text-gray-400">
            No image
          </div>
        )}



        <h2 className="text-xsm sm:text-xl font-semibold mt-2">{product.name}</h2>
        <p className="text-sm text-gray-400">{product.category}</p>
        <p className="mt-2 text-lg text-green-600 font-bold">₹{product.price}</p>
        <p className="text-xs text-gray-400">Stocks: {product.inventory}</p>
      </div>
    </Link>
  )
}
