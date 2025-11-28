'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { FaCartShopping } from "react-icons/fa6";
import { User } from '@supabase/supabase-js'
import { FaHome} from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { RiDashboardFill } from "react-icons/ri";
import { MdOutlineRecommend } from "react-icons/md";
import { FaJediOrder } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";

export default function Navbar() {
  const supabase = createClientComponentClient()
  const [isOpen, setIsOpen] = useState(false)
  // user === undefined -> still loading/hydrating; null -> no user; User -> signed in
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true

    ;(async () => {
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
        // dragged up > 80px
        setIsOpen(false)
        setTouchStartY(null)
      }
    }
  }

  return (
    <header className="bg-gradient-to-br from-white via-white to-indigo-200 shadow-lg sticky top-0 z-50 mb-0 md:mb-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12 sm:h-16">
        {/* Logo */}
        <Link href="/" 
            className="">
            <Image src="/LogoTechNitroFlat.png" alt="TechNest Logo" width={80} height={40} className="h-10 w-20 "/>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-2 text-gray-200 font-medium">
          {[
            { href: '/', label: 'Home', icon: <FaHome className="text-2xl" /> },
            { href: '/products', label: 'Products', icon: <AiFillProduct className="text-2xl" /> },
            { href: '/dashboard', label: 'Dashboard', icon: <RiDashboardFill className="text-2xl" /> },
            { href: '/recommendations', label: 'Recommendations', icon: <MdOutlineRecommend className="text-2xl" /> },
            { href: '/my-orders', label: 'MyOrders', icon: <FaJediOrder className="text-2xl" /> },
            { href: '/cart', label: 'Cart', icon: <FaCartShopping className="text-2xl" /> },
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center group p-3 bg-gradient-to-tr from-gray-700 to-black/50 rounded-full shadow shadow-black hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
            >
              {icon}
              <span className="absolute -bottom-8 text-center text-sm text-gray-400 opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                {label}
              </span>
            </Link>
          ))}
          {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex items-center w-[110px] text-lg gap-2 bg-gray-800 px-3 py-3 rounded-full hover:bg-gray-700 cursor-pointer"
                >
                  <Image
                    src={user.user_metadata?.avatar_url || '/Avatarpic.png'}
                    width={80}
                    height={80}
                    alt="User"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">{(user.user_metadata?.name).slice(0, 6) || 'user'}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
                    <div className="px-4 py-2 text-sm text-gray-300">
                      {user.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                    >
                      ❌ Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // While we're still resolving the session, render an empty placeholder to avoid
              // briefly showing the "Login" button during hydration. After resolution, user
              // will be either null (show Login) or a User object.
              (user === undefined) ? (
                <div className="w-[110px] h-10 rounded-full bg-indigo-900/30" />
              ) : (
                <a href="/login" className="flex items-center justify-center text-lg w-[110px] bg-indigo-900 px-4 py-2 rounded-full hover:bg-indigo-700">
                  Login
                </a>
              )
            )}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-400"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
        className={`fixed inset-x-0 top-12 bg-gray-900/70 shadow-md transform transition-transform duration-500 ease-in-out md:hidden ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="  flex flex-col  items-end px-3 pb-4 space-y-2 p-2  ">
          <Link href="/" onClick={() => setIsOpen(false)} className="block text-center px-4 py-2 flex gap-2 items-center justify-center bg-purple-900 rounded-lg  animate-bounceInLeft">
            <FaHome className="text-2xl"/>
          </Link>
          <Link href="/products" onClick={() => setIsOpen(false)} className="block text-center px-4 py-2 flex gap-2 items-center justify-center bg-purple-900 rounded-lg  animate-bounceInLeft">
            <AiFillProduct className="text-2xl" />  Products
          </Link>
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block text-center px-4 py-2 flex gap-2 items-center justify-center bg-purple-900 rounded-lg  animate-bounceInLeft">
            <RiDashboardFill className="text-2xl"/>  Dashboard
          </Link>
          <Link href="/recommendations" onClick={() => setIsOpen(false)} className="block text-center px-4 py-2 flex gap-2 items-center justify-center bg-purple-900 rounded-lg  animate-bounceInLeft">
            <MdOutlineRecommend className="text-2xl" /> Recommendations
          </Link>
          <Link href="/my-orders" onClick={() => setIsOpen(false)} className="block text-center px-4 py-2 flex gap-2 items-center justify-center bg-purple-900 rounded-lg animate-bounceInLeft" >
            <FaJediOrder className="text-2xl" /> MY Orders
          </Link>
          <Link href="/cart" onClick={() => setIsOpen(false)} className="block text-center px-4 py-2 flex gap-2 items-center justify-center bg-purple-900 rounded-lg  animate-bounceInLeft">
            <IoMdCart className="text-2xl" />
          </Link>
          {user ? (
              <div className="relative flex justify-center items-center">
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex items-center w-[110px] text-lg gap-2 bg-gray-800 px-3 py-3 rounded-full hover:bg-gray-700 cursor-pointer"
                >
                  <Image
                    src={user.user_metadata?.avatar_url || '/Avatarpic.png'}
                    width={80}
                    height={80}
                    alt="User"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">{(user.user_metadata?.name).slice(0, 6) || 'user'}</span>
                </button>

                {showDropdown && (
                  <div className="absolute top-10 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
                    <div className="px-4 py-2 text-sm text-gray-300 bg-gray-700">
                      {user.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-center px-4 py-2 text-sm text-red-400 bg-gray-900"
                    >
                      ❌ Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // render an empty placeholder to avoid briefly showing the "Login" button during hydration. After resolution, user
              // will be either null (show Login) or a User object.
              (user === undefined) ? (
                <div className="w-[110px] h-10 rounded-full bg-indigo-900/30" />
              ) : (
                <a href="/login" className="flex items-center justify-center text-lg w-[110px] bg-indigo-900 px-4 py-2 rounded-full hover:bg-indigo-700">
                  Login
                </a>
              )
            )}
        </div>
        </div>
      )}
    </header>
  )
}
