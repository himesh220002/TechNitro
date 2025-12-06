'use client'

import Image from 'next/image'
import Link from 'next/link'

type ProductBlockProps = {
  title: string
  imageUrl: string
  link: string
  badge?: string
  discount?: number
}

export default function ProductBlock({
  title,
  imageUrl,
  link,
  badge,
  discount,
}: ProductBlockProps) {
  return (
    <div className="w-full sm:w-auto h-full">
      <Link
        href={link}
        className="group relative block h-full bg-gray-900 rounded-3xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 via-gray-900 to-black opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Badge */}
          {badge && (
            <div className="absolute top-4 right-4 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg transform group-hover:scale-110 transition-transform">
              {badge}
            </div>
          )}

          {/* Content Layout */}
          <div className="flex items-center justify-between gap-4 h-full">
            {/* Image */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-purple-500/20 transition-colors duration-500" />
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-contain drop-shadow-xl transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500"
                loading="lazy"
              />
            </div>

            {/* Text Content */}
            <div className="flex-1 flex flex-col justify-center items-start space-y-2">
              <div className="text-lg sm:text-xl text-white leading-tight font-medium">
                {title.split('<br>').map((line, i) => (
                  <span key={i} className="block">
                    {line.includes('<strong>') ? (
                      <strong className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:from-purple-200 group-hover:to-pink-200 transition-all">
                        {line.replace(/<[^>]+>/g, '')}
                      </strong>
                    ) : (
                      <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{line}</span>
                    )}
                  </span>
                ))}
              </div>

              {/* Action Area */}
              <div className="mt-2">
                {discount ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
                      Save {discount}%
                    </span>
                    <span className="text-xs text-gray-500 line-through">Shop Now</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
                    Explore <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

