'use client'

import { useState, useEffect } from 'react'

type ShippingStatus = 'Received' | 'Dispatched' | 'Arrived'
type TransportMode = 'train' | 'flight' | 'truck'

type ShippingEventInput = {
  checkpointName: string
  status: ShippingStatus
  timestamp: string
  mode?: TransportMode
}

type CheckpointState = {
  received: {
    useNow: boolean
    date: string
    time: string
  }
  dispatched?: {
    useNow: boolean
    date: string
    time: string
    mode: TransportMode
  }
}


type Props = {
  orderId: string
  checkpoints: string[] // e.g. ['Mumbai', 'Kolkata', 'Patna', 'Reached Nearest Hub']
  onUpdate: (orderId: string, event: ShippingEventInput) => void
  onRemoveCheckpoint?: (name: string) => void
}

export default function ShippingCheckpointEditor({ orderId, checkpoints, onUpdate, onRemoveCheckpoint }: Props) {




  const [eventState, setEventState] = useState<Record<string, CheckpointState>>({})


  function checkpointReducer(
    state: Record<string, CheckpointState>,
    checkpoints: string[]
  ): Record<string, CheckpointState> {
    const updated: Record<string, CheckpointState> = { ...state }

    // Add missing
    checkpoints.forEach((cp, i) => {
      if (!updated[cp]) {
        updated[cp] = {
          received: { useNow: false, date: '', time: '' },
          dispatched: i === checkpoints.length - 1 ? undefined : {
            useNow: false,
            date: '',
            time: '',
            mode: 'truck',
          },
        }
      }
    })

    // Remove deleted
    Object.keys(updated).forEach((key) => {
      if (!checkpoints.includes(key)) {
        delete updated[key]
      }
    })

    return updated
  }

  // Keep eventState in sync with the checkpoints prop
  useEffect(() => {
    // derive the next state from the current eventState and the checkpoints prop
    const next = checkpointReducer(eventState, checkpoints)
    // only update if different to avoid cascading renders
    try {
      if (JSON.stringify(next) !== JSON.stringify(eventState)) {
        // schedule update asynchronously to avoid synchronous setState inside effect
        Promise.resolve().then(() => setEventState(next))
      }
    } catch {
      // fallback - if serialization fails, schedule the update asynchronously
      Promise.resolve().then(() => setEventState(next))
    }
  }, [checkpoints, eventState])



  function formatTimestamp(useNow: boolean, date: string, time: string) {
    if (useNow) return new Date().toISOString()
    // if date or time is missing, fall back to current time
    if (!date || !time) return new Date().toISOString()
    const [hour, minute] = time.split(':')
    const iso = new Date(`${date}T${hour}:${minute}:00`)
    if (isNaN(iso.getTime())) return new Date().toISOString()
    return iso.toISOString()
  }

  function handleUpdate(cp: string, type: 'received' | 'dispatched') {
    const state = eventState[cp]?.[type] as
      | CheckpointState['received']
      | CheckpointState['dispatched']
      | undefined
    if (!state) return

    const payload: ShippingEventInput = {
      checkpointName: cp,
      status: type === 'received' && cp === checkpoints[checkpoints.length - 1] ? 'Arrived' : type === 'received' ? 'Received' : 'Dispatched',
      timestamp: formatTimestamp(state.useNow, state.date, state.time),
      mode: type === 'dispatched' ? (state as CheckpointState['dispatched'])?.mode : undefined

    }

    onUpdate(orderId, payload)
  }





  return (
    <div className="space-y-6">
      {checkpoints.map((cp, i) => {
        const isEnd = i === checkpoints.length - 1
        const state = eventState[cp]
        if (!state) return null


        return (
          <div key={cp} className="border border-gray-700 p-4 rounded">

            <h3 className="text-white font-semibold p-1 rounded border border-gray-500 mb-2">📍 {cp}</h3>
            {!isEnd && onRemoveCheckpoint && (
              <button
                onClick={() => onRemoveCheckpoint(cp)}
                className="text-red-400 hover:text-red-600 text-sm mb-2"
              >
                ❌ Remove
              </button>
            )}

            <div className='flex items-start gap-10'>

              <div className="flex flex-col gap-2">
                <div className={`p-2 rounded text-white ${state.received.useNow || state.received.date ? 'bg-green-900' : 'bg-gray-800'}`}>
                  📥 {isEnd ? 'Arrived' : 'Received'}: {state.received.useNow ? 'Now' : state.received.date || 'Not set'}
                </div>

                {!isEnd && state.dispatched && (
                  <div className={`p-2 rounded text-white ${state.dispatched.useNow || state.dispatched.date ? 'bg-green-900' : 'bg-gray-800'}`}>
                    📤 Dispatched: {state.dispatched.useNow ? 'Now' : state.dispatched.date || 'Not set'} via {state.dispatched.mode}
                  </div>
                )}
              </div>

              {/* Received or Arrived */}
              <div className="space-y-2 mb-4 p-2 border border-gray-700 rounded">
                <label className="text-md text-white block mb-1">
                  {isEnd ? 'Arrived' : 'Received'} Timestamp
                </label>
                <label className="text-sm text-white block">
                  <input
                    type="checkbox"
                    checked={state.received.useNow}
                    onChange={() =>
                      setEventState((prev: Record<string, CheckpointState>) => ({
                        ...prev,
                        [cp]: {
                          ...prev[cp],
                          received: { ...prev[cp].received, useNow: !prev[cp].received.useNow }
                        }
                      }))
                    }
                    className="mr-2"
                  />
                  Use current time
                </label>
                {!state.received.useNow && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={state.received.date}
                      onChange={(e) =>
                        setEventState((prev: Record<string, CheckpointState>) => ({
                          ...prev,
                          [cp]: {
                            ...prev[cp],
                            received: { ...prev[cp].received, date: e.target.value }
                          }
                        }))
                      }
                      className="bg-gray-800 text-white px-2 py-1 rounded"
                    />
                    <input
                      type="time"
                      value={state.received.time}
                      onChange={(e) =>
                        setEventState((prev: Record<string, CheckpointState>) => ({
                          ...prev,
                          [cp]: {
                            ...prev[cp],
                            received: { ...prev[cp].received, time: e.target.value }
                          }
                        }))
                      }
                      className="bg-gray-800 text-white px-2 py-1 rounded"
                    />
                  </div>
                )}
                <button
                  onClick={() => handleUpdate(cp, 'received')}
                  className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded font-semibold"
                >
                  ✅ Update {isEnd ? 'Arrived' : 'Received'}
                </button>
              </div>

              {/* Dispatch */}
              {!isEnd && state.dispatched && (
                <div className="space-y-2 p-2 border border-gray-700 rounded">
                  <label className="text-sm text-white block mb-1">Dispatched Timestamp</label>
                  <label className="text-sm text-white block">
                    <input
                      type="checkbox"
                      checked={state.dispatched.useNow}
                      onChange={() =>
                        setEventState((prev: Record<string, CheckpointState>) => ({
                          ...prev,
                          [cp]: {
                            ...prev[cp],
                            dispatched: { ...prev[cp].dispatched!, useNow: !prev[cp].dispatched!.useNow }
                          }
                        }))
                      }
                      className="mr-2"
                    />
                    Use current time
                  </label>
                  {!state.dispatched.useNow && (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={state.dispatched.date}
                        onChange={(e) =>
                          setEventState((prev: Record<string, CheckpointState>) => ({
                            ...prev,
                            [cp]: {
                              ...prev[cp],
                              dispatched: { ...prev[cp].dispatched!, date: e.target.value }
                            }
                          }))
                        }
                        className="bg-gray-800 text-white px-2 py-1 rounded"
                      />
                      <input
                        type="time"
                        value={state.dispatched.time}
                        onChange={(e) =>
                          setEventState((prev: Record<string, CheckpointState>) => ({
                            ...prev,
                            [cp]: {
                              ...prev[cp],
                              dispatched: { ...prev[cp].dispatched!, time: e.target.value }
                            }
                          }))
                        }
                        className="bg-gray-800 text-white px-2 py-1 rounded"
                      />
                    </div>
                  )}
                  <label className="text-sm text-white block mb-1">Transport Mode</label>
                  <select
                    value={state.dispatched.mode}
                    onChange={(e) =>
                      setEventState((prev: Record<string, CheckpointState>) => ({
                        ...prev,
                        [cp]: {
                          ...prev[cp],
                          dispatched: { ...prev[cp].dispatched!, mode: e.target.value as TransportMode }
                        }
                      }))
                    }
                    className="bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer px-4 py-2 w-full"
                  >
                    <option value="train" className="bg-gray-800 text-gray-200">🚆 Train</option>
                    <option value="flight" className="bg-gray-800 text-gray-200">✈️ Flight</option>
                    <option value="truck" className="bg-gray-800 text-gray-200">🚚 Truck</option>
                  </select>
                  <button
                    onClick={() => handleUpdate(cp, 'dispatched')}
                    className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded font-semibold"
                  >
                    ✅ Update Dispatched
                  </button>
                </div>
              )}


            </div>
          </div>
        )
      })}
    </div>
  )
}
