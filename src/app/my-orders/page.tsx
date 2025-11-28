//src/app/my-orders/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/components/Navbar'
import type { Order, ProductInOrder } from '@/types/order'
import Image from 'next/image'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
// import ShippingTimeline from '@/components/ShippingTimeline'
import { toast } from 'react-hot-toast'

// import ShippingTimeline from '@/components/ShippingTimeline'



export default function MyOrdersPage() {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [openCancelId, setOpenCancelId] = useState<string | null>(null);


  const cancelOrder = async (id: string) => {
  

  const res = await fetch('/api/update-order-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status: 'Cancelled' }),
  })

  if (res.ok) {
    const updated = await res.json()
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, orderStatus: updated.orderStatus } : order
      )
    )
  } else {
    alert('❌ Failed to cancel order')
  }
}



  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const session = await supabase.auth.getSession()
        const token = session?.data?.session?.access_token

        const res = await fetch('/api/my-orders', {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : undefined
        })
        const data = await res.json()
        if (Array.isArray(data)? data : []) {
          setOrders(data)
          console.log('Fetched orders:', data)
        } else {
          console.error('Unexpected /api/my-orders response:', data)
          setOrders([])
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [supabase.auth])

  function SkeletonOrderCard() {
  return (
    <div className="border border-gray-500 p-4 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-900 shadow-sm animate-pulse space-y-4">
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

  return (
    <>
      <Navbar />
      <main className="max-w-6xl min-h-[500px] mx-auto p-3 sm:p-6">
        <div className='flex flex-col sm:flex-row gap-1 justify-between items-center mb-6'>
        <h1 className="text-xl sm:text-3xl font-bold ">📦 My Orders</h1>
        <div className='flex gap-2 items-center'>
          <label className='text-sm sm:text-lg'> Track Order</label>
          <input
            type="text"
            placeholder="Enter Order ID"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const id = (e.target as HTMLInputElement).value.trim()
                if (id) {
                  router.push(`/track-order?id=${id}`)
                }
              }
            }}
            className=" sm:ml-4  px-2 py-1 sm:px-4 sm:py-2 rounded bg-gray-800 text-white"
          />
        </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonOrderCard key={i} />
            ))}
          </div>
        )
        : orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-3 border-gray-500 rounded-xl shadow-lg p-2 sm:p-4 rounded bg-gradient-to-b from-gray-700/30 to-gray-900 shadow-sm"
              >
                <h2 className="text-sm sm:text-xl font-semibold text-green-600"><span className='text-gray-300'>Order #</span>{order.id}</h2>
                <p className="text-sm text-gray-300">
                  Placed on {new Date(order.created_at).toLocaleString()}
                </p>
               <p
                className={`text-sm ${
                  order.paymentResult === "pending"
                    ? "text-yellow-400"
                    : order.paymentResult === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                <span className="text-gray-300">Payment Result:</span> {order.paymentResult}
              </p>

                <div className='flex justify-between items-end'>
                <p className={`text-sm ${
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
                }`}><span className='text-gray-300'>Status:</span> {order.orderStatus}</p>
                  
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown((prev) => (prev === order.id ? null : order.id))
                    }
                    className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
                  >
                    ⚙️ Actions
                  </button>

                  {openDropdown === order.id && (
                      <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded shadow z-20">
                      <button
                        onClick={() => {
                          if (['Order Placed', 'Order Confirmed', 'Packed'].includes(order.orderStatus)) {
                            setOpenCancelId(order.id)
                          }
                          // setOpenDropdown(null)
                        }}
                        disabled={!['Order Placed', 'Order Confirmed', 'Packed'].includes(order.orderStatus)}
                        title={
                          ['Order Placed', 'Order Confirmed', 'Packed'].includes(order.orderStatus)
                            ? ''
                            : 'Order has shipped — cancellation is disabled. You can apply for return later.'
                        }
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          ['Order Placed', 'Order Confirmed', 'Packed'].includes(order.orderStatus)
                            ? 'text-red-600 hover:bg-red-100'
                            : 'text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Cancel Order
                      </button>
                    {openCancelId === order.id && (
                      <div className="mt-2 p-4 bg-gray-800 rounded-lg border border-gray-600 space-y-3">
                        <p className="text-gray-200">Cancel this order?</p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              cancelOrder(order.id);
                              setOpenCancelId(null);
                              setOpenDropdown(null)
                            }}
                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
                          >
                            Yes, Cancel
                          </button>
                          <button
                            onClick={() => {setOpenCancelId(null)
                              setOpenDropdown(null)
                            }}
                            className="px-4 py-2 rounded bg-gray-600 text-gray-200 hover:bg-gray-500"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}


                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(order.id)
                            toast?.success?.('Order ID copied')
                            setOpenDropdown(null)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/20"
                        >
                          Copy Order ID
                        </button>
                        <button
                          onClick={() => {
                            router.push(`/orders/${order.id}/confirmation`)
                            setOpenDropdown(null)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/20"
                        >
                          View Invoice
                        </button>
                        

                      <button
                        onClick={() => {
                          router.push(`/track-order?id=${order.id}`)
                          setOpenDropdown(null)
                        }
                      }
                        className="block w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-blue-800"
                      >
                        Track Order
                      </button>
                    </div>
                  )}
                </div>



                </div>
                <div className="mt-4 space-y-2">
                  {order.products.map((product: ProductInOrder) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-semibold text-white">{product.name}</p>
                        <p className="text-sm text-gray-400">Qty: {product.quantity}</p>
                        <p className="text-sm text-green-300">
                          ₹{(product.price * product.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* {order.shippingEvents && order.shippingEvents.length > 0 && (
                  <div className="mt-4 border-t border-gray-700 pt-2">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      <span className="text-xs text-gray-400 whitespace-nowrap">📦</span>
                      <ShippingTimeline events={order.shippingEvents} compact={true} horizontal={true} />
                    </div>
                  </div>
                )} */}
                <div className="flex justify-between">
                <p className="mt-4 text-sm text-gray-300">
                  delivery: ₹{order.deliveryCharge.toLocaleString('en-IN')}
                </p>
                <p className="mt-4 text-right font-bold text-indigo-300">
                  Total: ₹{order.payment.toLocaleString('en-IN')}
                </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
