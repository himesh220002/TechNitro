"use client"

import { useEffect, useState, startTransition, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { v4 as uuid } from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Product } from '@/types/product'
import ContactForm from './ContactForm'
import PaymentForm from './PaymentForm'
import { MdRemoveCircle } from 'react-icons/md'
import LoadingBars from './ui/LoadingBar'

const supabase = createClientComponentClient()

export default function CheckoutClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const source = searchParams?.get('source')

  const [items, setItems] = useState<(Product & { quantity: number })[]>([])
  const [currentUser, setCurrentUser] = useState<unknown>(null)
  const [form, setForm] = useState({
    accountName: '',
    accountNumber: '',
    phone: '',
    address: '',
    pin: '',
    paymentMethod: 'Bank',
  })

  const [isPayLoading, setIsPayLoading] = useState(false)




 const formIsValid = useMemo(() => {
  return (
    form.accountName.trim() &&
    form.accountNumber.trim() &&
    form.phone.trim() &&
    form.address.trim() &&
    form.pin.trim() &&
    items.length > 0
  )
}, [form, items])




  useEffect(() => {
    const checkoutItem = localStorage.getItem('checkoutItem')
    const cart = localStorage.getItem('cart')
    startTransition(() => {
      if (source === 'buy-now' && checkoutItem) {
        setItems([JSON.parse(checkoutItem)])
      } else if (source === 'cart' && cart) {
        setItems(JSON.parse(cart))
      }
    })
  }, [source])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (mounted) setCurrentUser(user as unknown)
      } catch (err) {
        console.error('Failed to get supabase user in CheckoutClient', err)
      }
    })()
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
    })
    const subscription = (data as unknown as { subscription?: { unsubscribe?: () => void } })?.subscription
    return () => {
      mounted = false
      if (subscription?.unsubscribe) subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => console.log('Razorpay script loaded')
    document.body.appendChild(script)
  }, [])

  const updateQuantity = (id: string, qty: number) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, Math.min(qty, item.inventory)) } : item
    )
    setItems(updated)
    localStorage.setItem(items.length === 1 ? 'checkoutItem' : 'cart', JSON.stringify(items.length === 1 ? updated[0] : updated))
  }

  const removeItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id)
    setItems(updated)
    if (items.length === 1 && localStorage.getItem('checkoutItem')) {
      localStorage.removeItem('checkoutItem')
    } else {
      localStorage.setItem('cart', JSON.stringify(updated))
    }
  }

const deliveryCharge = calculateConsolidatedDeliveryCharge(items);

const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
const totalPaid = subtotal + deliveryCharge;


  const handlePayment = async () => {
    setIsPayLoading(true); 
    try{
    const session = await supabase.auth.getSession()
    const accessToken = session?.data?.session?.access_token
    const userId = ((currentUser as Record<string, unknown> | null)?.['id'] as string | undefined) ?? session?.data?.session?.user?.id
    if (!userId) {
      setIsPayLoading(false)
      alert('Please sign in before placing an order')
      router.push('/login')
      return
    }

    const productsRes = await fetch('/api/products')
    const latestProducts: Array<{ id: string; inventory: number }> = await productsRes.json()
    const inventoryMap = new Map(latestProducts.map((p) => [p.id, p.inventory]))
    for (const it of items) {
      const available = inventoryMap.get(it.id)
      if (!available || available < it.quantity) {
        alert(`Insufficient stock for ${it.name}`)
        return
      }
    }

    const razorRes = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: totalPaid }),
    })
    const { razorpayOrderId, razorpayKey } = await razorRes.json()

    const orderId = uuid()
    const newOrder = {
      id: orderId,
      userId,
      accountName: form.accountName,
      accountNumber: form.accountNumber,
      phone: form.phone,
      address: form.address,
      pin: form.pin,
      products: items,
      paymentMethod: form.paymentMethod,
      deliveryCharge,
      payment: totalPaid,
      paymentStatus: 'Order Placed',
      paymentResult: 'pending',
      createdAt: new Date().toISOString(),
    }

    await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(newOrder),
    })

    await new Promise((r) => setTimeout(r, 300))

    const options = {
      key: razorpayKey,
      amount: totalPaid * 100,
      currency: 'INR',
      name: 'Ecommerce Catalog',
      description: 'Order Payment',
      order_id: razorpayOrderId,
      handler: async function () {
        try {
          const res = await fetch('/api/orders/update-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, paymentResult: 'success' }),
          })
          const data = await res.json()
          console.log('Update-payment response:', data)
        } catch (err) {
          console.error('Failed to update paymentResult:', err)
        }
        localStorage.removeItem('cart')
        localStorage.removeItem('checkoutItem')
        setItems([])
        router.push(`/orders/${orderId}/confirmation`)
      },
      modal: {
        ondismiss: async function () {
          await fetch('/api/orders/update-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, paymentResult: 'cancelled' }),
          })
          alert('Payment cancelled. Your cart is preserved.')
        },
      },
      prefill: {
        name: form.accountName,
        contact: form.phone,
      },
      theme: {
        color: '#3399cc',
      },
    }

    const rzp = new window.Razorpay(options)
    setIsPayLoading(false)
    rzp.open()
    

    } catch (err) {
    setIsPayLoading(false)
    console.error(err)
    }
  }


  // --- Consolidated Delivery Charge Calculator ---
function calculateConsolidatedDeliveryCharge(items: { category: string; quantity: number  }[]) {
  
  const hasPremiumTransport = items.some(
    (item) => item.category === "Smartphones" || item.category === "Laptops" || item.category === "Tablets"
  );
  const transportTotal = hasPremiumTransport ? 800 : 500;

  // Packing + handling ranges per category (min–max)
  const packingCosts: Record<string, { min: number; max: number }> = {
    Laptops: { min: 600, max: 1000 },        // premium handling, insurance
    Smartphones: { min: 300, max: 500 },     // safe but light
    Tablets: { min: 400, max: 600 },         // medium weight
    Accessories: { min: 150, max: 300 }     // small, general safe
  };

  // Calculate packing total (quantity-aware)
  const packingTotalMin = items.reduce((sum, item) => {
    const cost = packingCosts[item.category]?.min || 200;
    return sum + cost * item.quantity;
  }, 0);

  const packingTotalMax = items.reduce((sum, item) => {
    const cost = packingCosts[item.category]?.max || 300;
    return sum + cost * item.quantity;
  }, 0);

  const meanCharge = transportTotal + Math.round((packingTotalMin + packingTotalMax) / 2);

  return meanCharge;
}




  return (
    <>
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">💳 Checkout</h1>

        {items.length === 0 ? (
          <p className="text-gray-500">No items selected for checkout.</p>
        ) : (
          <>
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border p-4 rounded bg-gradient-to-br from-blue-400/60 via-black/30 to-black/50 shadow-sm"
                >
                  <h2 className="text-xl font-semibold text-gray-300">{item.name}</h2>
                  <p className="text-green-700 font-medium">
                    ₹{item.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 bg-gray-700 text-white rounded"
                    >
                      −
                    </button>
                    <span className="font-medium text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.inventory}
                      className={`px-2 py-1 rounded ${
                        item.quantity >= item.inventory
                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          : 'bg-gray-700 text-white hover:bg-gray-800'
                      }`}
                    >
                      +
                    </button>

                    <span className="ml-auto text-sm sm:text-lg text-indigo-300 font-semibold">
                      Subtotal:{' '}
                      {(item.price * item.quantity).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      })}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-1 sm:ml-4 text-sm text-red-500 hover:text-red-700"
                    >
                      <MdRemoveCircle  className='text-xl'/>
                    </button>
                  </div>
                </div>
              ))}

              <div className="text-right font-medium text-indigo-300 mt-6 space-y-1">
                
                <div>Subtotal:{' '}
                  {subtotal.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </div>
                <div>Delivery Charges:{' '}
                  {deliveryCharge.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </div>
                <div className="text-xl font-bold text-green-400 pt-2">
                  Total Paid:{' '}
                  {totalPaid.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </div>


              </div>

            </div>

            <ContactForm onSave={(contactInfo) => setForm({ ...form, ...contactInfo })} />
            <PaymentForm
              accountName={form.accountName}
              accountNumber={form.accountNumber}
              paymentMethod={form.paymentMethod}
              onChange={(updated) => setForm({ ...form, ...updated })}
            />



            <div className="text-right max-w-6xl m-auto mt-6">
              {isPayLoading ? (
                  <LoadingBars />   // 🔥 Loader visible until razorpay shows up
                ) : (
              <button
                onClick={handlePayment}
                disabled={!formIsValid}
                className={`px-6 py-3 rounded transition ${
                            formIsValid
                              ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer '
                              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          }`}
              >
                Pay Now
              </button>
            )}
            </div>
          </>
        )}
      </main>
    </>
  )
}
