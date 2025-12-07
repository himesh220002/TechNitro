'use client'

import { useEffect, useState, startTransition, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { v4 as uuid } from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Product } from '@/types/product'
import { motion, AnimatePresence } from 'framer-motion'
import CheckoutSteps from './checkout/CheckoutSteps'
import CartReview from './checkout/CartReview'
import AddressForm from './checkout/AddressForm'
import PaymentOptions from './checkout/PaymentOptions'
import OrderSummary from './checkout/OrderSummary'
import { toast } from 'react-hot-toast'
import { applyCouponToOrder } from '@/lib/coupons'

const supabase = createClientComponentClient()

type RazorpayHandlerResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export default function CheckoutClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const source = searchParams?.get('source')

  const [step, setStep] = useState(1)
  const [items, setItems] = useState<(Product & { quantity: number })[]>([])
  const [currentUser, setCurrentUser] = useState<unknown>(null)
  const [isPayLoading, setIsPayLoading] = useState(false)

  // Form State
  const [form, setForm] = useState({
    accountName: '',
    accountNumber: '', // Used for UPI/Wallet ID if needed
    phone: '',
    address: '',
    pin: '',
    paymentMethod: 'Bank',
  })

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [appliedCouponCode, setAppliedCouponCode] = useState('')

  // Load Cart
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

  // Load User
  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (mounted) setCurrentUser(user as unknown)
        } catch (err) {
          console.error('Failed to get supabase user', err)
        }
      })()
    return () => { mounted = false }
  }, [])

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
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
    if (updated.length === 0) {
      router.push('/products')
    }
  }

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const deliveryCharge = useMemo(() => {
    const hasPremiumTransport = items.some(
      (item) => ['Smartphones', 'Laptops', 'Tablets'].includes(item.category)
    )
    const transportTotal = hasPremiumTransport ? 800 : 500

    const packingCosts: Record<string, number> = {
      Laptops: 800,
      Smartphones: 400,
      Tablets: 500,
      Accessories: 200
    }

    const packingTotal = items.reduce((sum, item) => {
      const cost = packingCosts[item.category] || 200
      return sum + cost * item.quantity
    }, 0)

    return transportTotal + packingTotal
  }, [items])

  const totalPaid = Math.max(0, subtotal + deliveryCharge - discount)

  // Validation
  const isAddressValid = useMemo(() => {
    return (
      form.accountName.length >= 3 &&
      /^\d{10}$/.test(form.phone) &&
      form.address.length >= 10 &&
      /^\d{6}$/.test(form.pin)
    )
  }, [form])

  const isFormValid = useMemo(() => {
    if (step === 1) return items.length > 0
    if (step === 2) return isAddressValid
    if (step === 3) return true // Payment method is always selected
    return true
  }, [step, items, isAddressValid])

  const handlePayment = async () => {
    setIsPayLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const accessToken = session?.data?.session?.access_token
      const userId = ((currentUser as Record<string, unknown> | null)?.['id'] as string | undefined) ?? session?.data?.session?.user?.id

      if (!userId) {
        setIsPayLoading(false)
        toast.error('Please sign in before placing an order')
        router.push('/login')
        return
      }

      // Inventory Check
      const productsRes = await fetch('/api/products')
      const latestProducts: Array<{ id: string; inventory: number }> = await productsRes.json()
      const inventoryMap = new Map(latestProducts.map((p) => [p.id, p.inventory]))

      for (const it of items) {
        const available = inventoryMap.get(it.id)
        if (!available || available < it.quantity) {
          toast.error(`Insufficient stock for ${it.name}`)
          setIsPayLoading(false)
          return
        }
      }

      const orderId = uuid()

      // Create Order in DB
      const newOrder = {
        id: orderId,
        user_id: userId,
        accountName: form.accountName,
        accountNumber: form.accountNumber,
        phone: form.phone,
        address: form.address,
        pin: form.pin,
        products: items,
        paymentMethod: form.paymentMethod,
        deliveryCharge,
        payment: totalPaid,
        orderStatus: 'Order Placed',
        paymentResult: 'pending',
        coupon_code: appliedCouponCode || null,
        discount: discount || 0,
      }

      await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newOrder),
      })

      // Razorpay Flow (For Bank, UPI, Wallet)
      if (form.paymentMethod !== 'COD') {
        if (!(window as any).Razorpay) {
          toast.error('Payment gateway failed to load. Please refresh.')
          setIsPayLoading(false)
          return
        }

        const razorRes = await fetch('/api/create-razorpay-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalPaid }),
        })
        const { razorpayOrderId, razorpayKey } = await razorRes.json()

        const options = {
          key: razorpayKey,
          amount: totalPaid * 100,
          currency: 'INR',
          name: 'TechNitro',
          description: 'Order Payment',
          order_id: razorpayOrderId,
          handler: async function (response: RazorpayHandlerResponse) {
            await fetch('/api/orders/update-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                paymentResult: 'success',
                paymentid: response.razorpay_payment_id,
                razorpayorderid: response.razorpay_order_id,
                signature: response.razorpay_signature
              }),
            })

            localStorage.removeItem('cart')
            localStorage.removeItem('checkoutItem')

            // Track coupon usage
            if (appliedCouponCode) {
              const userId = localStorage.getItem('userId') || ''
              applyCouponToOrder(appliedCouponCode, userId, orderId)
            }

            router.push(`/orders/${orderId}/confirmation`)
          },
          modal: {
            ondismiss: async function () {
              await fetch('/api/orders/update-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, paymentResult: 'cancelled', paymentId: null }),
              })
              toast.error('Payment cancelled')
            },
          },
          prefill: {
            name: form.accountName,
            contact: form.phone,
          },
          theme: { color: '#7c3aed' },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      } else {
        // COD Simulation
        setTimeout(async () => {
          await fetch('/api/orders/update-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              paymentResult: 'success',
              paymentid: `COD_${Date.now()}`,
            }),
          })
          localStorage.removeItem('cart')
          localStorage.removeItem('checkoutItem')
          router.push(`/orders/${orderId}/confirmation`)
        }, 1500)
      }

    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsPayLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

        <CheckoutSteps currentStep={step} steps={['Cart', 'Address', 'Payment', 'Review']} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 && (
                  <CartReview
                    items={items}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    discount={discount}
                    setDiscount={setDiscount}
                    appliedCouponCode={appliedCouponCode}
                    setAppliedCouponCode={setAppliedCouponCode}
                  />
                )}
                {step === 2 && (
                  <AddressForm
                    form={form}
                    setForm={setForm}
                    isValid={isAddressValid}
                  />
                )}
                {step === 3 && (
                  <PaymentOptions
                    paymentMethod={form.paymentMethod}
                    setPaymentMethod={(m) => setForm({ ...form, paymentMethod: m })}
                  />
                )}
                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4">📝 Review Order</h2>
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Shipping to:</span>
                        <span className="text-right font-medium">{form.accountName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Address:</span>
                        <span className="text-right text-sm max-w-[200px]">{form.address}, {form.pin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Phone:</span>
                        <span className="text-right">{form.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Payment Method:</span>
                        <span className="text-right text-purple-400 font-medium">{form.paymentMethod}</span>
                      </div>
                    </div>
                    <CartReview
                      items={items}
                      updateQuantity={updateQuantity}
                      removeItem={removeItem}
                      couponCode={couponCode}
                      setCouponCode={setCouponCode}
                      discount={discount}
                      setDiscount={setDiscount}
                      appliedCouponCode={appliedCouponCode}
                      setAppliedCouponCode={setAppliedCouponCode}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              subtotal={subtotal}
              deliveryCharge={deliveryCharge}
              discount={discount}
              total={totalPaid}
              onCheckout={handlePayment}
              loading={isPayLoading}
              step={step}
              setStep={setStep}
              isFormValid={isFormValid}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

