'use client'
import { useState } from 'react'
import supabase from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [errorTimestamp, setErrorTimestamp] = useState(0) // Add timestamp for error animation
  const [loading, setLoading] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [codeVerified, setCodeVerified] = useState(false)

  const handleVerifyCode = () => {
    if (accessCode === process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE) {
      setCodeVerified(true)
      setError('')
    } else {
      setError('Invalid admin access code. Please try again.')
      setErrorTimestamp(Date.now()) // Update timestamp to trigger animation
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setError('')
      setLoading(true)
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'admin'
          }
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      window.location.href = '/admin/login?registered=true'
    } catch {
      setError('An error occurred during registration')
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
          <h2 className="text-3xl font-bold text-white">Admin Registration</h2>
          <p className="text-gray-400">{codeVerified ? 'Create your admin account' : 'Enter access code to continue'}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="relative">
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: [-16, 0] }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 5
              }}
              className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm"
              key={`${error}-${errorTimestamp}`}
            >
              ⚠️ {error}
            </motion.div>
          </div>
        )}

        {!codeVerified ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Admin Access Code</label>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                placeholder="Enter admin access code"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 focus:border-indigo-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
            <button
              onClick={handleVerifyCode}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            >
              Verify Access Code
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
              Already have an admin account?{' '}
              <Link href="/admin/login" className="text-indigo-400 hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 focus:border-indigo-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Email address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 focus:border-indigo-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 focus:border-indigo-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating admin account...
                </span>
              ) : 'Create Admin Account'}
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
              Already have an admin account?{' '}
              <Link href="/admin/login" className="text-indigo-400 hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  )
}
