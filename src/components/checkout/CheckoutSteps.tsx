'use client'

import { Check } from 'lucide-react'

interface CheckoutStepsProps {
    currentStep: number
    steps: string[]
}

export default function CheckoutSteps({ currentStep, steps }: CheckoutStepsProps) {
    return (
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-8 relative">
            {/* Progress Bar Background */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 -z-10 rounded-full" />

            {/* Active Progress Bar */}
            <div
                className="absolute top-1/2 left-0 h-1 bg-purple-600 -translate-y-1/2 -z-10 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, index) => {
                const stepNum = index + 1
                const isCompleted = stepNum < currentStep
                const isCurrent = stepNum === currentStep

                return (
                    <div key={step} className="flex flex-col items-center gap-2">
                        <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-gray-900 ${isCompleted
                                    ? 'border-purple-600 bg-purple-600 text-white'
                                    : isCurrent
                                        ? 'border-purple-500 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                                        : 'border-gray-700 text-gray-500'
                                }`}
                        >
                            {isCompleted ? <Check size={16} strokeWidth={3} /> : <span className="text-sm font-bold">{stepNum}</span>}
                        </div>
                        <span className={`text-xs sm:text-sm font-medium transition-colors ${isCurrent ? 'text-white' : isCompleted ? 'text-purple-400' : 'text-gray-600'
                            }`}>
                            {step}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
