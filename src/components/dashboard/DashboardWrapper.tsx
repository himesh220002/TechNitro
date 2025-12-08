'use client'

import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import MobileHeader from './MobileHeader'
import GradientBackground from '@/components/GradientBackground'

interface DashboardWrapperProps {
    children: React.ReactNode
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <GradientBackground>
            <div className="flex min-h-screen">
                <DashboardSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <main className="flex-1 lg:ml-64 w-full min-w-0">
                    <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
                    <div className="p-4 sm:p-6 lg:p-10">
                        {children}
                    </div>
                </main>
            </div>
        </GradientBackground>
    )
}
