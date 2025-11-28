'use client'

import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'



// const features = [
//   'New 50mm Drivers',
//   '70hrs Battery Backup',
//   'Best Ear fittings',
//   'High-Res Audio by Dolby Atmos',
// ]

const slides = [
  {
    name: 'NitroSound Pro',
    features: [
      'New 50mm Drivers',
      '70hrs Battery Backup',
      'Best Ear fittings',
      'High-Res Audio by Dolby Atmos',
    ],
    image: '/headphonepng.png',
    link: '/products',
    discount: 22,
  },
  {
    name: 'RazorBass X',
    features: [
      'Deep Bass Boost',
      'RGB Lighting',
      'Noise Isolation',
      'USB-C Fast Charge',
    ],
    image: '/razorheadphone.png',
    link: '/products',
    discount: 25,
  },
  {
    name: 'SonySoundAudio100',
    features: [
      '40mm driver',
      'Soft Cushions',
      'Bluetooth 5.3',
      '40hr Battery Life',
    ],
    image: '/sonyheadphone.png',
    link: '/products',
    discount: 20,
  },
]


const images = ['/headphonepng.png', '/razorheadphone.png', '/sonyheadphone.png']

export default function FeaturedHero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const current = slides[currentSlide]


  const router = useRouter();
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const section = document.getElementById('torch-section1')
    const overlay = document.getElementById('torch-overlay1')

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="torch-section1" className="relative bg-gradient-to-b from-black/40 via-purple-900 to-indigo-100/20 text-black rounded sm:rounded-xl p-3 pt-15 sm:p-10 mb-5 sm:mb-10 shadow-lg overflow-hidden min-h-[520px] flex flex-col sm:flex-row justify-around gap-5 items-center" key={currentSlide}>
      
      <div
        id="torch-overlay1"
        className="pointer-events-none absolute inset-0 z-10"
        style={{ mixBlendMode: 'screen' }}
      />
      
      
      <div className="relative z-30 space-y-4">        
        <h1 className="text-xl sm:text-3xl md:text-4xl bg-clip-text text-transparent bg-gradient-to-br from-pink-500 via-blue-300 to-green-400 text-center font-extrabold">Welcome to TechNitro</h1>
        

        {/* Tagline */}
        <p className="italic text-white/80 text-xs sm:text-md mt-2">
          “Tech that inspires. Prices that empower.”
        </p>

        {/* Feature Highlights */}
        <div className="sm:grid grid-cols-1 sm:grid-cols-1 gap-4 mt-6 text-sm text-white/90 hidden">
          <div className="bg-white/10 p-1 sm:p-2 rounded-lg backdrop-blur-sm">
            <h3 className="font-semibold mb-1">🚀 Performance</h3>
            <p>Top-tier processors and blazing-fast SSDs.</p>
          </div>
          <div className="bg-white/10 p-1 sm:p-2 rounded-lg backdrop-blur-sm">
            <h3 className="font-semibold mb-1">💸 Value</h3>
            <p>Curated picks that balance price and power.</p>
          </div>
          <div className="bg-white/10 p-1 sm:p-2 rounded-lg backdrop-blur-sm">
            <h3 className="font-semibold mb-1">🎨 Design</h3>
            <p>Modern aesthetics with premium build quality.</p>
          </div>
        </div>

        

      </div>
      <div className='flex flex-col sm:flex-row gap-2 items-center'>
        {/* Left: Product Highlights */}
        <div className="z-20 max-w-xl text-center space-y-4" >
          <h1 className=" text-xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-red-300 font-extrabold animate-slide-in">{current.name}</h1>
          <ul className="space-y-1 text-gray-300  text-lg">
            {current.features.map((f, i) => (
              <li key={i} className="text-sm sm:text-lg border border-b-red-600/50 border-red-50/10 rounded-sm  animate-slide-up">
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-2 sm:mt-4 text-yellow-400 font-semibold text-md sm:text-xl animate-zoom-in">{current.discount}% Discount — Limited Time!</div>
          <button
          onClick={() => router.push(current.link)}
          className='inline-block mt-1 sm:mt-4 bg-yellow-400 text-gray-900 text-md sm:text-xl font-semibold px-3 sm:px-6 py-1 sm:py-3 rounded-full hover:bg-yellow-300 transition animate-zoom-in'
          >
              Buy Now
          </button>
          
        </div>

        {/* Right: Product Image */}
        <div className="z-10 w-[300px] sm:w-[400px] h-[200px] sm:h-[400px] animate-image-slide">
          <Image
            src={current.image}
            alt="Headphone"
            height={400}
            width={400}
            className="object-contain h-[200px] sm:h-[400px] transition-opacity duration-700 ease-in-out"
          />
        </div>
      </div>

      {/* Bottom: Bullet Navigation */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-2 h-2  transition ${
              currentSlide === i ? 'rounded-lg w-8 bg-white' : 'rounded-full bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
