'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AdminOrdersRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/dashboard/orders')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-white text-lg">Redirecting to Dashboard Orders...</p>
      </div>
    </div>
  )
}
