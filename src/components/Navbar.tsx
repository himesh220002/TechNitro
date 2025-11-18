'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { FaCartShopping } from "react-icons/fa6";
import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const supabase = createClientComponentClient()
  const [isOpen, setIsOpen] = useState(false)
  // user === undefined -> still loading/hydrating; null -> no user; User -> signed in
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [showDropdown, setShowDropdown] = useState(false)

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

  return (
    <header className="bg-gradient-to-br from-white via-white to-indigo-200 shadow-lg sticky top-0 z-50 mb-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" 
            className="">
            <Image src="/LogoTechNitroFlat.png" alt="TechNest Logo" width={80} height={40} className="h-10 w-20"/>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-2 text-gray-200 font-medium">
          {[
            { href: '/', label: 'Home' },
            { href: '/products', label: 'Products' },
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/recommendations', label: 'Recommendations' },
            { href: '/my-orders', label: 'My Order' },
            { href: '/cart', label: <FaCartShopping className='text-2xl'/> },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-all duration-500  p-3 bg-gradient-to-tr from-gray-700 to-black/50 rounded-full hover:rounded-full  hover:pt-1 hover:pb-5 shadow shadow-black hover:shadow-lg hover:shadow-indigo-500/50"
            >
              {label}
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
        <div className="md:hidden bg-gray-700   px-4 pb-4 space-y-2 p-2">
          <Link href="/" onClick={() => setIsOpen(false)} className="block text-center">
            Home
          </Link>
          <Link href="/products" onClick={() => setIsOpen(false)} className="block text-center">
            Products
          </Link>
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block text-center">
            Dashboard
          </Link>
          <Link href="/recommendations" onClick={() => setIsOpen(false)} className="block text-center">
            Recommendations
          </Link>
          <Link href="/my-orders" onClick={() => setIsOpen(false)} className="block text-center">
            MY Orders
          </Link>
          <Link href="/cart" onClick={() => setIsOpen(false)} className="block text-center">
            Cart
          </Link>
          {user ? (
              <div className="relative flex justify-center">
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
        </div>
      )}
    </header>
  )
}
