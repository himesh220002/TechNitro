"use client";

import { useState, useEffect,  useMemo } from "react";
import Image from "next/image";
import { getImageProps } from "next/image";

export default function ProductGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  type LensPos = { x: number; y: number; width: number; height: number } | null;
  const [lensPos, setLensPos] = useState<LensPos>(null);

  const zoom = 2;

  const realURL = useMemo(() => {
    const { props } = getImageProps({
      src: images[currentIndex],
      alt: "zoom-img",
      width: 2000,
      height: 2000,
    });

    return props.src; 
  }, [currentIndex, images]);

  let thumbnailIndices: number[] = [];

  if (images.length === 1) {
    thumbnailIndices = [0];
  } else if (images.length === 2) {
    thumbnailIndices = [0, 1];
  } else {
    thumbnailIndices = [
      (currentIndex - 1 + images.length) % images.length,
      currentIndex,
      (currentIndex + 1) % images.length,
    ];
  }

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    }
  };

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentIndex((i) => (i + 1) % images.length);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setLensPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    });
  };

  const handleMouseLeave = () => setLensPos(null);


  const [isLargeScreen, setIsLargeScreen] = useState(false);

useEffect(() => {
  const check = () => setIsLargeScreen(window.innerWidth >= 1260);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);


  return (
    <div className="flex flex-col justify-between items-center">

      {/* MAIN IMAGE WITH LENS ZOOM */}
      <div
        className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-lg bg-white"
        onMouseMove={isLargeScreen ? handleMouseMove : undefined}
        onMouseLeave={isLargeScreen ? handleMouseLeave : undefined}
      >
        <Image
          src={images[currentIndex]}
          alt="product"
          fill
          className="object-cover"
        />

        {/* ZOOM LENS */}
        {isLargeScreen && lensPos && (
          <div
            className="absolute rounded-full border-2 border-gray-300 overflow-hidden pointer-events-none"
            style={{
              width: 200,
              height: 200,
              left: lensPos.x - 100,
              top: lensPos.y - 100,
              backgroundImage: `url(${realURL})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${lensPos.width * zoom}px ${lensPos.height * zoom}px`,
              backgroundPosition: `
                -${lensPos.x * zoom - 100}px
                -${lensPos.y * zoom - 100}px
              `,
            }}
          />
        )}
      </div>

      {/* CONTROLS + THUMBNAILS */}
      <div className="flex items-center gap-3 mt-4">

        {images.length > 1 && (
          <button
            onClick={prevImage}
            className="px-3 py-1 bg-gray-700 text-white rounded-xl text-center hover:bg-gray-800"
          >
            ◀
          </button>
        )}

        <div className="flex gap-2">
          {thumbnailIndices.map((idx) => (
            <div
              key={idx}
              className={`cursor-pointer border-2 rounded-md transition-all ${
                currentIndex === idx
                  ? "border-green-500 scale-105"
                  : "border-transparent"
              }`}
              onClick={() => setCurrentIndex(idx)}
            >
              <Image
                src={images[idx]}
                alt="thumbnail"
                width={70}
                height={50}
                className="object-cover w-[70px] h-[50px] rounded"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <button
            onClick={nextImage}
            className="px-3 py-1 bg-gray-700 text-white text-center rounded-xl hover:bg-gray-800"
          >
            ▶
          </button>
        )}
      </div>
    </div>
  );
}
