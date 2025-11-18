// Server component wrapper for the client-side TrackOrder UI
import React from 'react'
import TrackOrderClient from '@/components/TrackOrderClient'

export default function Page() {
  return (
    <React.Suspense fallback={<div className="p-6">Loading order tracker…</div>}>
      {/* Client component handles useSearchParams and live fetching */}
      <TrackOrderClient />
    </React.Suspense>
  )
}
