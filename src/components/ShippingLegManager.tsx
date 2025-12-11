'use client'

import { useState, useMemo } from 'react'
import { bidirectionalGraph } from '@/lib/transport-routing/graph'
import { useRouter } from 'next/navigation'
import { MdRefresh } from 'react-icons/md'



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
  onRefresh?: () => void | Promise<void>
}

export default function ShippingLegManager({ orderId, shippingEvents = [], onRefresh }: Props) {
  const router = useRouter()
  const [showEditor, setShowEditor] = useState(false)
  const [checkpoints, setCheckpoints] = useState<string[]>([])
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string | null>(null)
  const [showTransportModal, setShowTransportModal] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

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
    // Extract unique locations from existing events to populate the route list
    const route = shippingEvents.map((e) => e.location)
    const uniqueRoute = Array.from(new Set(route))
    setCheckpoints(uniqueRoute)
    setShowEditor(true)
  }

  async function handleFullRouteUpdate(fullRoute: unknown[]) {
    setIsUpdating(true)
    try {
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
        // We don't close the modal here to allow further edits, just refresh the data if needed
        // But since this component receives props, the parent should update.
        // We can close the transport modal if it was open
        setShowTransportModal(false)
        setSelectedCheckpoint(null)

        if (onRefresh) {
          await onRefresh()
        } else {
          router.refresh()
        }
      }
    } catch (error) {
      console.error('Failed to update route:', error)
      alert('❌ Failed to update route')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleManualRefresh = async () => {
    if (onRefresh) {
      setIsUpdating(true)
      try {
        await onRefresh()
      } finally {
        setIsUpdating(false)
      }
    } else {
      router.refresh()
    }
  }



  const hasArrived = (location: string) => {
    return shippingEvents.some(e => e.location === location && !e.mode)
  }

  const hasDeparted = (location: string) => {
    return shippingEvents.some(e => e.location === location && e.mode)
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
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">📍 Route Planner</h3>
                <button
                  onClick={handleManualRefresh}
                  className="p-1.5 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition"
                  title="Refresh Data"
                  disabled={isUpdating}
                >
                  <MdRefresh size={20} className={isUpdating ? 'animate-spin' : ''} />
                </button>
              </div>
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
                  className="bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer px-4 py-2 w-full"
                  disabled={isUpdating}
                >
                  <option value="" className="bg-gray-800 text-gray-200">Select location...</option>
                  {availableLocations
                    .filter(loc => !checkpoints.includes(loc))
                    .map(loc => (
                      <option key={loc} value={loc} className="bg-gray-800 text-gray-200">{loc}</option>
                    ))
                  }
                  <option value="Reached Nearest Hub" className="bg-gray-800 text-gray-200">📍 Mark as Nearest Hub</option>
                </select>
              </div>
            </div>

            {/* Checkpoint List */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white mb-3">Current Route</h4>
              <div className="space-y-3">
                {checkpoints.map((checkpoint, index) => {
                  const arrived = hasArrived(checkpoint)
                  const departed = hasDeparted(checkpoint)

                  return (
                    <div key={checkpoint} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <span className="text-gray-400 w-6">{index + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-lg">{checkpoint}</span>
                          <div className="flex gap-2">
                            {arrived && <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded border border-green-800">✓ Arrived</span>}
                            {departed && <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded border border-blue-800">🚀 Departed</span>}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {!arrived && (
                            <button
                              onClick={async () => {
                                const timestamp = new Date().toISOString()
                                const newEvent = {
                                  location: checkpoint,
                                  status: 'active',
                                  visible: true,
                                  timestamp,
                                  mode: undefined // Arrived has no mode
                                }
                                // Keep all existing events, add arrival
                                await handleFullRouteUpdate([...shippingEvents, newEvent])
                              }}
                              disabled={isUpdating}
                              className={`px-3 py-1.5 text-xs font-medium rounded text-white transition ${isUpdating ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-700 hover:bg-green-600'}`}
                            >
                              {isUpdating ? '...' : '📥 Mark Arrived'}
                            </button>
                          )}

                          {!departed && (
                            <button
                              onClick={() => {
                                setSelectedCheckpoint(checkpoint)
                                setShowTransportModal(true)
                              }}
                              disabled={isUpdating}
                              className={`px-3 py-1.5 text-xs font-medium rounded text-white transition ${isUpdating ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-600'}`}
                            >
                              🚀 Mark Departed
                            </button>
                          )}

                          <button
                            onClick={async () => {
                              // Remove ALL events for this location
                              const updatedEvents = shippingEvents.filter(e => e.location !== checkpoint)
                              await handleFullRouteUpdate(updatedEvents)
                              // Also remove from local checkpoints list
                              setCheckpoints(prev => prev.filter(cp => cp !== checkpoint))
                            }}
                            disabled={isUpdating}
                            className={`px-3 py-1.5 text-xs font-medium rounded text-red-200 transition ml-auto border border-red-800 ${isUpdating ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-900/80 hover:bg-red-800'}`}
                          >
                            {isUpdating ? '...' : '🗑 Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {checkpoints.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No checkpoints added yet.</p>
                )}
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
                <div className="bg-gray-900 p-6 rounded-lg w-80 border border-gray-700 shadow-2xl">
                  <h4 className="text-lg font-semibold text-white mb-4">Departing from {selectedCheckpoint}</h4>
                  <p className="text-gray-400 text-sm mb-4">Select transport mode:</p>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={async () => {
                        await handleFullRouteUpdate([
                          ...shippingEvents, // Keep existing
                          {
                            location: selectedCheckpoint,
                            status: 'active',
                            visible: true,
                            timestamp: new Date().toISOString(),
                            mode: 'train'
                          }
                        ])
                      }}
                      disabled={isUpdating}
                      className={`flex items-center justify-center gap-2 px-4 py-3 text-white rounded transition ${isUpdating ? 'bg-gray-700 cursor-not-allowed' : 'bg-indigo-800 hover:bg-indigo-700'}`}
                    >
                      🚂 Train
                    </button>
                    <button
                      onClick={async () => {
                        await handleFullRouteUpdate([
                          ...shippingEvents,
                          {
                            location: selectedCheckpoint,
                            status: 'active',
                            visible: true,
                            timestamp: new Date().toISOString(),
                            mode: 'flight'
                          }
                        ])
                      }}
                      disabled={isUpdating}
                      className={`flex items-center justify-center gap-2 px-4 py-3 text-white rounded transition ${isUpdating ? 'bg-gray-700 cursor-not-allowed' : 'bg-indigo-800 hover:bg-indigo-700'}`}
                    >
                      ✈️ Flight
                    </button>
                    <button
                      onClick={async () => {
                        await handleFullRouteUpdate([
                          ...shippingEvents,
                          {
                            location: selectedCheckpoint,
                            status: 'active',
                            visible: true,
                            timestamp: new Date().toISOString(),
                            mode: 'truck'
                          }
                        ])
                      }}
                      disabled={isUpdating}
                      className={`flex items-center justify-center gap-2 px-4 py-3 text-white rounded transition ${isUpdating ? 'bg-gray-700 cursor-not-allowed' : 'bg-indigo-800 hover:bg-indigo-700'}`}
                    >
                      🚛 Truck
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setShowTransportModal(false)
                      setSelectedCheckpoint(null)
                    }}
                    className="w-full mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition"
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
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition"
              >
                Close
              </button>
              <div className="text-sm text-gray-400">
                {checkpoints.length} checkpoints • {shippingEvents.length} events
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Display (Outside Modal) */}
      {shippingEvents.length > 0 && (
        <div className="my-4 ml-2 space-y-0 relative border-l-2 border-gray-700 pl-4 py-2">
          <div className="flex justify-between items-center mb-3 -ml-6">
            <div className="flex items-center gap-2 bg-gray-900 px-2 rounded-r">
              <h4 className="text-sm text-white font-semibold">📦 Tracking History</h4>
              <button
                onClick={handleManualRefresh}
                className="p-1 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition"
                title="Refresh History"
                disabled={isUpdating}
              >
                <MdRefresh size={16} className={isUpdating ? 'animate-spin' : ''} />
              </button>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-gray-900 px-2"
            >
              {isExpanded ? 'Show Less ▲' : 'Show All ▼'}
            </button>
          </div>

          {shippingEvents.slice().reverse().map((event, index) => {
            const isLatest = index === 0;
            // If not expanded, only show the latest event
            if (!isExpanded && !isLatest) return null;

            return (
              <div key={index} className="mb-4 relative">
                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-gray-900 ${isLatest ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-medium text-sm">{event.location}</span>
                    {event.mode ? (
                      <span className="text-xs bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/50">
                        Departed via {event.mode === 'train' ? '🚆 Train' : event.mode === 'flight' ? '✈️ Flight' : '🚛 Truck'}
                      </span>
                    ) : (
                      <span className="text-xs bg-green-900/30 text-green-300 px-1.5 py-0.5 rounded border border-green-800/50">
                        Arrived
                      </span>
                    )}
                    {isLatest && <span className="text-[10px] bg-red-600 text-white px-1 rounded uppercase font-bold tracking-wider">Current</span>}
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5">{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              </div>
            )
          })}

          {!isExpanded && shippingEvents.length > 1 && (
            <div className="text-xs text-gray-500 italic pl-1">
              + {shippingEvents.length - 1} previous updates...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
