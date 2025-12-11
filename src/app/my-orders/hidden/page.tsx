'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/components/Navbar'
import type { Order } from '@/types/order'
import Footer from '@/components/Footer'
import OrderList from '../components/OrderList'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function HiddenOrdersPage() {
    const supabase = useMemo(() => createClientComponentClient(), [])
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const fetchOrders = useCallback(async () => {
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
    }, [supabase.auth])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    return (
        <>
            <Navbar />
            <main className="max-w-6xl min-h-[500px] mt-0 sm:mt-20 mx-auto p-3 sm:p-6 pt-24">
                <Breadcrumbs items={[
                    { label: 'My Orders', href: '/my-orders' },
                    { label: 'Hidden Orders', href: '/my-orders/hidden' },
                ]} />
                <div className='flex justify-start items-center m-6 mt-10'>
                    <h1 className="text-xl sm:text-3xl font-bold ">🙈 Hidden Orders</h1>
                </div>

                <OrderList orders={orders} loading={loading} onUpdate={fetchOrders} />
            </main>
            <Footer />
        </>
    )
}
