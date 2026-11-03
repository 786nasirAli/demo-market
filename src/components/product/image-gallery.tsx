'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/lib/types';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: ProductImage[];
  selectedColour?: string;
  productTitle: string;
}

export function ImageGallery({ images, selectedColour, productTitle }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Swipe handling for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // When selectedColour changes, switch to matching image if one exists
  useEffect(() => {
    if (selectedColour && images && images.length > 0) {
      const matchIndex = images.findIndex(
        (img) => img.associatedColour?.toLowerCase() === selectedColour.toLowerCase()
      );
      if (matchIndex !== -1) {
        setSelectedIndex(matchIndex);
      }
    }
  }, [selectedColour, images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-4/3 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400">
        No images available
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next image
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev image
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image Stage */}
      <div
        className="relative w-full aspect-4/3 sm:aspect-16/11 bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 select-none group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={currentImage.url}
          alt={currentImage.altText || productTitle}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-102"
        />

        {/* 50% OFF Badge */}
        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
          50% OFF
        </div>

        {/* Click to Enlarge Button (min 44x44px target) */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-neutral-800 p-2.5 rounded-full shadow-md backdrop-blur-xs transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Enlarge image"
        >
          <Maximize2 className="w-5 h-5 text-neutral-700" />
        </button>

        {/* Prev / Next arrows for desktop/tablet */}
        <button
          onClick={handlePrev}
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 p-2 rounded-full shadow-md backdrop-blur-xs transition-all min-w-[44px] min-h-[44px] items-center justify-center cursor-pointer opacity-80 hover:opacity-100"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 p-2 rounded-full shadow-md backdrop-blur-xs transition-all min-w-[44px] min-h-[44px] items-center justify-center cursor-pointer opacity-80 hover:opacity-100"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Mobile Swipe Indicator / Counter */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-xs sm:hidden">
          {selectedIndex + 1} / {images.length} (Swipe)
        </div>
      </div>

      {/* Thumbnail Gallery (min 44px tap area) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
        {images.map((img, idx) => {
          const isActive = idx === selectedIndex;
          return (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer min-w-[44px] min-h-[44px] ${
                isActive
                  ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                  : 'border-neutral-200 opacity-70 hover:opacity-100'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText || `Thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] w-full h-[70vh]">
            <Image
              src={currentImage.url}
              alt={currentImage.altText || productTitle}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
