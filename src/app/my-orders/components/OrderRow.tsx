'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Order, ProductInOrder } from '@/types/order'
import OrderActions from './OrderActions'

interface OrderRowProps {
    order: Order
    onUpdate?: () => void
}

export default function OrderRow({ order, onUpdate }: OrderRowProps) {
    const router = useRouter()
    const [openDropdown, setOpenDropdown] = useState(false)
    const [openCancelId, setOpenCancelId] = useState<string | null>(null)

    const cancelOrder = async (id: string) => {
        const res = await fetch('/api/update-order-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'Cancelled' }),
        })

        if (res.ok) {
            toast.success('Order cancelled')
            router.refresh()
            if (onUpdate) onUpdate()
        } else {
            toast.error('Failed to cancel order')
        }
    }

    return (
        <div className="border border-3 border-gray-500 rounded-xl shadow-lg p-2 sm:p-4 bg-gradient-to-b from-gray-700/30 to-gray-900 shadow-sm">
            <h2 className="text-sm sm:text-xl font-semibold text-green-600">
                <span className="text-gray-300">Order #</span>{order.id}
            </h2>
            <p className="text-sm text-gray-300">
                Placed on {new Date(order.created_at).toLocaleString()}
            </p>
            <p
                className={`text-sm ${order.paymentResult === "pending"
                    ? "text-yellow-400"
                    : order.paymentResult === "success"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
            >
                <span className="text-gray-300">Payment Result:</span> {order.paymentResult}
            </p>

            <div className="flex justify-between items-end">
                <p className={`text-sm ${order.orderStatus === "Order Placed"
                    ? "text-yellow-400"
                    : order.orderStatus === "Order Confirmed"
                        ? "text-blue-400"
                        : order.orderStatus === "Packed"
                            ? "text-blue-300 bg-green-700/40 w-fit pr-2"
                            : order.orderStatus === "Shipping"
                                ? "text-pink-500"
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
                    }`}>
                    <span className="text-gray-300">Status:</span> {order.orderStatus}
                </p>

                {order.orderStatus === 'Shipping' && order.shippingEvents && order.shippingEvents.length > 0 && (
                    <div className="ml-2 flex flex-col items-start gap-1">
                        {(() => {
                            // Get the latest event (assuming events might not be sorted, sort by timestamp)
                            const latestEvent = [...order.shippingEvents].sort((a, b) =>
                                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                            ).pop();

                            if (!latestEvent) return null;

                            return (
                                <div className="flex items-center gap-2 text-xs sm:text-sm bg-gray-800/50 px-2 py-1 rounded border border-gray-600">
                                    <span className="text-gray-300 font-medium">{latestEvent.location}</span>

                                    {latestEvent.mode ? (
                                        <span className="bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/50 flex items-center gap-1">
                                            Departed via {latestEvent.mode === 'train' ? '🚆 Train' : latestEvent.mode === 'flight' ? '✈️ Flight' : '🚛 Truck'}
                                        </span>
                                    ) : (
                                        <span className="bg-green-900/40 text-green-300 px-1.5 py-0.5 rounded border border-green-800/50">
                                            Arrived
                                        </span>
                                    )}

                                    <span className="bg-red-600 text-white px-1.5 py-0.5 rounded font-bold tracking-wider text-[10px] uppercase">
                                        Current
                                    </span>
                                </div>
                            );
                        })()}
                    </div>
                )}

                <div className="relative">
                    <button
                        onClick={() => setOpenDropdown(!openDropdown)}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
                    >
                        ⚙️ Actions
                    </button>

                    {openDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded shadow z-20">
                            <button
                                onClick={() => {
                                    if (['Order Placed', 'Order Confirmed', 'Packed'].includes(order.orderStatus)) {
                                        setOpenCancelId(order.id)
                                    }
                                }}
                                disabled={!['Order Placed', 'Order Confirmed', 'Packed'].includes(order.orderStatus)}
                                className={`block w-full text-left px-4 py-2 text-sm ${['Order Placed', 'Order Confirmed', 'Packed'].includes(order.orderStatus)
                                    ? 'text-red-600 hover:bg-red-100'
                                    : 'text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Cancel Order
                            </button>

                            {openCancelId === order.id && (
                                <div className="mt-2 p-4 bg-gray-800 rounded-lg border border-gray-600 space-y-3 mx-2">
                                    <p className="text-gray-200">Cancel this order?</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                cancelOrder(order.id)
                                                setOpenCancelId(null)
                                                setOpenDropdown(false)
                                            }}
                                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => setOpenCancelId(null)}
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
                                    toast.success('Order ID copied')
                                    setOpenDropdown(false)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/20"
                            >
                                Copy Order ID
                            </button>

                            <button
                                onClick={() => {
                                    router.push(`/orders/${order.id}/confirmation`)
                                    setOpenDropdown(false)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/20"
                            >
                                View Invoice
                            </button>

                            <button
                                onClick={() => {
                                    router.push(`/track-order?id=${order.id}`)
                                    setOpenDropdown(false)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-blue-800"
                            >
                                Track Order
                            </button>

                            <div className="border-t border-gray-700 my-1"></div>

                            <OrderActions
                                orderId={order.id}
                                isArchived={order.isarchived}
                                isHidden={order.ishiddenforuser}
                                onUpdate={onUpdate}
                            />
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

            <div className="flex justify-between">
                <p className="mt-4 text-sm text-gray-300">
                    delivery: ₹{order.deliveryCharge.toLocaleString('en-IN')}
                </p>
                <p className="mt-4 text-right font-bold text-indigo-300">
                    Total: ₹{order.payment.toLocaleString('en-IN')}
                </p>
            </div>
        </div>
    )
}
