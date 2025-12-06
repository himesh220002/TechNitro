'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FAQ() {
    const faqs = [
        { q: "Is this product authentic?", a: "Yes, we are an authorized retailer and all our products are 100% authentic and come with original manufacturer warranty." },
        { q: "What is the return policy?", a: "We offer a hassle-free 7-day return policy. If you are not satisfied with your purchase, you can return it for a full refund or exchange." },
        { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days. Express shipping is available for delivery within 1-2 business days." },
        { q: "Do you offer EMI options?", a: "Yes, we offer EMI options on major credit cards. You can see the breakdown on the product page." },
    ]

    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <div className="mt-12 border-t border-gray-800 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <HelpCircle className="text-purple-400" />
                Frequently Asked Questions
            </h2>
            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
                        <button
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition-colors"
                        >
                            <span className="font-medium text-gray-200">{faq.q}</span>
                            {openIndex === idx ? <ChevronUp className="text-purple-400" /> : <ChevronDown className="text-gray-500" />}
                        </button>
                        <AnimatePresence>
                            {openIndex === idx && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                >
                                    <div className="p-4 pt-0 text-gray-400 leading-relaxed border-t border-gray-700/30">
                                        {faq.a}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    )
}
