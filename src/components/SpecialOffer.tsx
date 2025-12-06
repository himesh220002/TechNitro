'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Timer, ArrowRight } from 'lucide-react'

export default function SpecialOffer() {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-black border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
                <div className="flex-1 space-y-6 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    >
                        <Timer size={16} />
                        <span className="text-sm font-bold uppercase tracking-wider">Limited Time Offer</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
                    >
                        Gaming <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Revolution</span> Sale
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-300 text-lg md:text-xl max-w-xl mx-auto md:mx-0"
                    >
                        Upgrade your setup with premium gear. Get up to <span className="text-white font-bold">40% OFF</span> on selected gaming peripherals.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                    >
                        <Link
                            href="/products?category=Gaming"
                            className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                            Shop Now <ArrowRight size={20} />
                        </Link>
                        <div className="flex items-center justify-center gap-4 px-6 py-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">02</div>
                                <div className="text-xs text-gray-400 uppercase">Days</div>
                            </div>
                            <div className="text-2xl font-bold text-gray-600">:</div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">14</div>
                                <div className="text-xs text-gray-400 uppercase">Hours</div>
                            </div>
                            <div className="text-2xl font-bold text-gray-600">:</div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">45</div>
                                <div className="text-xs text-gray-400 uppercase">Mins</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 relative w-full max-w-md aspect-square"
                >
                    {/* Placeholder for a promotional image - using a generic tech image or gradient shape if no specific image available */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                        {/* Using one of the existing images as a placeholder */}
                        <Image
                            src="/razorheadphone.png"
                            alt="Special Offer Product"
                            width={500}
                            height={500}
                            className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
