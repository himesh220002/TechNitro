// src/app/orders/[id]/confirmation/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Order, ProductInOrder } from '@/types/order'
import Image from 'next/image'

export default function OrderConfirmationPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useParams()
  const orderId = searchParams?.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return
      try {
        const session = await supabase.auth.getSession()
        const token = session?.data?.session?.access_token
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        setOrder(data)
      } catch (err) {
        console.error('Failed to fetch order:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId, supabase.auth])

  if (loading) return <p className="p-6 text-gray-400">Loading confirmation…</p>
  if (!order) return <p className="p-6 text-red-500">Order not found.</p>

  const deliveryCharge = order.deliveryCharge ?? 0;
  const gstRate = 0.18;

  const subtotal = order.payment - deliveryCharge;
  const gstAmount = Math.round(subtotal - subtotal / (1 + gstRate));


  return (
  <main className="max-w-2xl mx-auto p-6">
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6 print:border-none print:shadow-none">
      <div className="text-center">
        <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
          ✅ Payment Successful
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Order Confirmation</h1>
        <p className="text-sm text-gray-500">Thank you for your purchase!</p>
      </div>

      <div className="text-sm text-gray-700 space-y-1">
        <p><span className="font-bold">Order ID:</span> <span className="font-mono">{order.id}</span></p>
        <p><span className="font-bold">Placed on:</span> {new Date(order.created_at).toLocaleString()}</p>
        <p><span className="font-bold">Payment Method:</span> {order.paymentMethod}</p>
        <p><span className="font-bold">Payment Status:</span> {order.paymentStatus}</p>
        <p><span className="font-bold">Payment Result:</span> {order.paymentResult}</p>
      </div>
      <div className="border-t border-gray-300 pt-4 text-sm text-gray-700 space-y-1">
        <p><span className="font-bold">Customer Name:</span> {order.accountName}</p>
        <p><span className="font-bold">Email:</span> {order.accountNumber}</p>
      </div>


      <div className="border-t border-gray-300 pt-4 space-y-4">
        {order.products.map((product: ProductInOrder) => (
          <div key={product.id} className="flex items-center gap-4">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={64}
              height={64}
              className="rounded border border-gray-300"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{product.name}</p>
              <p className="text-sm text-gray-500">Qty: {product.quantity}</p>
            </div>
            <div className="text-right font-medium text-gray-700">
              ₹{(product.price * product.quantity).toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>
      
        

      <div className="border-t border-gray-300 pt-4 text-right">
        <div className="text-right text-sm pt-4 text-gray-700 space-y-1">
          <p>Subtotal: ₹{(subtotal- order.deliveryCharge - gstAmount).toLocaleString('en-IN')}</p>
          <p>Included GST (approx.): ₹{gstAmount.toLocaleString('en-IN')}</p>
          <p>Delivery Charges: ₹{deliveryCharge.toLocaleString('en-IN')}</p>

          <p className="text-lg font-bold text-gray-800 pt-2">
            Total Paid: ₹{order.payment.toLocaleString('en-IN')}
          </p>
        </div>

      </div>

      <div className="border-t border-gray-300 pt-4 text-sm text-gray-700 space-y-1">
        <p><span className="font-bold">Items Ordered:</span> {order.products.reduce((sum, p) => sum + p.quantity, 0)}</p>
        <p><span className="font-bold">Delivery Address:</span> {order.address}, <span className='font-bold'>Pin:</span>{order.pin}</p>
        <p><span className="font-bold">Expected Delivery:</span> Within 3–5 business days</p>
      </div>


      <div className="text-right">
        <button
          onClick={() => router.push('/my-orders')}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          View All Orders
        </button>
      </div>

      <div>
        <div className="text-xs text-gray-500 text-center border-t border-gray-300 pt-4">
            This invoice serves as proof of purchase.<br />
            For support, contact <a href="mailto:versionname4@gmail.com" className="text-indigo-600 underline">versionname4@gmail.com</a>.
          </div>

        <div className="text-sm text-center text-gray-600">
            Need help? Call us at <span className="font-semibold  text-gray-800">+91-80008-454545</span>
        </div>
      </div>

        
          
        <div className="flex justify-between mt-6 border-t border-gray-300 pt-4  gap-3">
            <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300"
            >
            🖨️ Print Receipt
            </button>
            <button
            onClick={() => {
              const img = document.createElement('img')
              img.src = `${location.origin}/LogoTechNitroFlat.png`
              img.onload = () => {  
              const printWindow = window.open('', '_blank')
                if (printWindow) {
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>Invoice - ${order.id}</title>
                        <style>
                        body { font-family: sans-serif; padding: 2rem; }
                        h1 { color: green; }
                        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                        td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        .total { text-align: right; font-weight: bold; }
                        .subtotal{ text-align:right;}
                        </style>
                    </head>
                    <body>
                        <!-- Watermark -->
                        
                          <img
                            src="${img.src}"
                            alt="Watermark"
                            style="
                              position: fixed;
                              top: 40%;
                              left: 50%;
                              transform: translate(-50%, -50%) rotate(-30deg);
                              opacity: 0.05;
                              width: 400px;
                              pointer-events: none;
                              z-index: 0;
                            "
                          />


                        <!-- Header -->
                        <div style="text-align: center; z-index: 1; position: relative;">
                          <img src="${img.src}" alt="Company Logo" style="height: 40px; margin-bottom: 0.5rem;" />
                          <p style="font-size: 18px; font-weight: bold; color: #333;">Ecommerce Catalog Pvt. Ltd.</p>
                        </div>

                        <h1 style="margin-bottom: 0;">Invoice</h1>
                       
                        <div style="display: flex; gap: 2rem; ">
                        <div style= "border: 1px solid black; padding:10px;">
                        <p><strong>Order ID:</strong> ${order.id}</p>
                        <p><strong>Placed on:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                        <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
                        </div>
                        <div style= "border: 1px solid black; padding:10px;">
                        <p><strong>Payment Result:</strong> ${order.paymentResult}</p>
                        <p><strong>Items Ordered:</strong> ${order.products.reduce((sum, p) => sum + p.quantity, 0)}</p>
                        <p><strong>Delivery Address:</strong> ${order.address}, ${order.pin}</p>
                        <p><strong>Expected Delivery:</strong> Within 3–5 business days</p>
                        </div></div>
                        <p><strong>Customer Name:</strong> ${order.accountName}</p>
                        <p><strong>Email:</strong> ${order.accountNumber}</p>
                        <table>
                        <thead>
                            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                        </thead>
                        <tbody>
                            ${order.products.map(p => `
                            <tr>
                                <td>${p.name}</td>
                                <td>${p.quantity}</td>
                                <td>₹${p.price.toLocaleString('en-IN')}</td>
                                <td>₹${(p.price * p.quantity).toLocaleString('en-IN')}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                        </table>
                        <p class="subtotal">Subtotal: ₹${(order.payment - order.deliveryCharge - gstAmount).toLocaleString('en-IN')}</p>
                        <p class="subtotal">Included GST (approx.): ₹${gstAmount.toLocaleString('en-IN')}</p>
                        <p class="subtotal">Delivery Charges: ₹${order.deliveryCharge.toLocaleString('en-IN')}</p>
                        <p class="total">Total Paid: ₹${order.payment.toLocaleString('en-IN')}</p>

                        <p style="font-size: 12px; color: #666; margin-top: 2rem;">
                          This invoice serves as proof of purchase.<br />
                          For support, contact versionname4@gmail
                        </p>
                        
                    </body>
                    </html>
                `)
                printWindow.document.close()
                printWindow.onload = () => {
                  setTimeout(() => {
                    printWindow.focus()
                    printWindow.print()
                  }, 500) // 500ms delay ensures image is rendered
                }
                }
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
            📥 Download Invoice
            </button>
        </div>
        


    </div>
  </main>
)

}
