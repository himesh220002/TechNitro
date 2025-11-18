'use client'

import { useState } from 'react'

export default function SpecsModal({
  initialSpecs,
  onSave,
  onClose,
}: {
  initialSpecs: Record<string, string>
  onSave: (specs: Record<string, string>) => void
  onClose: () => void
}) {
  const [specs, setSpecs] = useState(initialSpecs)
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')

  const handleAdd = () => {
    if (key && value) {
      setSpecs({ ...specs, [key]: value })
      setKey('')
      setValue('')
    }
  }

  const handleDelete = (k: string) => {
    const updated = { ...specs }
    delete updated[k]
    setSpecs(updated)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-gray-200">Edit Product Specs</h2>
        <ul className="text-sm text-gray-700 mt-4 space-y-1 max-h-40 overflow-y-auto">
          {Object.entries(specs).map(([k, v]) => (
            <li key={k} className="flex justify-between items-center text-green-200">
              <span>
                <strong>{k}:</strong> {v}
              </span>
              <button
                onClick={() => handleDelete(k)}
                className="text-red-500 text-xs hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
            <div className='flex flex-col gap-2'>
                <label > Spec. Name</label>
                <input
                    type="text"
                    placeholder="e.g. RAM, Storage etc."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full p-2 bg-gray-500 border rounded"
                />
            </div>
            <div className='flex flex-col gap-2'>
                <label >Spec detail</label>
                <input
                    type="text"
                    placeholder="Spec detail (e.g. 16GB DDR5)"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full p-2 bg-gray-500 border rounded"
                />
            </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Spec
        </button>

        

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={() => onSave(specs)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            OK
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
