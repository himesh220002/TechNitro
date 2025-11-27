//src/components/Carousel.tsx
'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Product } from '@/types/product'

type CarouselProps = {
  products: Product[]
  className?: string
}

export default function Carousel({ products, className = '' }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    containScroll: 'trimSnaps'
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }

    emblaApi.on('select', onSelect)
    onSelect()

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  if (!products?.length) {
    return null
  }

  return (
    <div className="relative group">
      <div className={`overflow-hidden ${className}`} ref={emblaRef}>
        <div className="flex gap-2 sm:gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="flex-none w-[160px] sm:w-[240px] md:w-[260px] lg:w-[280px]"
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              
            >
              <Link
                href={`/products/${product.slug}`}
                className={`block group rounded-xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg 
                         border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300`}
              >
                <div className="relative aspect-square">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover bg-white transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4">
                  <h3 className="text-xm sm:text-lg font-semibold text-gray-100 group-hover:text-purple-400 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-md sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                  {product.inventory > 0 ? (
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      In Stock
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Out of Stock
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {canScrollPrev && (
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className={`absolute -left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full 
                   opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all duration-300 backdrop-blur-sm
                   flex items-center justify-center`}
        >
          ←
        </button>
      )}
      {canScrollNext && (
        <button
          onClick={() => emblaApi?.scrollNext()}
          className={`absolute -right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full 
                   opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all duration-300 backdrop-blur-sm
                   flex items-center justify-center`}
        >
          →
        </button>
      )}
    </div>
  )
}
