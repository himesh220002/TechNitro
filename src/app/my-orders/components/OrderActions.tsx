'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface OrderActionsProps {
    orderId: string
    isArchived?: boolean
    isHidden?: boolean
    onUpdate?: () => void
}

export default function OrderActions({ orderId, isArchived, isHidden, onUpdate }: OrderActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleAction = async (action: 'hide' | 'unhide' | 'archive' | 'unarchive') => {
        setLoading(true)
        try {
            const res = await fetch(`/api/orders/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            })

            if (!res.ok) throw new Error('Action failed')

            toast.success(`Order ${action}d successfully`)
            router.refresh()
            if (onUpdate) onUpdate()
        } catch (error) {
            toast.error('Something went wrong')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2 mt-2">
            {!isArchived && !isHidden && (
                <>
                    <button
                        onClick={() => handleAction('archive')}
                        disabled={loading}
                        className="text-left px-4 py-2 text-sm text-yellow-200 hover:bg-gray-700/20 w-full"
                    >
                        Archive Order
                    </button>
                    <button
                        onClick={() => handleAction('hide')}
                        disabled={loading}
                        className="text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-700/20 w-full"
                    >
                        Hide Order
                    </button>
                </>
            )}

            {isArchived && (
                <button
                    onClick={() => handleAction('unarchive')}
                    disabled={loading}
                    className="text-left px-4 py-2 text-sm text-green-300 hover:bg-gray-700/20 w-full"
                >
                    Unarchive Order
                </button>
            )}

            {isHidden && (
                <button
                    onClick={() => handleAction('unhide')}
                    disabled={loading}
                    className="text-left px-4 py-2 text-sm text-blue-300 hover:bg-gray-700/20 w-full"
                >
                    Unhide Order
                </button>
            )}
        </div>
    )
}
