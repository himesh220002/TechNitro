'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronDown, ChevronUp, User, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Review {
    id: string
    userId: string
    userName: string
    rating: number
    comment: string
    createdAt: string
}

export default function Reviews({ rating, reviewCount, productId }: { rating: number, reviewCount: number, productId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
    const supabase = createBrowserClient()
    const router = useRouter()

    const [editingReview, setEditingReview] = useState<Review | null>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    useEffect(() => {
        if (isOpen) {
            fetchReviews()
        }
    }, [isOpen])

    const fetchReviews = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`)
            if (res.ok) {
                const data = await res.json()
                setReviews(data)
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            toast.error('Please login to write a review')
            return
        }
        if (!newReview.comment.trim()) {
            toast.error('Please enter a comment')
            return
        }

        setSubmitting(true)
        try {
            const method = editingReview ? 'PUT' : 'POST'
            const body = editingReview ? {
                reviewId: editingReview.id,
                productId,
                rating: newReview.rating,
                comment: newReview.comment
            } : {
                productId,
                userId: user.id,
                userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                rating: newReview.rating,
                comment: newReview.comment
            }

            const res = await fetch('/api/reviews', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to submit review')
            }

            const savedReview = await res.json()

            if (editingReview) {
                setReviews(reviews.map(r => r.id === savedReview.id ? savedReview : r))
                setEditingReview(null)
                toast.success('Review updated successfully!')
            } else {
                setReviews([savedReview, ...reviews])
                toast.success('Review submitted successfully!')
            }

            setNewReview({ rating: 5, comment: '' })
            router.refresh() // Refresh server components to update product rating/count
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit review')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return

        try {
            const res = await fetch(`/api/reviews?reviewId=${reviewId}&productId=${productId}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error('Failed to delete review')

            setReviews(reviews.filter(r => r.id !== reviewId))
            toast.success('Review deleted successfully')

            // If we were editing this review, cancel edit
            if (editingReview?.id === reviewId) {
                setEditingReview(null)
                setNewReview({ rating: 5, comment: '' })
            }
            router.refresh() // Refresh server components
        } catch (error) {
            toast.error('Failed to delete review')
        }
    }

    const startEdit = (review: Review) => {
        setEditingReview(review)
        setNewReview({ rating: review.rating, comment: review.comment })
        // Scroll to form
        document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })
    }

    const userHasReview = user && reviews.some(r => r.userId === user.id)

    // Calculate average rating from fetched reviews if available, otherwise use prop
    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : rating

    // Use fetched reviews count if available (and open), otherwise prop
    const displayCount = reviews.length > 0 ? reviews.length : reviewCount

    return (
        <div className="mt-8 border-t border-gray-800 pt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <div className="flex items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors"><span className='hidden sm:inline'>Customer</span> Reviews</h2>
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-yellow-500 font-bold">{Math.min(5, averageRating).toFixed(1)}</span>
                        <span className="text-gray-400 text-sm">({displayCount} reviews)</span>
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
                            {/* Write/Edit Review Form */}
                            {user && (!userHasReview || editingReview) && (
                                <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-8">
                                    <h3 className="text-lg font-semibold text-white mb-4">
                                        {editingReview ? 'Edit Your Review' : 'Write a Review'}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-gray-400 text-sm">Rating:</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                                    className={`transition-colors ${star <= newReview.rating ? 'text-yellow-500 fill-current' : 'text-gray-600'}`}
                                                >
                                                    <Star size={20} className={star <= newReview.rating ? 'fill-current' : ''} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        placeholder="Share your thoughts about this product..."
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-purple-500 outline-none min-h-[100px] mb-4"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
                                        >
                                            <Send size={16} />
                                            {submitting ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
                                        </button>
                                        {editingReview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingReview(null)
                                                    setNewReview({ rating: 5, comment: '' })
                                                }}
                                                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}

                            {!user && (
                                <div className="bg-gray-800/30 rounded-xl p-6 text-center border border-gray-700/50 mb-8">
                                    <p className="text-gray-400">Please <a href="/login" className="text-purple-400 hover:underline">login</a> to write a review.</p>
                                </div>
                            )}

                            {/* Reviews List */}
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading reviews...</div>
                            ) : reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">{review.userName}</div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={12}
                                                                className={i < review.rating ? "text-yellow-500 fill-current" : "text-gray-600"}
                                                            />
                                                        ))}
                                                        <span className="ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {user && user.id === review.userId && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEdit(review)}
                                                        className="text-sm text-purple-400 hover:text-purple-300"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(review.id)}
                                                        className="text-sm text-red-400 hover:text-red-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review!</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
