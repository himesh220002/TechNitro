import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'
import Image from 'next/image';


export default function Footer() {
  return (
    <footer className="bg-[#1f1f1f] text-gray-300 pt-12 pb-6 border-t border-gray-700">
      <div className="max-w-6xl mx-auto px-6 text-center space-y-6">

        {/* Logo & Tagline */}
        <div className="space-y-2">
          <Image src="/logoTechNitro.png" alt="TechNest Logo" width={200} height={200} className="mx-auto w-32" />
          <p className="text-sm text-gray-400">Exclusive updates for our #techlovers</p>
        </div>

        {/* Newsletter */}
        <form className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="bg-gray-800 text-white px-4 py-2 rounded w-full text-sm"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold"
          >
            Subscribe
          </button>
        </form>
        <label className="text-xs text-gray-400 flex items-start justify-center gap-2">
          <input type="checkbox" className="accent-red-600" />
          I would like to receive information about new releases and offers.
        </label>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-6 text-sm mt-6">
          <Link href="/">Home</Link>
          <Link href="/tours">Tours</Link>
          <Link href="/products">Our Products</Link>
          <Link href="/legacy">Our Legacy</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        {/* Social Icons */}
        <div className="flex justify-center gap-4 mt-6 text-white text-lg">
          <FaFacebookF className="hover:text-red-500 cursor-pointer" />
          <FaTwitter className="hover:text-red-500 cursor-pointer" />
          <FaInstagram className="hover:text-red-500 cursor-pointer" />
          <FaYoutube className="hover:text-red-500 cursor-pointer" />
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 text-xs text-gray-500 space-y-2">
          <div className="flex justify-center gap-4">
            <Link href="/terms">Terms and Conditions</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
          <p>© 2025 TechNitro. All rights reserved. with ❤️ from Himesh.</p>
        </div>
      </div>
    </footer>
  )
}
