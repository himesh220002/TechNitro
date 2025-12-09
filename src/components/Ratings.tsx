// src/components/Ratings.tsx
export default function Ratings({ rating }: { rating: number }) {
  // Clamp rating to 0-5 range (safety check for old data before migration)
  const clampedRating = Math.max(0, Math.min(5, rating))
  const filledStars = Math.floor(clampedRating)
  const emptyStars = 5 - filledStars

  return (
    <div className="flex items-center gap-2 text-yellow-400 text-sm">
      {'★'.repeat(filledStars) + '☆'.repeat(emptyStars)}
      <span className="text-gray-300 ml-2">({clampedRating.toFixed(1)})</span>
    </div>
  )
}
