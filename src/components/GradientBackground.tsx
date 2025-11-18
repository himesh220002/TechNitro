'use client'

import { motion } from 'framer-motion'

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#334155,transparent)] opacity-40"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}