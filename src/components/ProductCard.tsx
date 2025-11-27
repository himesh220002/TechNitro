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
      <div className=" rounded-lg h-full p-2 sm:p-4 mx-auto shadow hover:shadow-md transition cursor-pointer bg-gradient-to-tr from-gray-700/60 to-purple-400/70">
        {product.imageUrl ? (
          <div className="mx-auto relative w-20 sm:w-full h-20 sm:h-64 bg-white rounded overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="w-full h-15 sm:h-48 bg-gray-100 flex items-center justify-center rounded text-gray-400">
            No image
          </div>
        )}



        <h2 className="text-xs sm:text-xl font-semibold mt-2">{((product.name).slice(0,22))+".."}</h2>
        <p className="text-xs sm:text-sm text-gray-400">{product.category}</p>
        <p className="mt-2 text-sm sm:text-lg text-green-600 font-bold">₹{product.price}</p>
        <p className="text-xs text-gray-400">Stocks: {product.inventory}</p>
      </div>
    </Link>
  )
}
