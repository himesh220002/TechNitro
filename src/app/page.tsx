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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';


async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${baseUrl} /api/products`, {
    next: { revalidate: 60 },
  })
  return res.json()
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
      <main className="min-h-screen">
        <section className='relative max-w-[1600px] mx-auto'>
          <FeaturedHero />
        </section>

        <section >
          <ProductBlockGrid />
        </section>

        {/* Hero Section */}
        {/* <section className="relative max-w-[1600px] mx-auto">
          <TorchHero />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 pointer-events-none" />
        </section> */}

        {/* Featured Categories */}
        <section className="max-w-[1600px] mx-auto px-6 py-16 space-y-16">
          <GradientHeading>Featured Categories</GradientHeading>
          
          {/* Category Sections */}
          {Object.entries(categories).map(([category, categoryProducts]) => (
            <div key={category} className="space-y-6">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-200 capitalize">{category}</h2>
              <Carousel products={categoryProducts} />
            </div>
          ))}
        </section>

        {/* All Products with Filter */}
        <section className="max-w-[1600px] mx-auto px-6 py-16">
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
