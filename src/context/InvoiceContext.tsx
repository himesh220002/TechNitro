"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Order } from '@/types/order'

type InvoiceContextType = {
  orders: Order[]
  refresh: () => Promise<void>
  getOrder: (id?: string) => Order | undefined
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function useInvoiceContext() {
  const ctx = useContext(InvoiceContext)
  if (!ctx) throw new Error('useInvoiceContext must be used within InvoiceProvider')
  return ctx
}

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const supabase = createClientComponentClient()

  const fetchOrders = async () => {
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      const res = await fetch('/api/my-orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setOrders(data)
      }
    } catch (err) {
      console.error('InvoiceProvider: failed to fetch orders', err)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value: InvoiceContextType = {
    orders,
    refresh: fetchOrders,
    getOrder: (id?: string) => orders.find((o) => o.id === id),
  }

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
}

export default InvoiceContext
