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
    isFormValid
}: OrderSummaryProps) {

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1)
        } else {
            onCheckout()
        }
    }

    const getButtonText = () => {
        if (loading) return 'Processing...'
        switch (step) {
            case 1: return 'Proceed to Address'
            case 2: return 'Proceed to Payment'
            case 3: return 'Review Order'
            case 4: return `Pay ₹${total.toLocaleString('en-IN')}`
            default: return 'Next'
        }
    }

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm sticky top-24">
            <h3 className="text-lg font-bold text-white mb-6">Order Summary</h3>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400 text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-gray-400 text-sm">
                    <span>Delivery Charges</span>
                    <span className="text-green-400">
                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                </div>

                {discount > 0 && (
                    <div className="flex justify-between text-green-400 text-sm">
                        <span>Discount</span>
                        <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                )}

                <div className="flex justify-between text-gray-400 text-sm">
                    <span>Tax (GST included)</span>
                    <span>₹{Math.round(subtotal * 0.18).toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t border-gray-800 pt-3 mt-3">
                    <div className="flex justify-between items-end">
                        <span className="text-white font-medium">Total Amount</span>
                        <span className="text-2xl font-bold text-white">
                            ₹{total.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleNext}
                disabled={!isFormValid || loading}
                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${!isFormValid || loading
                        ? 'bg-gray-700 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25'
                    }`}
            >
                {step === 4 && <Lock size={18} />}
                {getButtonText()}
                {step < 4 && <ArrowRight size={18} />}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
                By placing this order, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
    )
}
