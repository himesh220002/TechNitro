'use client'

import { useState } from 'react'
import { Star, ChevronDown, ChevronUp, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Reviews({ rating }: { rating: number }) {
    const [isOpen, setIsOpen] = useState(false)

    // Mock reviews data
    const reviews = [
        { id: 1, user: 'Alex M.', rating: 5, date: '2 days ago', comment: 'Absolutely amazing product! Exceeded my expectations.' },
        { id: 2, user: 'Sarah K.', rating: 4, date: '1 week ago', comment: 'Great quality, but shipping took a bit longer than expected.' },
        { id: 3, user: 'John D.', rating: 5, date: '2 weeks ago', comment: 'Best purchase I made this year. Highly recommended!' },
    ]

    return (
        <div className="mt-8 border-t border-gray-800 pt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">Customer Reviews</h2>
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-yellow-500 font-bold">{rating}</span>
                        <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-6 py-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white">{review.user}</div>
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            className={i < review.rating ? "text-yellow-500 fill-current" : "text-gray-600"}
                                                        />
                                                    ))}
                                                    <span className="ml-2">{review.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                                </div>
                            ))}

                            <button className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                                Load More Reviews
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
