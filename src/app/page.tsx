//src/app/page.tsx

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import ProductFilter from '@/components/ProductFilter'
// import TorchHero from '@/components/TorchHero'
import { Product } from '@/types/product'
import GradientBackground from '@/components/GradientBackground'
import { GradientHeading } from '@/components/ui/LoadingStates'
import Carousel from '@/components/Carousel'
import FeaturedHero from '@/components/FeaturedHero'
import ProductBlockGrid from '@/components/ProductBlockGrid'
import { baseUrl } from '@/lib/baseUrl'
import SpecialOffer from '@/components/SpecialOffer'
// import TestProductPage from './test-product/page'


async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${baseUrl}/api/products`, {
      // const res = await fetch('/api/products', {
      cache: "force-cache",
      next: { revalidate: 60 },

    })
    if (!res.ok) {
      console.error(`Failed to fetch products: ${res.status} ${res.statusText}`)
      return []
    }
    const data = await res.json()
    return data
  } catch (err) {
    console.error('Fetch error:', err)
    return []
  }
}


export default async function HomePage() {
  const products = await getProducts()

  // Group products by category
  const categories = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <GradientBackground>
      <Navbar />
      <main className="min-h-screen ">
        <section className='relative max-w-[1600px]  mx-auto'>
          <FeaturedHero />
        </section>

        {/* Trust Badges */}
        <section className="max-w-[1600px] mx-auto px-6 py-8 m-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🛡️", title: "Secure Payments", desc: "100% protected transactions" },
              { icon: "✅", title: "Verified Sellers", desc: "Trusted & vetted partners" },
              { icon: "↩️", title: "7-Day Returns", desc: "Easy & hassle-free returns" },
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <span className="text-3xl">{badge.icon}</span>
                <div>
                  <h3 className="text-white font-semibold">{badge.title}</h3>
                  <p className="text-gray-400 text-sm">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* <section>
          <TestProductPage />
        </section> */}

        <section >
          <ProductBlockGrid />
        </section>

        {/* Hero Section */}
        {/* <section className="relative max-w-[1600px] mx-auto">
          <TorchHero />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 pointer-events-none" />
        </section> */}

        {/* Featured Categories */}
        <section className="max-w-[1600px] mx-auto px-6 py-5 text-center sm:text-start md:py-16 space-y-16">
          <GradientHeading>Featured Categories</GradientHeading>

          {/* Category Sections */}
          {Object.entries(categories).map(([category, categoryProducts]) => (
            <div key={category} className="space-y-6">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-200 capitalize">{category}</h2>
              <Carousel products={categoryProducts} />
            </div>
          ))}
        </section>

        {/* Special Offer Section */}
        <section className="max-w-[1600px] mx-auto px-6 py-8">
          <SpecialOffer />
        </section>

        {/* All Products with Filter */}
        <section className="max-w-[1600px] mx-auto px-6 my-5 md:py-16">
          <div className="mb-8">
            <GradientHeading>All Products</GradientHeading>
            <p className="mt-2 text-gray-400">Find the perfect item from our collection</p>
          </div>
          <ProductFilter products={products} />
        </section>
      </main>
      <Footer />
    </GradientBackground>
  )
}
