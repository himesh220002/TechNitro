// src/app/admin/login/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import Link from 'next/link'



export default function AdminLoginPage() {
  const supabase = createClientComponentClient()
  const [returnToParam, setReturnToParam] = useState<string | null>(null)

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      setReturnToParam(params.get('returnTo'))
    } catch (e) {
      // ignore in non-browser environments
    }
  }, [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    try {
      setError('')
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError('Invalid credentials')
        return
      }

      const user = data?.user
      if (user?.user_metadata?.role !== 'admin') {
        setError('Not authorized as admin')
        return
      }

      // Wait for the auth session/cookies to be available to the server.
      // Sometimes the client-side sign in writes cookies asynchronously and
      // an immediate redirect can arrive at the server before cookies are present,
      // causing middleware to still see the user as unauthenticated.
      const start = Date.now()
      let session: unknown = null
      while (Date.now() - start < 3000) { // 3s timeout
        const s = await supabase.auth.getSession()
        session = s.data?.session
        // Also verifying user to be extra sure
        const u = await supabase.auth.getUser()
        if (session && u.data.user) break
        await new Promise((r) => setTimeout(r, 200))
      }

      console.log('admin login: signIn result user=', user?.id, 'session=', !!session)

      // Proceed to admin dashboard — middleware should now see the session.
      const returnTo = returnToParam
      const target = returnTo && returnTo.startsWith('/admin') ? returnTo : '/admin/dashboard'
      window.location.href = target

    } catch (err) {
      setError('An error occurred')
      console.error("new err : ", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md m-2 sm:m-0 p-4 sm:p-8 space-y-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-300 bg-green-800 p-2 rounded-lg">Sign in to access admin dashboard</p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 focus:border-indigo-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 focus:border-indigo-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign in'}
          </button>

          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/50 text-gray-400">Or continue with</span>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/admin/register" className="text-indigo-400 hover:text-indigo-300">
              Register as Admin
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}

