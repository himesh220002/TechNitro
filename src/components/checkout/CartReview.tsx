'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/types/product'
import { Minus, Plus, Trash2, Tag } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CartReviewProps {
    items: (Product & { quantity: number })[]
    updateQuantity: (id: string, qty: number) => void
    removeItem: (id: string) => void
    couponCode: string
    setCouponCode: (code: string) => void
    discount: number
    setDiscount: (amount: number) => void
}

export default function CartReview({
    items,
    updateQuantity,
    removeItem,
    couponCode,
    setCouponCode,
    discount,
    setDiscount
}: CartReviewProps) {
    const [isApplying, setIsApplying] = useState(false)

    const applyCoupon = () => {
        if (!couponCode) return
        setIsApplying(true)

        // Simulate API call
        setTimeout(() => {
            if (couponCode.toUpperCase() === 'WELCOME10') {
                const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                const disc = Math.round(subtotal * 0.1)
                setDiscount(disc)
                toast.success('Coupon applied! You saved 10%.')
            } else {
                setDiscount(0)
                toast.error('Invalid coupon code')
            }
            setIsApplying(false)
        }, 800)
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">🛒 Review Cart</h2>

            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                        <div className="relative w-20 h-20 rounded-lg bg-gray-800 overflow-hidden shrink-0">
                            <Image src={item.imageUrl || '/placeholder.png'} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-white line-clamp-1">{item.name}</h3>
                                    <p className="text-sm text-gray-400">{item.category}</p>
                                </div>
                                <p className="font-bold text-white">₹{item.price.toLocaleString('en-IN')}</p>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-1">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-1 hover:text-white text-gray-400 transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-sm font-medium text-white min-w-[20px] text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.inventory}
                                        className="p-1 hover:text-white text-gray-400 transition-colors disabled:opacity-50"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coupon Section */}
            <div className="p-4 rounded-xl bg-gray-900/30 border border-gray-800 border-dashed">
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                    <Tag size={14} /> Have a coupon?
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter code (Try WELCOME10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                        onClick={applyCoupon}
                        disabled={!couponCode || isApplying}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors"
                    >
                        {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                </div>
                {discount > 0 && (
                    <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                        <Check size={12} /> Coupon applied successfully!
                    </p>
                )}
            </div>
        </div>
    )
}

import { Check } from 'lucide-react'
