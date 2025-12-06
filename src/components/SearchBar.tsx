'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/product'
import { baseUrl } from '@/lib/baseUrl'

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults([])
                return
            }

            setIsLoading(true)
            try {
                // In a real app, use a dedicated search API
                const res = await fetch(`${baseUrl}/api/products`)
                if (!res.ok) throw new Error('Failed to fetch')
                const products: Product[] = await res.json()

                const filtered = products.filter(p =>
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    p.category.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5)

                setResults(filtered)
                setIsOpen(true)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setIsLoading(false)
            }
        }

        const timeoutId = setTimeout(fetchResults, 300)
        return () => clearTimeout(timeoutId)
    }, [query])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            setIsOpen(false)
            // Navigate to products page with search query (implementation depends on products page)
            // For now, just close
            router.push(`/products?search=${encodeURIComponent(query)}`)
        }
    }

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md hidden md:block">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Search products..."
                    className="w-full bg-gray-800 text-gray-200 pl-10 pr-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                        <X size={14} />
                    </button>
                )}
            </form>

            {isOpen && (results.length > 0 || isLoading) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
                    ) : (
                        <ul>
                            {results.map((product) => (
                                <li key={product.id}>
                                    <Link
                                        href={`/products/${product.slug}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="relative w-10 h-10 bg-white rounded overflow-hidden flex-shrink-0">
                                            {product.imageUrl ? (
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-700" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-200 truncate">{product.name}</h4>
                                            <p className="text-xs text-gray-500">{product.category}</p>
                                        </div>
                                        <span className="text-sm font-bold text-purple-400">
                                            ₹{product.price.toLocaleString('en-IN')}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
