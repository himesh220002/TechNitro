'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'

interface MobileHeaderProps {
    onMenuClick: () => void
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    return (
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                        TN
                    </div>
                    <span className="text-lg font-bold text-white">TechNitro</span>
                </Link>
            </div>
        </header>
    )
}
