import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/admin-supabase-server'
import { v4 as uuidv4 } from 'uuid'

// Helper to recalculate and update product rating
async function updateProductRating(productId: string) {
    console.log(`Recalculating rating for product: ${productId}`)

    // Fetch all reviews for this product
    const { data: productReviews, error: fetchError } = await supabaseAdmin
        .from('Review')
        .select('rating')
        .eq('productId', productId)

    if (fetchError) {
        console.error('Error fetching reviews for calculation:', fetchError)
        return
    }

    // Default values if no reviews
    let averageRating = 0
    let reviewCount = 0

    if (productReviews && productReviews.length > 0) {
        const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0)
        averageRating = Math.round((totalRating / productReviews.length) * 10) / 10
        reviewCount = productReviews.length
    } else {
        // If no reviews, we might want to keep the existing rating if it was set by admin?
        // But user said "rating is decided by admin", implying if reviews are 0, it's admin rating.
        // However, we don't have a separate column anymore.
        // So if reviewCount becomes 0 (all deleted), we probably just set it to 0 or leave it?
        // Let's set it to 0 for now as per "review_count is 0" logic.
        // Wait, user said "rating of the product = user rating > 0 ? user rating average : admin rating"
        // Since we dropped admin_rating, we can't revert to it.
        // So we will just set rating to 0 if count is 0.
        averageRating = 0
    }

    console.log(`New rating: ${averageRating}, Count: ${reviewCount}`)

    const { error: updateError } = await supabaseAdmin
        .from('Product')
        .update({
            rating: averageRating,
            review_count: reviewCount
        })
        .eq('id', productId)

    if (updateError) {
        console.error('Error updating product rating:', updateError)
    } else {
        console.log('Product rating updated successfully')
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { productId, rating, comment, userId } = body

        if (!productId || !rating || !comment || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check if user already reviewed this product
        const { data: existingReview } = await supabaseAdmin
            .from('Review')
            .select('id')
            .eq('userId', userId)
            .eq('productId', productId)
            .single()

        if (existingReview) {
            return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })
        }

        // Create the review
        const { data: review, error: reviewError } = await supabaseAdmin
            .from('Review')
            .insert({
                id: uuidv4(),
                productId,
                userId,
                userName: body.userName || 'User',
                rating: parseFloat(rating),
                comment,
            })
            .select()
            .single()

        if (reviewError) throw reviewError

        await updateProductRating(productId)

        return NextResponse.json(review)
    } catch (error) {
        console.error('Error creating review:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { reviewId, rating, comment, productId } = body

        if (!reviewId || !rating || !comment || !productId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { data: review, error: updateError } = await supabaseAdmin
            .from('Review')
            .update({
                rating: parseFloat(rating),
                comment,
                // Update createdAt to show it was edited? Or add updatedAt? 
                // For now, let's keep it simple.
            })
            .eq('id', reviewId)
            .select()
            .single()

        if (updateError) throw updateError

        await updateProductRating(productId)

        return NextResponse.json(review)
    } catch (error) {
        console.error('Error updating review:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const reviewId = searchParams.get('reviewId')
        const productId = searchParams.get('productId')

        if (!reviewId || !productId) {
            return NextResponse.json({ error: 'Missing reviewId or productId' }, { status: 400 })
        }

        const { error: deleteError } = await supabaseAdmin
            .from('Review')
            .delete()
            .eq('id', reviewId)

        if (deleteError) throw deleteError

        await updateProductRating(productId)

        return NextResponse.json({ message: 'Review deleted successfully' })
    } catch (error) {
        console.error('Error deleting review:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }

        const { data: reviews, error } = await supabaseAdmin
            .from('Review')
            .select('*')
            .eq('productId', productId)
            .order('createdAt', { ascending: false })

        if (error) throw error

        return NextResponse.json(reviews)
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
