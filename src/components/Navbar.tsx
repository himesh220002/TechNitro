'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Menu, X, User as UserIcon, Settings, LogOut } from 'lucide-react'
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
import { createPortal } from 'react-dom'

export default function Navbar() {
  const supabase = createClientComponentClient()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCartPreview, setShowCartPreview] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { itemCount } = useCart()



  // Check if user is admin based on role in user metadata
  const isAdmin = user?.user_metadata?.role === 'admin'

  const [avatarUrl, setAvatarUrl] = useState<string>('/Avatarpic.png')

  useEffect(() => {
    let mounted = true

      ; (async () => {
        try {
          const { data } = await supabase.auth.getUser()
          if (!mounted) return
          setUser(data?.user ?? null)

          // Initialize avatar from user metadata (priority) or localStorage
          const savedAvatar = localStorage.getItem('userAvatar')
          setAvatarUrl(data?.user?.user_metadata?.avatar_url || savedAvatar || '/Avatarpic.png')
        } catch (err) {
          console.error('Navbar: failed to get user', err)
          if (mounted) setUser(null)
        }
      })()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      // Update avatar on auth change
      const savedAvatar = localStorage.getItem('userAvatar')
      setAvatarUrl(session?.user?.user_metadata?.avatar_url || savedAvatar || '/Avatarpic.png')
    })

    // Listen for custom avatar update event
    const handleAvatarUpdate = (e: CustomEvent) => {
      if (e.detail?.url) {
        setAvatarUrl(e.detail.url)
      }
    }
    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener)

    const subscription = (listener as unknown as { subscription?: { unsubscribe?: () => void } })?.subscription

    return () => {
      mounted = false
      if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe()
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener)
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



  const navLinks = [
    { href: '/', label: 'Home', icon: <FaHome className="text-2xl" />, show: true },
    { href: '/products', label: 'Products', icon: <AiFillProduct className="text-2xl" />, show: true },
    { href: '/admin/dashboard', label: 'Dashboard', icon: <RiDashboardFill className="text-2xl" />, show: isAdmin },
    { href: '/recommendations', label: 'For You', icon: <MdOutlineRecommend className="text-2xl" />, show: true },
    { href: '/my-orders', label: 'My Orders', icon: <FaJediOrder className="text-2xl" />, show: true },
  ].filter(link => link.show)

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${isScrolled
        ? 'bg-gray-900/80 backdrop-blur-md border-gray-800 shadow-xl'
        : 'bg-gray-800/80 border-gray-600/50'
        }`}
    >
      <div className={`max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-12 sm:h-16' : 'h-16 sm:h-20'
        }`}>
        {/* Logo */}
        <Link
          href="/"
          className="group relative flex items-center gap-3"
          aria-label="TechNitro Home"
        >
          <div className="bg-white rounded-lg p-1.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
            <Image
              src="/LogoTechNitroFlat.png"
              alt="TechNitro Logo"
              width={80}
              height={40}
              className={`transition-all duration-300 object-contain ${isScrolled ? 'h-8 w-16' : 'h-10 w-20'
                }`}
            />
          </div>
          {/* <span className={`font-bold text-xl tracking-tight transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
            <span className="text-white">Tech</span><span className="text-purple-500">Nitro</span>
          </span> */}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-1 items-center justify-center px-8 max-w-2xl mx-auto">
          <SearchBar />
        </div>

        <nav className="hidden md:flex space-x-2 text-gray-200 font-medium items-center">
          {navLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center group p-3 hover:bg-white/5 rounded-xl transition-all duration-300"
              aria-label={label}
            >
              <div className="text-gray-400 group-hover:text-purple-400 transition-colors duration-300">
                {icon}
              </div>
              <span className="absolute -bottom-10 text-center text-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 px-3 py-1 bg-gray-900 border border-gray-800 rounded-lg shadow-xl whitespace-nowrap z-50">
                {label}
              </span>
            </Link>
          ))}

          <div className="w-px h-8 bg-gray-800 mx-2" />

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
              className="relative flex flex-col items-center p-3 hover:bg-white/5 rounded-xl transition-all duration-300"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <div className="text-gray-400 group-hover:text-purple-400 transition-colors duration-300">
                <FaCartShopping className="text-2xl" />
              </div>
              {itemCount > 0 && (
                <span className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-gray-900">
                  {itemCount}
                </span>
              )}
            </Link>
            {showCartPreview && <CartPreview />}
          </div>

          {user ? (
            <div className="relative ml-2" data-dropdown>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/50 pl-2 pr-4 py-1.5 rounded-full hover:bg-gray-800 hover:border-purple-500/30 cursor-pointer transition-all duration-300 group"
                aria-label="User menu"
                aria-expanded={showDropdown}
              >
                <div className="relative">
                  <Image
                    src={avatarUrl}
                    width={32}
                    height={32}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white max-w-[80px] truncate transition-colors">
                  {user.user_metadata?.name?.split(' ')[0] || 'User'}
                </span>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-4 w-72 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-white/10"
                  >
                    {/* User Info */}
                    <div className="p-5 border-b border-gray-800 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                      <div className="flex items-center gap-4">
                        <Image
                          src={avatarUrl}
                          width={48}
                          height={48}
                          alt="User avatar"
                          className="w-12 h-12 rounded-full ring-2 ring-purple-500/20"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">
                            {user.user_metadata?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all"
                        onClick={() => setShowDropdown(false)}
                      >
                        <UserIcon size={18} className="text-purple-400" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings size={18} className="text-blue-400" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-gray-800">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="ml-4">
              {user === undefined ? (
                <div className="w-24 h-10 rounded-full bg-gray-800 animate-pulse" />
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu (rendered in a portal so fixed positioning is viewport-relative) */}
      {typeof window !== 'undefined' && createPortal(
        <>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 shadow-2xl md:hidden z-50 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                  <span className="text-lg font-bold text-white">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* User Section (Mobile) */}
                  {user ? (
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-gray-800">
                      <Image
                        src={avatarUrl}
                        width={48}
                        height={48}
                        alt="User avatar"
                        className="w-12 h-12 rounded-full ring-2 ring-purple-500/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {user.user_metadata?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center w-full py-4 text-sm font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/20"
                    >
                      Login / Sign Up
                    </Link>
                  )}

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Navigation</p>
                    {navLinks.map(({ href, label, icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 px-4 py-3.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                      >
                        <div className="text-gray-400 group-hover:text-purple-400 transition-colors">
                          {icon}
                        </div>
                        <span className="font-medium">{label}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Cart Link */}
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 px-4 py-3.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                  >
                    <div className="relative text-gray-400 group-hover:text-purple-400 transition-colors">
                      <IoMdCart className="text-2xl" />
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-gray-900">
                          {itemCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">Shopping Cart</span>
                  </Link>

                  {/* Account Links */}
                  {user && (
                    <div className="space-y-2 pt-6 border-t border-gray-800">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Account</p>
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <UserIcon size={20} />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <Settings size={20} />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-2"
                      >
                        <LogOut size={20} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Menu Backdrop */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
        </>,
        document.body
      )}
    </header >
  )
}
