// src/app/recommendations/page.tsx
import { Product } from '@/types/product'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { MdRecommend } from "react-icons/md";
import { baseUrl } from '@/lib/baseUrl'

export const dynamic = 'force-dynamic'


async function getRecommendedProducts(): Promise<Product[]> {
  const res = await fetch(`${baseUrl}/api/recommendations`, {
  cache: "no-store",
})

  return res.json()
}

export default async function RecommendationsPage() {
  const products = await getRecommendedProducts()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      <main className="px-6 py-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <MdRecommend className="text-4xl text-purple-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Recommended for You
          </h1>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group block rounded-xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 
                     backdrop-blur-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="relative aspect-square">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-100 group-hover:text-purple-400 transition-colors line-clamp-1">
                  {product.name}
                </h2>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
                {product.inventory > 0 ? (
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    In Stock ({product.inventory} available)
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Out of Stock
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
