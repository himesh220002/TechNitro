// src/app/recommendations/page.tsx
import { Product } from '@/types/product'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { baseUrl } from '@/lib/baseUrl'
import RecommendationsGrid from '@/components/RecommendationsGrid'

export const dynamic = 'force-dynamic'

async function getRecommendedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${baseUrl}/api/recommendations`, {
      cache: "force-cache",
      next: { revalidate: 60 }
    })

    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return []
  }
}

export default async function RecommendationsPage() {
  const result = await getRecommendedProducts()
  const products = Array.isArray(result) ? result : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      <main className="px-6 py-12 max-w-[1600px] mx-auto">
        <RecommendationsGrid initialProducts={products} />
      </main>
      <Footer />
    </div>
  )
}

export const revalidate = 60