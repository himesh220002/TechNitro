'use client'

import { Suspense } from 'react'
import ProductsPageContent from './ProductsPageContent'

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        }>
            <ProductsPageContent />
        </Suspense>
    )
}
