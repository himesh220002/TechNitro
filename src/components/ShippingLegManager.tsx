'use client'

import { useState, useMemo } from 'react'
import { bidirectionalGraph } from '@/lib/transport-routing/graph'



type ShippingEvent = {
  location: string
  status: 'active' | 'inactive'
  visible: boolean
  timestamp: string
  mode?: 'train' | 'flight' | 'truck'
}

type Props = {
  orderId: string
  shippingEvents?: ShippingEvent[]
    onAddLeg?: (orderId: string, location: string, mode: 'train' | 'flight' | 'truck') => Promise<void>
  }

export default function ShippingLegManager({ orderId, shippingEvents = [] }: Props) {
  const [showEditor, setShowEditor] = useState(false)
  const [checkpoints, setCheckpoints] = useState<string[]>([])
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string | null>(null)
  const [showTransportModal, setShowTransportModal] = useState(false)

  const availableLocations = useMemo(() => {
    const normalizedGraph = bidirectionalGraph.map((edge) => ({
      ...edge,
      from: edge.from.toLowerCase(),
      to: edge.to.toLowerCase(),
    }))
    const validCities = Array.from(
      new Set(normalizedGraph.flatMap(edge => [edge.from, edge.to]))
    )
    return validCities.sort()
  }, [])

  function handleOpenEditor() {
    const route = shippingEvents.map((e) => e.location)
    const uniqueRoute = Array.from(new Set(route))
    setCheckpoints(uniqueRoute)
    setShowEditor(true)
  }

  async function handleFullRouteUpdate(fullRoute: unknown[]) {
    const res = await fetch('/api/update-shipping-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: orderId,
        event: fullRoute,
        fullReplace: true, // ✅ overwrite entire route
      }),
    })

    if (!res.ok) {
      alert('❌ Failed to update full route')
    } else {
      // Reset all fields for new input
      setCheckpoints([])
      setSelectedCheckpoint(null)
      setShowTransportModal(false)
      setShowEditor(false)
    }
  }

  return (
    <div>
      {/* Route Planner Button */}
      <button
        onClick={handleOpenEditor}
        className="w-full px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
      >
        🛠 Open Route Planner
      </button>

      {/* Route Editor Modal */}
      {showEditor && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditor(false)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowEditor(false)
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="bg-gray-900 p-6 rounded-xl w-full max-w-3xl m-4"
            style={{ maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">� Route Planner</h3>
              <button
                onClick={() => setShowEditor(false)}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"
                aria-label="Close editor"
              >
                ✕
              </button>
            </div>

            {/* Add New Checkpoint Form */}
            <div className="mb-6 p-4 border border-gray-800 rounded-lg space-y-4">
              <h4 className="text-sm font-medium text-white">Add Checkpoint</h4>
              
              {/* City Selection */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                <select
                  value=""
                  onChange={(e) => {
                    const location = e.target.value
                    if (location && !checkpoints.includes(location)) {
                      setCheckpoints(prev => [...prev, location])
                    }
                  }}
                  className="bg-gray-800 text-white px-3 py-2 rounded w-full"
                >
                  <option value="">Select location...</option>
                  {availableLocations
                    .filter(loc => !checkpoints.includes(loc))
                    .map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))
                  }
                  <option value="Reached Nearest Hub">📍 Mark as Nearest Hub</option>
                </select>
              </div>
            </div>

            {/* Checkpoint List */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white mb-3">Current Route</h4>
              <div className="space-y-3">
                {checkpoints.map((checkpoint, index) => (
                  <div key={checkpoint} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-400">{index + 1}.</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{checkpoint}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={async () => {
                            const timestamp = new Date().toISOString()
                            const newEvent = {
                              location: checkpoint,
                              status: 'active',
                              visible: true,
                              timestamp,
                              mode: undefined
                            }
                            const existingEvents = shippingEvents.filter(e => e.location !== checkpoint)
                            await handleFullRouteUpdate([...existingEvents, newEvent])
                          }}
                          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                          📥 Arrived
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCheckpoint(checkpoint)
                            setShowTransportModal(true)
                          }}
                          className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                        >
                          🚀 Departed
                        </button>
                        {checkpoint !== 'Reached Nearest Hub' && (
                          <button
                            onClick={() => {
                              setCheckpoints(prev => prev.filter(cp => cp !== checkpoint))
                            }}
                            className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                          >
                            ❌ Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transport Mode Selection Modal */}
            {showTransportModal && selectedCheckpoint && (
              <div 
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowTransportModal(false)
                    setSelectedCheckpoint(null)
                  }
                }}
              >
                <div className="bg-gray-900 p-6 rounded-lg w-80 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Select Transport Mode</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={async () => {
                        await handleFullRouteUpdate([
                          ...shippingEvents.filter(e => e.location !== selectedCheckpoint),
                          {
                            location: selectedCheckpoint,
                            status: 'active',
                            visible: true,
                            timestamp: new Date().toISOString(),
                            mode: 'train'
                          }
                        ])
                        setShowTransportModal(false)
                        setSelectedCheckpoint(null)
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-800 hover:bg-indigo-900 text-white rounded"
                    >
                      🚂 Train
                    </button>
                    <button
                      onClick={async () => {
                        await handleFullRouteUpdate([
                          ...shippingEvents.filter(e => e.location !== selectedCheckpoint),
                          {
                            location: selectedCheckpoint,
                            status: 'active',
                            visible: true,
                            timestamp: new Date().toISOString(),
                            mode: 'flight'
                          }
                        ])
                        setShowTransportModal(false)
                        setSelectedCheckpoint(null)
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-800 hover:bg-indigo-900 text-white rounded"
                    >
                      ✈️ Flight
                    </button>
                    <button
                      onClick={async () => {
                        await handleFullRouteUpdate([
                          ...shippingEvents.filter(e => e.location !== selectedCheckpoint),
                          {
                            location: selectedCheckpoint,
                            status: 'active',
                            visible: true,
                            timestamp: new Date().toISOString(),
                            mode: 'truck'
                          }
                        ])
                        setShowTransportModal(false)
                        setSelectedCheckpoint(null)
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-800 hover:bg-indigo-900 text-white rounded"
                    >
                      🚛 Truck
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setShowTransportModal(false)
                      setSelectedCheckpoint(null)
                    }}
                    className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-800 text-white"
              >
                Close
              </button>
              <div className="text-sm text-gray-400">
                {checkpoints.length} checkpoints in route
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {shippingEvents.length > 0 && (
        <div className="my-4 ml-2 space-y-2">
          <h4 className="text-sm text-white font-semibold">📦 Shipping Timeline</h4>
          {shippingEvents.map((event, index) => (
            <div key={index} className="flex flex gap-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    event.status === 'active' ? 'bg-green-400' : 'bg-gray-500'
                  }`}
                />
                <p className={`text-sm ${event.status === 'active' ? 'text-green-200 font-medium' : 'text-gray-400'}`}>
                  {event.location} {event.mode === 'train' ? '🚆' : event.mode === 'flight' ? '✈️' : event.mode === 'truck' ? '🚚' : ''}
                </p>
              </div>
              <p className="ml-6 text-xs text-gray-500">{event.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
