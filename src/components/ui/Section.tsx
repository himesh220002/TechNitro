'use client'

import { motion } from 'framer-motion'
import { GradientHeading } from './LoadingStates'

interface SectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export default function Section({ title, description, children, className = '' }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`max-w-7xl mx-auto px-6 py-16 ${className}`}
    >
      <div className="mb-8">
        <GradientHeading>{title}</GradientHeading>
        {description && (
          <p className="mt-2 text-gray-400">{description}</p>
        )}
      </div>
      {children}
    </motion.section>
  )
}