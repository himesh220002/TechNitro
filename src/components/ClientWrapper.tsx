'use client'

import { useEffect } from 'react'
import { KeepAliveUtil } from '@/lib/keep-alive'
import { InvoiceProvider } from '@/context/InvoiceContext'

import { Toaster } from 'react-hot-toast'

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Only initialize keep-alive in production and if we're in the browser
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      const keepAlive = KeepAliveUtil.getInstance()
      keepAlive.startKeepAlive(window.location.origin)

      return () => keepAlive.stopKeepAlive()
    }
  }, [])

  return (
    <InvoiceProvider>
      {children}
      <Toaster position="top-right" />
    </InvoiceProvider>
  )
}