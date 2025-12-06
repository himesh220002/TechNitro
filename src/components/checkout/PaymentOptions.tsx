'use client'

import { CreditCard, Smartphone, Banknote, ShieldCheck } from 'lucide-react'

interface PaymentOptionsProps {
    paymentMethod: string
    setPaymentMethod: (method: string) => void
}

export default function PaymentOptions({ paymentMethod, setPaymentMethod }: PaymentOptionsProps) {
    const methods = [
        {
            id: 'Bank',
            label: 'Credit / Debit Card',
            icon: CreditCard,
            desc: 'Secure payment via Razorpay',
            color: 'text-blue-400'
        },
        {
            id: 'UPI',
            label: 'UPI / Wallet',
            icon: Smartphone,
            desc: 'Pay using GPay, PhonePe, Paytm',
            color: 'text-purple-400'
        },
        {
            id: 'COD',
            label: 'Cash on Delivery',
            icon: Banknote,
            desc: 'Pay when you receive the order',
            color: 'text-green-400'
        }
    ]

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">💳 Payment Method</h2>

            <div className="grid gap-4">
                {methods.map((method) => (
                    <label
                        key={method.id}
                        className={`relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === method.id
                                ? 'bg-purple-500/10 border-purple-500 ring-1 ring-purple-500/50'
                                : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                            }`}
                    >
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
                        />

                        <div className={`p-3 rounded-lg bg-gray-800 ${method.color}`}>
                            <method.icon size={24} />
                        </div>

                        <div>
                            <p className="font-medium text-white">{method.label}</p>
                            <p className="text-sm text-gray-400">{method.desc}</p>
                        </div>

                        {paymentMethod === method.id && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500">
                                <ShieldCheck size={20} />
                            </div>
                        )}
                    </label>
                ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={18} />
                <div>
                    <p className="text-sm font-medium text-blue-300">100% Secure Payment</p>
                    <p className="text-xs text-blue-400/70 mt-1">
                        Your payment information is encrypted and secure. We do not store your card details.
                    </p>
                </div>
            </div>
        </div>
    )
}
