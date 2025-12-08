'use client'

import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Timer } from 'lucide-react'


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
    endsIn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
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
    endsIn: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours
  },
  {
    name: 'SonySoundAudio 100',
    features: [
      '40mm driver',
      'Soft Cushions',
      'Bluetooth 5.3',
      '40hr Battery Life',
    ],
    image: '/sonyheadphone.png',
    link: '/products',
    discount: 20,
    endsIn: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours
  },
]


const images = ['/headphonepng.png', '/razorheadphone.png', '/sonyheadphone.png']

export default function FeaturedHero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const current = slides[currentSlide]
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })


  const router = useRouter();
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +current.endsIn - +new Date()
      let timeLeft = { hours: 0, minutes: 0, seconds: 0 }

      if (difference > 0) {
        timeLeft = {
          hours: Math.floor((difference / (1000 * 60 * 60))),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }
      return timeLeft
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [current])

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
    <section id="torch-section1" className="relative bg-black rounded-3xl p-6 sm:p-12 mb-10 shadow-2xl overflow-hidden min-h-[600px] flex flex-col lg:flex-row justify-between items-center gap-10 border border-white/10 group" key={currentSlide}>

      {/* Animated Background */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/40 via-black to-indigo-900/40 z-0" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px] animate-pulse delay-1000" />

      <div
        id="torch-overlay1"
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Left Content */}
      <div className="relative z-20 flex-1 space-y-8 text-center lg:text-left max-w-3xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit mx-auto lg:mx-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">New Arrival</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-tight">
            <span className="block drop-shadow-lg">
              {current.name.split(' ')[0]}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {current.name.split(' ').slice(1).join(' ')}
              </span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 font-light max-w-lg mx-auto lg:mx-0">
            Experience sound like never before. <span className="text-white font-medium">Tech that inspires.</span>
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
          {current.features.map((f, i) => (
            <span key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
              {f}
            </span>
          ))}
        </div>

        {/* CTA & Timer */}
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
          <button
            onClick={() => router.push(current.link)}
            className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
              Buy Now <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>

          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Offer Ends In</div>
              <div className="flex gap-1 text-white font-mono font-bold text-lg">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-gray-500">:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-gray-500">:</span>
                <span className="text-yellow-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Discount</div>
              <div className="text-lg font-bold text-green-400">-{current.discount}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image */}
      <div className="relative z-20 flex-1 flex justify-center items-center w-full max-w-lg">
        <div className="relative w-full aspect-square">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <Image
            src={current.image}
            alt={current.name}
            fill
            className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-image-slide z-10"
            priority
          />

          {/* Floating Badge */}
          <div className="absolute top-10 right-10 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="text-xs text-gray-300 uppercase font-bold">Rating</div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-white">4.9</span>
              <span className="text-yellow-400">★</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
          />
        ))}
      </div>
    </section>
  )
}
