'use client'
import { useEffect, useState } from 'react'

export default function OrderNote({ orderId }: { orderId: string }) {
  const noteKey = `order-note-${orderId}`
  const [note, setNote] = useState('')

  useEffect(() => {
  const saved = localStorage.getItem(noteKey)
  if (saved !== null) {
    Promise.resolve().then(() => setNote(saved))
  }
}, [noteKey])


  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newNote = e.target.value
    setNote(newNote)
    localStorage.setItem(noteKey, newNote)
  }

  return (
    <textarea
      value={note}
      onChange={handleChange}
      placeholder="Admin notes for this order..."
      className="bg-gray-800 text-sm text-white px-3 py-2 rounded w-full min-h-[200px] resize-y mt-2"
    />
  )
}
