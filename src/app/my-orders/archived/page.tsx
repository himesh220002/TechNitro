'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import type { Order } from '@/types/order'
import Footer from '@/components/Footer'
import OrderList from '../components/OrderList'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function ArchivedOrdersPage() {
    const supabase = createBrowserClient()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true)
            const session = await supabase.auth.getSession()
            const token = session?.data?.session?.access_token

            const res = await fetch('/api/my-orders?archived=true', {
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
    }, [supabase.auth])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    return (
        <>
            <Navbar />

            <main className="max-w-6xl min-h-screen mt-0 sm:mt-24 mx-auto p-3 sm:p-6 pt-24">
                <Breadcrumbs items={[{ label: 'Orders', href: '/my-orders' }, { label: 'Archived Orders' }]} />
                <div className='flex mb-6'>

                    <h1 className="text-xl sm:text-3xl font-bold ">🗄️ Archived Orders</h1>

                </div>

                <OrderList orders={orders} loading={loading} onUpdate={fetchOrders} />
            </main>
            <Footer />
        </>
    )
}
