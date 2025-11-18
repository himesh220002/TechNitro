'use client'

import { useState } from 'react'

export default function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)

  const limit = 580
  const isLong = text.length > limit
  const preview = text.slice(0, limit)

  return (
    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
      {expanded || !isLong ? (
        <>
          {text}{' '}
          <button
            onClick={() => setExpanded(false)}
            className="text-indigo-400 hover:underline text-sm"
          >
            Shrink ↑
          </button>
        </>
      ) : (
        <>
          {preview}...{' '}
          <button
            onClick={() => setExpanded(true)}
            className="text-indigo-400 hover:underline text-sm"
          >
            Read more ↓
          </button>
        </>
      )}
    </p>
  )
}
