'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'

type HeroCarouselProps = {
  images: string[]
  className?: string
  onSlideChange?: (img: string) => void
}

export default function HeroCarousel({ images = [], className = '', onSlideChange } : HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!images.length) return

    if (onSlideChange) {
      onSlideChange(images[current])
    }

    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [current, images, onSlideChange])

  if (!images.length) return null

  return (
    <div className={clsx('relative w-full h-full', className)}>
      {images.map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={`Slide ${index + 1}`}
          fill
          className={clsx(
            'object-cover transition-opacity duration-1000 ease-in-out',
            index === current ? 'opacity-100' : 'opacity-0'
          )}
          priority={index === 0}
        />
      ))}
    </div>
  )
}
