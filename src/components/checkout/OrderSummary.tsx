'use client'

import { ArrowRight, Lock } from 'lucide-react'

interface OrderSummaryProps {
    subtotal: number
    deliveryCharge: number
    discount: number
    total: number
    onCheckout: () => void
    loading: boolean
    step: number
    setStep: (step: number) => void
    isFormValid: boolean
    onBack: () => void
}

export default function OrderSummary({
    subtotal,
    deliveryCharge,
    discount,
    total,
    onCheckout,
    loading,
    step,
    setStep,
    isFormValid,
    onBack
}: OrderSummaryProps) {
    return (
        <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 sticky top-24 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span>Delivery & Packing</span>
                    <span>₹{deliveryCharge.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                        <span>Discount</span>
                        <span>-₹{discount.toLocaleString()}</span>
                    </div>
                )}
                <div className="border-t border-gray-800 pt-4 flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                </div>
            </div>

            <div className="space-y-3">
                {step < 4 ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        disabled={!isFormValid}
                        className="w-full bg-gradient-to-l from-purple-600 via-purple-900 to-pink-600 text-white font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue
                    </button>
                ) : (
                    <button
                        onClick={onCheckout}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Place Order'
                        )}
                    </button>
                )}

                {step > 1 && (
                    <button
                        onClick={onBack}
                        className="w-full bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                        Back
                    </button>
                )}
            </div>

            <p className="text-xs text-gray-500 mt-6 text-center">
                Secure Checkout powered by Razorpay
            </p>
        </div>
    )
}
