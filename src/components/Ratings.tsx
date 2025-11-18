// src/components/Ratings.tsx
export default function Ratings({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-2 text-yellow-400 text-sm">
      {'★'.repeat(Math.floor(rating)) + '☆'.repeat(10 - Math.floor(rating))}
      <span className="text-gray-300 ml-2">({rating.toFixed(1)})</span>
    </div>
  )
}
