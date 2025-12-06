'use client'

import { Product } from '@/types/product'
import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'

interface RelatedProductsProps {
    products: Product[]
    currentProductId: string
}

export default function RelatedProducts({ products, currentProductId }: RelatedProductsProps) {
    const related = products.filter(p => p.id !== currentProductId).slice(0, 4)

    if (related.length === 0) return null

    return (
        <div className="mt-16 border-t border-gray-800 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Similar Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {related.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="group block bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all"
                    >
                        <div className="relative aspect-square bg-white overflow-hidden">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">{product.name}</h3>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-green-400 font-bold">₹{product.price.toLocaleString('en-IN')}</span>
                                <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                    <Star size={12} fill="currentColor" />
                                    <span>4.5</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
