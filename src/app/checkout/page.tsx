import React from 'react'
import CheckoutClient from '@/components/CheckoutClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function CheckoutPage() {
  // Render the client checkout UI inside a Suspense boundary to allow client hooks
  return (
    <>
      <Navbar />
      <main className="min-h-screen p-0 sm:p-6 max-w-[1600px] mx-auto">
        <React.Suspense fallback={<div className="p-6">Loading checkout…</div>}>
          <CheckoutClient />
        </React.Suspense>
      </main>
      <Footer />
    </>
  )
}
