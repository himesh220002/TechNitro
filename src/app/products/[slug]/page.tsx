import Image from 'next/image'
import { Product } from '@/types/product'
import Navbar from '@/components/Navbar'
import ProductActions from '@/components/ProductActions'
import StickyBuyPanel from '@/components/StickyBuyPanel'
import Ratings from '@/components/Ratings'
import DeliveryInfo from '@/components/DeliveryInfo'
import OfferBadge from '@/components/OfferBadge'
import Highlights from '@/components/Highlights'
import Description from '@/components/Description'
import ProductGallery from '@/components/ProductGallery'
import Reviews from '@/components/Reviews'
import RelatedProducts from '@/components/RelatedProducts'
import FAQ from '@/components/FAQ'
import { baseUrl } from '@/lib/baseUrl'
import Link from 'next/link'
import { Metadata } from 'next'
import { Suspense } from 'react'

// const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
// const baseUrl = 'http://localhost:3000';
// const baseUrl = '';

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${baseUrl}/api/products`, {
    cache: "force-cache",   // ✅ cache results for ISR
    next: { revalidate: 60 } // ✅ revalidate every 60s
  })
  return res.json()
}

// ... existing imports

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params
  const products = await getProducts()
  const product = products.find((p) => p.slug === slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} | TechNitro`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: [product.imageUrl || ''],
    },
  }
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = await params

  const products = await getProducts()
  const product = products.find((p) => p.slug === slug)

  if (!product) {
    return <div className="p-6 text-red-500">Product not found</div>
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen p-6 max-w-[1600px] mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-white transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-purple-400 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className='flex gap-0 sm:gap-5'>
          <div className="grid gap-10 items-start justify-between mt-6 grid-cols-1 2xl:grid-cols-2">
            {/* Image Section */}
            <div className=''>
              <div className=" relative w-full lg:w-[600px] xl:w-[600px] rounded-xl overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Suspense fallback={<div className="w-full h-[400px] bg-gray-800 animate-pulse rounded-xl" />}>
                    <ProductGallery images={product.images} />
                  </Suspense>
                ) : product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover "
                    sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
                <OfferBadge />
              </div>
              <div>

              </div>
            </div>

            {/* Details Section */}
            <div className=" space-y-2 sm:space-y-6">
              <h1 className=" text-xl sm:text-4xl font-bold font-display text-white">{product.name}</h1>
              <p className="text-sm uppercase tracking-wide text-indigo-400 font-sans">{product.category}</p>
              <Ratings rating={product.rating ?? 3.0} />
              <Highlights product={product} />
              <div className='flex justify-between'>
                <div className="pt-2 space-y-1">

                  <p className="text-xl sm:text-4xl font-extrabold font-display bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">₹{product.price.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-400 font-sans">EMI starts at ₹{Math.round(product.price / 12).toLocaleString('en-IN')}/mo</p>
                  <div className="flex items-center gap-2 mt-2 font-sans">
                    <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded border border-red-500/20 animate-pulse">
                      Only {product.inventory} left!
                    </span>
                    <span className="text-xs text-gray-500">Order in 2h 15m for delivery tomorrow</span>
                  </div>
                </div>
                <div className="mt-4 md:hidden">
                  <ProductActions product={product} />
                </div>
              </div>
              <Description text={product.description} />
              <DeliveryInfo />
              <Reviews rating={product.rating ?? 4.5} />
              <FAQ />
            </div>
          </div>
          <div className='col-span-1 mt-5'>
            {/* Sticky buy panel */}
            <StickyBuyPanel product={product} />
          </div>


        </div>

        <RelatedProducts
          products={products.filter(p => p.category === product.category)}
          currentProductId={product.id}
        />
      </main>
    </>
  )
}

// export const dynamic = 'force-dynamic'
// ✅ ISR enabled
export const revalidate = 60

