'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Menu, X, User as UserIcon, Settings, LogOut, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { FaCartShopping } from "react-icons/fa6"
import { User } from '@supabase/supabase-js'
import { FaHome } from "react-icons/fa"
import { AiFillProduct } from "react-icons/ai"
import { RiDashboardFill } from "react-icons/ri"
import { MdOutlineRecommend } from "react-icons/md"
import { FaJediOrder } from "react-icons/fa"
import { IoMdCart } from "react-icons/io"
import SearchBar from './SearchBar'
import CartPreview from './CartPreview'
import NotificationsDropdown from './NotificationsDropdown'
import { useCart } from '@/context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const supabase = createClientComponentClient()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCartPreview, setShowCartPreview] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { itemCount } = useCart()

  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email?.includes('admin')

  useEffect(() => {
    let mounted = true

      ; (async () => {
        try {
          const { data } = await supabase.auth.getUser()
          if (!mounted) return
          setUser(data?.user ?? null)
        } catch (err) {
          console.error('Navbar: failed to get user', err)
          if (mounted) setUser(null)
        }
      })()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
    })

    const subscription = (listener as unknown as { subscription?: { unsubscribe?: () => void } })?.subscription

    return () => {
      mounted = false
      if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Sticky navbar shrink on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setShowDropdown(false)
        setShowCartPreview(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const currentY = e.touches[0].clientY
      if (touchStartY - currentY > 80) {
        setIsOpen(false)
        setTouchStartY(null)
      }
    }
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: <FaHome className="text-2xl" />, show: true },
    { href: '/products', label: 'Products', icon: <AiFillProduct className="text-2xl" />, show: true },
    { href: '/dashboard', label: 'Dashboard', icon: <RiDashboardFill className="text-2xl" />, show: isAdmin },
    { href: '/recommendations', label: 'For You', icon: <MdOutlineRecommend className="text-2xl" />, show: true },
    { href: '/my-orders', label: 'My Orders', icon: <FaJediOrder className="text-2xl" />, show: true },
  ].filter(link => link.show)

  return (
    <header
      className={`bg-gradient-to-br from-white via-white to-indigo-200 shadow-lg sticky top-0 z-50 mb-0 md:mb-10 transition-all duration-300 ${isScrolled ? 'shadow-xl' : ''
        }`}
    >
      <div className={`max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-12 sm:h-14' : 'h-12 sm:h-16'
        }`}>
        {/* Logo */}
        <Link
          href="/"
          className="group relative"
          aria-label="TechNitro Home"
        >
          <Image
            src="/LogoTechNitroFlat.png"
            alt="TechNitro Logo"
            width={80}
            height={40}
            className={`transition-all duration-300 group-hover:scale-105 ${isScrolled ? 'h-8 w-16' : 'h-10 w-20'
              }`}
          />
          <span className="absolute -bottom-4 left-0 text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Premium Tech Store
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-1 items-center justify-center px-8">
          <SearchBar />
        </div>

        <nav className="hidden md:flex space-x-2 text-gray-200 font-medium items-center">
          {navLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center group p-3 bg-gradient-to-tr from-gray-700 to-black/50 rounded-full shadow shadow-black hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
              aria-label={label}
            >
              {icon}
              <span className="absolute -bottom-8 text-center text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap px-2 py-1 bg-gray-900 rounded">
                {label}
              </span>
            </Link>
          ))}

          {/* Notifications */}
          <NotificationsDropdown />

          {/* Cart with Preview and Badge */}
          <div
            className="relative group"
            onMouseEnter={() => setShowCartPreview(true)}
            onMouseLeave={() => setShowCartPreview(false)}
          >
            <Link
              href="/cart"
              className="relative flex flex-col items-center p-3 bg-gradient-to-tr from-gray-700 to-black/50 rounded-full shadow shadow-black hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <FaCartShopping className="text-2xl" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
              <span className="absolute -bottom-8 text-center text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap px-2 py-1 bg-gray-900 rounded flex items-center gap-1">
                Cart
                <ShieldCheck size={12} className="text-green-400" />
              </span>
            </Link>
            {showCartPreview && <CartPreview />}
          </div>

          {user ? (
            <div className="relative" data-dropdown>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-full hover:bg-gray-700 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                aria-label="User menu"
                aria-expanded={showDropdown}
              >
                <Image
                  src={user.user_metadata?.avatar_url || '/Avatarpic.png'}
                  width={32}
                  height={32}
                  alt="User avatar"
                  className="w-7 h-7 rounded-full"
                />
                <span className="text-sm text-white max-w-[80px] truncate">
                  {user.user_metadata?.name?.split(' ')[0] || 'User'}
                </span>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-800 bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="flex items-center gap-3">
                        <Image
                          src={user.user_metadata?.avatar_url || '/Avatarpic.png'}
                          width={48}
                          height={48}
                          alt="User avatar"
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {user.user_metadata?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <UserIcon size={16} />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-800">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            (user === undefined) ? (
              <div className="w-[110px] h-10 rounded-full bg-indigo-900/30 animate-pulse" />
            ) : (
              <a
                href="/login"
                className="flex items-center justify-center text-lg w-[110px] bg-indigo-900 px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors"
                aria-label="Login"
              >
                Login
              </a>
            )
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-400 p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-64 bg-gray-900/95 backdrop-blur-lg shadow-2xl md:hidden z-50"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-2"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col px-4 pb-4 space-y-2">
              {navLinks.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-purple-900/50 hover:bg-purple-800/50 rounded-lg transition-colors text-white"
                >
                  {icon}
                  <span>{label}</span>
                </Link>
              ))}

              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-purple-900/50 hover:bg-purple-800/50 rounded-lg transition-colors text-white"
              >
                <IoMdCart className="text-2xl" />
                <span>Cart</span>
                {itemCount > 0 && (
                  <span className="ml-auto bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <Image
                      src={user.user_metadata?.avatar_url || '/Avatarpic.png'}
                      width={40}
                      height={40}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm">
                        {user.user_metadata?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <UserIcon size={16} />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                (user === undefined) ? (
                  <div className="w-full h-10 rounded-lg bg-indigo-900/30 animate-pulse" />
                ) : (
                  <a
                    href="/login"
                    className="flex items-center justify-center text-lg w-full bg-indigo-900 px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Login
                  </a>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </header>
  )
}
