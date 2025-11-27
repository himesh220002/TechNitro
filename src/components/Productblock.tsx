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
    <div className="da w-full sm:w-auto ">
      <div className=" da-inner p-4 sm:p-6 bg-white dark:bg-gray-100 rounded-lg shadow relative h-full">
        <Link href={link} className="da-media flex items-center justify-start sm:justify-start gap-4 group">
          {/* Image */}
          <div className="da-media-left shrink-0">
            <Image
              src={imageUrl}
              alt={title}
              width={173}
              height={118}
              className="object-contain h-15 md:h-30 w-25 md:w-50"
              loading="lazy"
            />
          </div>

          {/* Text */}
          <div className=" flex flex-row sm:flex-col gap-2 justify-between items-center sm:items-start da-media-body group-hover:-translate-y-1 transition-transform duration-300">
            <div className="da-text text-sm md:text-lg text-gray-800 dark:text-gray-700 text-base leading-snug  ">
              {title.split('<br>').map((line, i) => (
                <div key={i}>
                  {line.includes('<strong>') ? (
                    <strong className="font-semibold text-lg md:text-xl text-black dark:text-gray-700 ">
                      {line.replace(/<[^>]+>/g, '')}
                    </strong>
                  ) : (
                    line
                  )}
                </div>
              ))}
            </div>

            {/* Action */}
            <div className="da-action mt-2 text-sm text-primary font-medium group-hover:underline">
              {discount ? (
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-600">
                  <span className="text-xs">Up to</span>
                  <span className="text-lg font-bold">{discount}%</span>
                  <span className="text-xs">off</span>
                </span>
              ) : (
                'Shop now'
              )}
            </div>
          </div>
        </Link>

        {/* Optional badge */}
        {badge && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded">
            {badge}
          </div>
        )}
      </div>
    </div>
  )
}

