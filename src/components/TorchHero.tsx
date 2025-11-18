'use client'

import { useEffect, useRef, useState } from 'react'
import HeroCarousel from './ui/HeroCarousel'

export default function TorchHero() {
  const [, setBgImage] = useState('/pic1.avif')
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const section = document.getElementById('torch-section')
    const overlay = document.getElementById('torch-overlay')

    if (!section || !overlay) return

    // initialize styles for smoothness
    overlay.style.transition = 'opacity 450ms ease, background 200ms linear'
    overlay.style.opacity = '0'
    overlay.style.pointerEvents = 'none'
    overlay.style.mixBlendMode = 'screen'

    let lastX = -9999
    let lastY = -9999

    const getClient = (e: MouseEvent | TouchEvent) => {
      if ((e as TouchEvent).touches && (e as TouchEvent).touches.length) {
        const t = (e as TouchEvent).touches[0]
        return { clientX: t.clientX, clientY: t.clientY }
      }
      return (e as MouseEvent)
    }

    const updateOverlay = (x: number, y: number) => {
      const rect = section.getBoundingClientRect()
      const localX = Math.max(0, Math.min(rect.width, x - rect.left))
      const localY = Math.max(0, Math.min(rect.height, y - rect.top))

      // radius scales with section size (bigger on desktop)
      const base = Math.max(140, Math.min(320, Math.round(rect.width * 0.28)))
      const rInner = Math.round(base)
      const rOuter = Math.round(base * 2.2)

      // layered gradients: strong white core + colored soft glow
      overlay.style.background = `
        radial-gradient(circle ${rInner}px at ${localX}px ${localY}px, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.08) 45%, transparent 60%),
        radial-gradient(circle ${rOuter}px at ${localX}px ${localY}px, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.06) 25%, transparent 70%)
      `
      overlay.style.opacity = '1'
    }

    const handlePointer = (e: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = getClient(e)
      // avoid too many DOM writes
      if (Math.abs(clientX - lastX) < 2 && Math.abs(clientY - lastY) < 2) return
      lastX = clientX
      lastY = clientY

      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => updateOverlay(clientX, clientY))
    }

    const handleLeave = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      overlay.style.opacity = '0'
      // subtle fallback background to avoid abrupt clear
      overlay.style.background = 'none'
    }

    // mouse
    section.addEventListener('mousemove', handlePointer)
    section.addEventListener('mouseleave', handleLeave)

    // touch support for mobile
    section.addEventListener('touchstart', handlePointer, { passive: true })
    section.addEventListener('touchmove', handlePointer, { passive: true })
    section.addEventListener('touchend', handleLeave)

    return () => {
      section.removeEventListener('mousemove', handlePointer)
      section.removeEventListener('mouseleave', handleLeave)
      section.removeEventListener('touchstart', handlePointer)
      section.removeEventListener('touchmove', handlePointer)
      section.removeEventListener('touchend', handleLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section
      className="flex flex-col justify-between relative bg-gradient-to-br from-sky-500/60 via-indigo-900/50 to-gray-500/50 text-white rounded-xl p-10 mb-10 shadow-lg overflow-hidden min-h-[520px]"
      id="torch-section"
    >
      
      <HeroCarousel
        images={["/pic1.avif", "/cartoonlandscape.avif", "/animebg.jpg"]}
        className="rounded-xl absolute inset-0 z-0 opacity-65 blur-sm transform-gpu transition-opacity duration-800"
        onSlideChange={(img) => setBgImage(img)}
      />

      {/* overlay: uses mixBlendMode to brighten, pointer-events none so it doesn't block interactions */}
      <div
        id="torch-overlay"
        className="pointer-events-none absolute inset-0 z-10"
        style={{ mixBlendMode: 'screen' }}
      />

      <div className="relative z-30 space-y-4">
        <h1 className="text-4xl font-extrabold">Welcome to TechNitro</h1>
        <p className="text-lg max-w-2xl">
          Discover the latest in tablets, laptops, mobiles, and accessories — curated for performance and value.
        </p>

        {/* Tagline */}
        <p className="italic text-white/80 text-md mt-2">
          “Tech that inspires. Prices that empower.”
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 text-sm text-white/90">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <h3 className="font-semibold mb-1">🚀 Performance</h3>
            <p>Top-tier processors and blazing-fast SSDs.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <h3 className="font-semibold mb-1">💸 Value</h3>
            <p>Curated picks that balance price and power.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <h3 className="font-semibold mb-1">🎨 Design</h3>
            <p>Modern aesthetics with premium build quality.</p>
          </div>
        </div>

        {/* CTA Badge */}
        <div className="mt-6 flex justify-center">
          <span className="bg-indigo-600 text-white px-4 py-3 rounded-full text-sm shadow-md">
            🔥 New arrivals dropping weekly
          </span>
        </div>
      </div>

      <div className="flex flex-col mt-5 relative z-20">
        <div className="mt-6">
          <a
            href="products"
            className="inline-block bg-gray-800 text-indigo-200 hover:text-indigo-700 font-semibold px-6 py-3 hover:px-10 rounded hover:bg-indigo-100 transition-all duration-300"
          >
            Browse Products
          </a>
        </div>
      </div>
    </section>
  )
}
