// src/app/admin-orders/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { bidirectionalGraph } from '@/lib/transport-routing/graph'
import { findBestRoute } from '@/lib/transport-routing/dijkstra'
import type { RouteEdge } from '@/lib/transport-routing/types'
import OrderNote from '@/components/OrderNotes'
import ShippingLegManager from '@/components/ShippingLegManager'
// import ShippingTimeline from '@/components/ShippingTimeline'




type ProductInOrder = {
  id: string
  name: string
  slug: string
  price: number
  category: string
  imageUrl: string
  quantity: number
  inventory: number
  created_at: string
  description: string
  lastUpdated: string
}

type Order = {
  id: string
  user_id: string
  accountName: string
  accountNumber: string
  phone: string
  address: string
  pin: string
  paymentMethod: string
  payment: number
  paymentResult: string
  deliveryCharge:number
  orderStatus: string
  created_at: string
  products: ProductInOrder[]
  shippingEvents?: ShippingEvent[]
}

type ShippingEvent = {
  location: string
  status: 'active' | 'inactive'
  visible: boolean
  timestamp: string
  mode?: 'train' | 'flight' | 'truck'
}

const statusOptions = [
  'Order Placed',
  'Order Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
  'Refund Initiated',
  'Refund Completed',
]

export default function AdminOrdersPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() - 1, 1)
  })
  const [endDate, setEndDate] = useState(() => new Date())
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const [visibleCount, setVisibleCount] = useState(20)


  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.replace('/admin/login')
        return
      }
      
      const role = session.user.user_metadata?.role
      if (role !== 'admin') {
        router.replace('/admin/login')
        return
      }
    }
    
    checkAdminAccess()
  }, [router, supabase.auth])

  const [showRouteModal, setShowRouteModal] = useState(false)
  // const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [sourceCity, setSourceCity] = useState('')
  const [destinationCity, setDestinationCity] = useState('')
  const [routePlan, setRoutePlan] = useState<RouteEdge[]>([])
  const [selectedRouteType, setSelectedRouteType] = useState<'cost-effective' | 'time-effective' | 'hybrid'| null>(null)

  const [openNotesOrderId, setOpenNotesOrderId] = useState<string | null>(null)


 
  const [weightKg, setWeightKg] = useState(1)

  



  useEffect(() => {
  const fetchOrders = async () => {
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.warn("❌ No access token")
        setOrders([])
        return
      }

      const res = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await res.json()

      if (Array.isArray(data)) {
        setOrders(data)
      } else {
        console.error("Unexpected response:", data)
        setOrders([])
      }
    } catch (err) {
      console.error("Failed to fetch admin orders:", err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  fetchOrders()
}, [supabase.auth])


  const updateStatus = async (id: string, status: string) => {
    const res = await fetch('/api/update-order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })

    if (res.ok) {
      const updated = await res.json()
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, orderStatus: updated.orderStatus } : order
        )
      )
    } else {
      alert('❌ Failed to update status')
    }
  }

  const filteredOrders = orders
    .filter((order) => {
      const created = new Date(order.created_at)
      const inDateRange = created >= startDate && created <= endDate
      const matchesStatus = statusFilter ? order.orderStatus === statusFilter : true
      const matchesSearch = searchQuery.trim()
        ? order.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.phone.includes(searchQuery) ||
          order.products.some((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          order.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.paymentResult.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.orderStatus.toLowerCase().includes(searchQuery.toLowerCase()) 
        : true
      return inDateRange && matchesStatus && matchesSearch
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const visibleOrders = filteredOrders.slice(0, visibleCount)

    function SkeletonOrderCard() {
      return (
        <div className="border p-4 rounded bg-gradient-to-br from-gray-700/30 to-gray-900 shadow-sm animate-pulse space-y-4">
          <div className="h-5 bg-gray-600 rounded w-1/3" />
          <div className="h-4 bg-gray-700 rounded w-1/2" />
          <div className="h-4 bg-gray-700 rounded w-2/3" />
          <div className="space-y-2 mt-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-gray-700 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-3/4" />
                  <div className="h-4 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="h-4 bg-gray-600 rounded w-1/4" />
            <div className="h-10 bg-gray-700 rounded w-1/3" />
          </div>
        </div>
      )
    }

  const handleAddLocationWithMode = async (
  orderId: string,
  location: string,
  mode: 'train' | 'flight' | 'truck'
  ) => {
    const newEvent = {
      location,
      status: 'active',
      visible: true,
      timestamp: new Date().toLocaleString(),
      mode
    }

    const res = await fetch('/api/update-shipping-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, event: newEvent }),
    })

    if (res.ok) {
      const updated = await res.json()
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, shippingEvents: updated.shippingEvents } : order
        )
      )
    } else {
      alert('❌ Failed to add location')
    }
  }


  const normalizedGraph = bidirectionalGraph.map((edge) => ({
    ...edge,
    from: edge.from.toLowerCase(),
    to: edge.to.toLowerCase(),
  }))

  const validCities = Array.from(
  new Set(bidirectionalGraph.flatMap(edge => [edge.from, edge.to]))
).sort()


  function chooseOptimalRoute(graph: RouteEdge[],
  source: string,
  destination: string,
  weightKg: number): { type: 'cost-effective' | 'time-effective' | 'hybrid'; route: RouteEdge[] } {
  const timeEfficientRoute = findBestRoute(graph, source, destination, 'timeHr')
  const costEfficientRoute = findBestRoute(graph, source, destination, 'costPerKm')

  const highCost = timeEfficientRoute.reduce((sum, leg) => sum + getLegCost(leg, weightKg), 0)
  const lowCost = costEfficientRoute.reduce((sum, leg) => sum + getLegCost(leg, weightKg), 0)

  const fastTime = timeEfficientRoute.reduce((sum, leg) => sum + leg.timeHr, 0)
  const slowTime = costEfficientRoute.reduce((sum, leg) => sum + leg.timeHr, 0)

  const costDiff = highCost - lowCost
  const savingsPercent = (costDiff / highCost) * 100
  const hoursPer100Rs = (slowTime - fastTime) / (costDiff / 100)

  // Tier 1: High-cost routes
  if (highCost > 5000) {
    if (savingsPercent >= 5 && hoursPer100Rs <= 3.5) {
      return { type: 'cost-effective', route: costEfficientRoute }
    } else if (savingsPercent >= 5 && hoursPer100Rs > 3.5) {
      return { type: 'hybrid', route: timeEfficientRoute }
    } else {
      return { type: 'time-effective', route: timeEfficientRoute }
    }
  }

  // Tier 2: Mid-cost routes
  if (highCost > 3000) {
    if (savingsPercent >= 10 && hoursPer100Rs <= 2.5) {
      return { type: 'cost-effective', route: costEfficientRoute }
    } else {
      return { type: 'time-effective', route: timeEfficientRoute }
    }
  }

  // Tier 3: Low-cost routes
  return { type: 'time-effective', route: timeEfficientRoute }
}


const getLegCost = (leg: RouteEdge, weightKg: number) => {
  if (weightKg <= 0) return 0

  // Courier & semi-flat logic
  if (weightKg <= 20) return leg.distanceKm * 0.5 * (weightKg / 10)
  if (weightKg <= 100) return leg.distanceKm * leg.costPerKm * (weightKg / 10)

  // Full cargo logic — override costPerKm based on mode
  let ratePerKgKm = leg.costPerKm // fallback to original

  if (leg.mode === 'truck') ratePerKgKm = 4   // realistic 2025 truck cargo rate
  else if (leg.mode === 'train') ratePerKgKm = 3 // rail cargo rate
  else if (leg.mode === 'flight') ratePerKgKm = 8 // air cargo rate

  return leg.distanceKm * ratePerKgKm * weightKg
}



const calculateObjectTransferCost = (route: RouteEdge[], weightKg: number) =>
  route.reduce((sum, leg) => sum + getLegCost(leg, weightKg), 0)



  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        
        <div className="w-full flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 border border-gray-800 p-4 rounded-xl">
          <h1 className="text-3xl font-bold mb-5">🛠 Admin Orders</h1>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <label className="text-sm text-white">Start (Month/Year)</label>
                <input
                  type="month"
                  value={startDate.toISOString().slice(0, 7)}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-')
                    setStartDate(new Date(+year, +month - 1, 1))
                  }}
                  className="bg-gray-800 text-white px-2 py-1 rounded w-full sm:w-auto"
                />
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm text-white">End (Month/Year)</label>
                <input
                  type="month"
                  value={endDate.toISOString().slice(0, 7)}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-')
                    setEndDate(new Date(+year, +month, 0))
                  }}
                  className="bg-gray-800 text-white px-2 py-1 rounded w-full sm:w-auto"
                />
              </div>
            </div>

            <div className='flex flex-col gap-4'>  
            <div>
              <label className="text-sm text-white mr-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-800 text-white px-2 py-1 rounded w-full sm:w-auto"
              >
                <option value="">All</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-white mr-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buyer, phone, product..."
                className="bg-gray-800 text-white px-2 py-1 rounded w-full sm:w-auto"
              />
            </div>
            </div> 
                <div className='flex flex-col gap-2'>
            <button
            onClick={() => {
              setShowRouteModal(true)
            }}
            className="bg-purple-800 text-white px-3 py-2 rounded hover:bg-indigo-700"
          >
            Show Suggested Route
          </button>   

            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-800 text-gray-100 px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer"
            >
              Back to Dashboard
            </button>
            </div>
          </div>
        </div>

        {showRouteModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#1f1f1f] p-8 rounded-xl w-full max-w-md shadow-xl border border-gray-700 space-y-6">
              <h2 className="text-2xl font-bold text-white text-center">Find the Best Shipping Route</h2>

              {/* City Selectors */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Source City</label>
                  <select
                    value={sourceCity}
                    onChange={(e) => setSourceCity(e.target.value)}
                    className="bg-gray-800 text-white px-3 py-2 rounded w-full"
                  >
                    <option value="">Select source</option>
                    {validCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-300 block mb-1">Destination City</label>
                  <select
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="bg-gray-800 text-white px-3 py-2 rounded w-full"
                  >
                    <option value="">Select destination</option>
                    {validCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Route Type */}
              {selectedRouteType && (
                <p className="text-sm text-gray-400 text-center">
                  Recommended: {selectedRouteType === 'cost-effective' ? '💰 Cost Effective' : '⚡ Time Efficient'}
                </p>
              )}

              {/* Weight Input */}
              <div>
                <label className="text-sm text-gray-300 block mb-1">Parcel Weight (kg)</label>
                <input
                  type="number"
                  min={1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="bg-gray-800 text-white px-3 py-2 rounded w-full"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={() => {
                  const { type, route } = chooseOptimalRoute(
                    normalizedGraph,
                    sourceCity.trim().toLowerCase(),
                    destinationCity.trim().toLowerCase(),
                    weightKg
                  )
                  setRoutePlan(route)
                  setSelectedRouteType(type)
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full font-semibold"
              >
                Generate Route
              </button>

              {/* Cost Display */}
              <p className="text-sm text-gray-400 text-center">
                Estimated Cargo Cost: ₹{calculateObjectTransferCost(routePlan, weightKg).toFixed(0)}
              </p>

              {/* Route Breakdown */}
              {routePlan.length > 0 && (
                <div>
                  <h3 className="text-sm text-white mb-2 font-semibold">Suggested Route</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {routePlan.map((step, i) => (
                      <li key={i}>
                        {step.from} → {step.to} ({step.mode}, ~{step.timeHr} hrs, ₹{getLegCost(step, weightKg).toFixed(0)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowRouteModal(false)
                  setRoutePlan([])
                  setSourceCity('')
                  setDestinationCity('')
                }}
                className="text-sm text-gray-400 hover:text-white text-center w-full mt-4"
              >
                Close
              </button>
            </div>
          </div>
        )}



        {loading ? (
          <div className="space-y-6 max-w-6xl m-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonOrderCard key={i} />
            ))}
          </div>
          ) :filteredOrders.length === 0 ? (
            <p className="text-gray-500">No orders found.</p>
          ) : (
          <div className="space-y-6 max-w-6xl m-auto">
            {visibleOrders.map((order) => {

              
              

              return (
                
                <div key={order.id} className="flex flex-col sm:flex-row gap-5 justify-between  items-start border border-gray-500 p-4 rounded bg-gradient-to-br from-cyan-500/40 via-black/30 to-black/50 shadow-sm">
                  <div>
                  <div className=" flex gap-2 text-xl font-semibold text-white">
                    <span className="text-green-500">Order#</span><span>{order.id}</span>
                  </div>
                  <p className="text-sm text-gray-300">Placed on {new Date(order.created_at).toLocaleString()}</p>
                  <p className="text-sm text-indigo-100"><span className="text-blue-400">User Id: </span>{(order.user_id).slice(0,8)}</p>
                  <p className="text-sm text-indigo-300"><span className="text-green-500">Buyer: </span>{order.accountName}</p>
                  <p className="text-sm text-indigo-300"><span className="text-green-500">Phone: </span>{order.phone}</p>
                  <p className="text-sm text-indigo-300"><span className="text-green-500">Address: </span>{order.address}</p>
                  <p className="text-sm text-indigo-300"><span className="text-green-500">Pin: </span>{order.pin}</p>
                  <p
                  className={`text-sm ${
                    order.paymentResult === "pending"
                      ? "text-yellow-400"
                      : order.paymentResult === "success"
                      ? "text-green-400"
                      : order.paymentResult === "cancelled"
                      ?"text-red-400"
                      : "text-gray-200"
                  }`}
                >
                  <span className="text-gray-300">Payment Result:</span> {order.paymentResult}
                </p>
                  <p
                  className={`text-sm ${
                  order.orderStatus === "Order Placed"
                    ? "text-yellow-400"
                    : order.orderStatus === "Order Confirmed"
                    ? "text-blue-400"
                    : order.orderStatus === "Packed"
                    ? "text-blue-300 bg-green-700/40 w-fit pr-2"
                    : order.orderStatus === "Shipped"
                    ? "text-pink-400"
                    : order.orderStatus === "Out for Delivery"
                    ? "text-yellow-700 bg-purple-700/40 w-fit p-2 rounded-xl"
                    : order.orderStatus === "Cancelled"
                    ? "text-red-100 bg-red-700/40 w-fit pr-2"
                    : order.orderStatus === "Returned"
                    ? "text-gray-400 bg-gray-700/40 w-fit px-2 py-1"
                    : order.orderStatus === "Refund Initiated"
                    ? "text-gray-600"
                    : "text-white"
                }`}
                >
                  <span className='text-gray-300' >Order Status:</span> {order.orderStatus}
                </p>
                
                  <button className='px-2 py-1 my-2 shadow rounded-md bg-indigo-800 hover:bg-blue-700'
                    onClick={()=>{
                      router.push(`/orders/${order.id}/confirmation`)
                    }}
                  >
                    View Invoice
                  </button>

                  <div className="mt-4 space-y-2">
                    {order.products.map((product) => (
                      <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Image src={product.imageUrl} alt={product.name} width={64} height={64} className="rounded object-cover" />
                        <div>
                          <p className="font-semibold text-white">{product.name}</p>
                          <p className="text-sm text-gray-400">Qty: {product.quantity}</p>
                          <p className="text-sm text-green-300">₹{(product.price * product.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                    <p className=" text-indigo-400">subtotal: ₹{(order.payment - order.deliveryCharge).toLocaleString('en-IN')} + delivery: ₹{order.deliveryCharge}</p>
                    <p className="font-bold text-indigo-300">Total: ₹{(order.payment).toLocaleString('en-IN')}</p>
                  </div>
                  </div>

                  

                  <div className=" flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    
                    <div className="flex items-start gap-2">
                      <div className='flex flex-col gap-2'>
                        

                        {order.orderStatus === 'Shipped' && (
                          <ShippingLegManager
                            orderId={order.id}
                            shippingEvents={order.shippingEvents}
                            onAddLeg={handleAddLocationWithMode}
                          />
                        )}

                      </div>

                      <div className='flex flex-col gap-10'>

                        <div >
                        <label className="text-sm text-white block mb-2">Current Status</label>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className="bg-gray-800 text-white px-3 py-2 rounded"
                          >
                            {statusOptions.map((status) => (
                              <option
                                key={status}
                                value={status}
                                disabled={status === 'Order Placed' && order.orderStatus !== 'Order Placed'}
                                className={
                                  status === 'Order Placed' && order.orderStatus !== 'Order Placed'
                                    ? 'text-gray-500 bg-gray-900'
                                    : status === 'Cancelled'
                                    ? 'text-red-600 bg-gray-900'
                                    : ''
                                }
                              >
                                {status}
                              </option>
                            ))}
                          </select>
                          <button
                            className="rounded border p-1 ml-2"
                            onClick={() =>
                              setOpenNotesOrderId(openNotesOrderId === order.id ? null : order.id)
                            }
                          >
                            {openNotesOrderId === order.id ? "Close" : "Notes"}
                          </button>

                          {openNotesOrderId === order.id && (
                            <div className="mt-2">
                              <OrderNote orderId={order.id} />
                            </div>
                          )}

                        </div>

                      </div>
                    </div>
                  </div>
                  
                </div>
              )
            })}

    {visibleCount < filteredOrders.length && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 10)}
                        className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-600"
                      >
                        Load More
                      </button>
                    </div>
                  )}
          </div>
          
        )}
      </main>
    </>
  )
}
