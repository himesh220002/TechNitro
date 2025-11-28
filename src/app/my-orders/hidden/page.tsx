'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/components/Navbar'
import type { Order } from '@/types/order'
import Footer from '@/components/Footer'
import OrderList from '../components/OrderList'
import Link from 'next/link'

export default function HiddenOrdersPage() {
    const supabase = useMemo(() => createClientComponentClient(), [])
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const session = await supabase.auth.getSession()
            const token = session?.data?.session?.access_token

            const res = await fetch('/api/my-orders?hidden=true', {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : undefined
            })
            const data = await res.json()
            if (Array.isArray(data)) {
                setOrders(data)
            } else {
                setOrders([])
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [supabase.auth])

    return (
        <>
            <Navbar />
            <main className="max-w-6xl min-h-[500px] mx-auto p-3 sm:p-6">
                <div className='flex flex-col sm:flex-row gap-4 justify-between items-center mb-6'>
                    <div className="flex items-center gap-4">
                        <Link href="/my-orders" className="text-gray-400 hover:text-white">
                            ← Back to Orders
                        </Link>
                        <h1 className="text-xl sm:text-3xl font-bold ">🙈 Hidden Orders</h1>
                    </div>
                </div>

                <OrderList orders={orders} loading={loading} onUpdate={fetchOrders} />
            </main>
            <Footer />
        </>
    )
}
