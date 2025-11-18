//src/app/products/[slug]/page.tsx
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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${baseUrl}/api/products`, {
    next: { revalidate: 60 },
  })
  return res.json()
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
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
      <div className='flex gap-5'>
        <div className="grid gap-10 items-start justify-between mt-6 grid-cols-1 2xl:grid-cols-2">
          {/* Image Section */}
          <div className=''>
          <div className=" relative w-full lg:w-[600px] xl:w-[600px] rounded-xl overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <ProductGallery images={product.images}/>  
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
          <div className=" space-y-6">
            <h1 className="text-4xl font-bold text-white">{product.name}</h1>
            <p className="text-sm uppercase tracking-wide text-indigo-400">{product.category}</p>
            <Ratings rating={product.rating ?? 6} />
            <Highlights product={product} />

            <div className="pt-2 space-y-1">
              <p className="text-4xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">₹{product.price.toLocaleString('en-IN')}</p>
              <p className="text-sm text-gray-400">Stock: {product.inventory}</p>
            </div>

            <Description text={product.description} />
            <DeliveryInfo />

            <div className="mt-4 md:hidden">
              <ProductActions product={product} />
            </div>
          </div>
          </div>
            <div className='col-span-1 mt-5'>
          {/* Sticky buy panel */}
          <StickyBuyPanel product={product} />
          </div>
        
        
      </div>
      </main>
    </>
  )
}

export const dynamic = 'force-dynamic'

