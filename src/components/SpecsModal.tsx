'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Package className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Product Specifications</h2>
              <p className="text-sm text-gray-400">Add technical details and features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Add New Spec */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Add Specification</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="e.g., Processor, RAM, Storage"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyPress={handleKeyPress}
                className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
              <input
                type="text"
                placeholder="e.g., Intel i7, 16GB DDR5"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!key || !value}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Plus size={18} />
              Add Specification
            </button>
          </div>

          {/* Specs List */}
          {Object.keys(specs).length > 0 ? (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Current Specifications ({Object.keys(specs).length})
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                <AnimatePresence>
                  {Object.entries(specs).map(([k, v]) => (
                    <motion.div
                      key={k}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg group hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-purple-400 truncate">{k}</div>
                        <div className="text-sm text-gray-300 truncate">{v}</div>
                      </div>
                      <button
                        onClick={() => handleDelete(k)}
                        className="ml-3 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove specification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No specifications added yet</p>
              <p className="text-xs text-gray-600 mt-1">Add technical details above</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800 bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(specs)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-purple-500/25 font-medium"
          >
            Save Specifications
          </button>
        </div>
      </motion.div>
    </div>
  )
}
