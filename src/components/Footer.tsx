'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaLinkedinIn } from 'react-icons/fa'
import { ArrowUp, Mail, Check, AlertCircle, ArrowRight, MapPin } from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [agreed, setAgreed] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !agreed) return

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setStatus('error')
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0f0f0f] text-gray-300 border-t border-gray-800 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">

        {/* Centered Brand Section */}
        <div className="flex flex-col items-center text-center mb-16 space-y-6">
          <Link href="/" className="inline-block group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src="/logoTechNitro.png"
                alt="TechNitro Logo"
                width={200}
                height={70}
                className="relative z-10 w-38"
              />
            </motion.div>
          </Link>
          <p className="text-gray-400 max-w-lg text-lg leading-relaxed">
            Elevating your digital lifestyle with premium tech gear. <br className="hidden md:block" />
            Join the revolution of sound and style.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-start">
          {/* Newsletter Section (Left) */}
          <div className="lg:col-span-5">
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 backdrop-blur-sm h-full flex flex-col justify-center">
              <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                <Mail size={20} className="text-purple-400" />
                Stay in the loop
              </h3>
              <p className="text-gray-400 mb-6">Get exclusive offers and the latest tech news delivered to your inbox.</p>

              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={status === 'loading' || status === 'success'}
                    className={`w-full bg-gray-800 text-white px-5 py-4 rounded-xl border focus:outline-none focus:ring-2 transition-all ${status === 'error'
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
                      } disabled:opacity-50`}
                  />
                  <AnimatePresence>
                    {status === 'success' && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400"
                      >
                        <Check size={20} />
                      </motion.div>
                    )}
                    {status === 'error' && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400"
                      >
                        <AlertCircle size={20} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border border-gray-600 rounded bg-gray-800 checked:bg-purple-600 checked:border-purple-600 transition-colors"
                    />
                    <Check size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    I agree to receive marketing emails. Unsubscribe anytime.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!agreed || status === 'loading' || status === 'success'}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 text-lg"
                >
                  {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : status === 'success' ? (
                    'Subscribed Successfully!'
                  ) : (
                    <>
                      Subscribe Now <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Navigation Columns (Right) */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 lg:pl-12 pt-4">
            <FooterColumn
              title="Products"
              links={[
                { label: 'Headphones', href: '/products?category=headphones' },
                { label: 'Speakers', href: '/products?category=speakers' },
                { label: 'Earbuds', href: '/products?category=earbuds' },
                { label: 'Accessories', href: '/products?category=accessories' },
                { label: 'New Arrivals', href: '/products?sort=newest', badge: 'New' },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: 'About Us', href: '/about' },
                { label: 'Careers', href: '/careers' },
                { label: 'Blog', href: '/blog' },
                { label: 'Press', href: '/press' },
                { label: 'Partners', href: '/partners' },
              ]}
            />
            <FooterColumn
              title="Support"
              links={[
                { label: 'Help Center', href: '/support' },
                { label: 'Track Order', href: '/track-order' },
                { label: 'Returns', href: '/returns' },
                { label: 'Warranty', href: '/warranty' },
                { label: 'Contact Us', href: '/contact' },
              ]}
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-gray-500">
            <p>© {currentYear} TechNitro. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <SocialIcon icon={FaFacebookF} href="https://facebook.com" label="Facebook" color="#1877F2" />
              <SocialIcon icon={FaTwitter} href="https://twitter.com" label="Twitter" color="#1DA1F2" />
              <SocialIcon icon={FaInstagram} href="https://instagram.com" label="Instagram" color="#E4405F" />
              <SocialIcon icon={FaYoutube} href="https://youtube.com" label="YouTube" color="#FF0000" />
              <SocialIcon icon={FaLinkedinIn} href="https://linkedin.com" label="LinkedIn" color="#0A66C2" />
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors group"
              aria-label="Back to top"
            >
              <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Location Indicator */}
        <div className="mt-8 flex justify-center md:justify-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-400">
            <MapPin size={12} className="text-purple-500" />
            <span>India (English)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string, links: { label: string, href: string, badge?: string }[] }) {
  return (
    <div className="space-y-6">
      <h4 className="text-white font-bold text-lg">{title}</h4>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <span className="relative">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-purple-500 transition-all group-hover:w-full" />
              </span>
              {link.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {link.badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcon({ icon: Icon, href, label, color }: { icon: any, href: string, label: string, color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative p-2 bg-gray-800 rounded-full transition-colors hover:bg-white"
      aria-label={label}
    >
      <Icon className="text-gray-400 transition-colors group-hover:text-[var(--hover-color)]" style={{ '--hover-color': color } as any} size={18} />

      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700">
        {label}
        <span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 transform rotate-45" />
      </span>
    </a>
  )
}
