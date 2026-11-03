'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductWithVariations } from '@/lib/types';
import { formatGBP, calculateDiscountPercent } from '@/lib/pricing';
import { Star, ArrowRight } from 'lucide-react';

export function ProductCard({ product }: { product: ProductWithVariations }) {
  const mainImage = product.images?.[0] || { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80', altText: product.title };
  const discount = calculateDiscountPercent(product.basePrice, product.compareAtPrice);

  const colourGroup = product.variationGroups?.find((g) => g.name.toLowerCase() === 'colour');
  const colourSwatches = colourGroup?.options?.slice(0, 6) || [];

  return (
    <div className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-4/3 overflow-hidden bg-neutral-100">
        <Image
          src={mainImage.url}
          alt={mainImage.altText || product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* 50% OFF Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {discount}% OFF
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
          {product.category?.name || 'Furniture'}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Swatch Preview Bar */}
          {colourSwatches.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              {colourSwatches.map((swatch) => (
                <span
                  key={swatch.id}
                  className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs"
                  style={{ backgroundColor: swatch.swatchHex || '#ccc' }}
                  title={swatch.label}
                />
              ))}
              {colourGroup && colourGroup.options.length > 6 && (
                <span className="text-[10px] text-neutral-500 font-semibold">
                  +{colourGroup.options.length - 6}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-extrabold text-neutral-900 group-hover:text-emerald-700 transition-colors line-clamp-2 text-base sm:text-lg">
              {product.title}
            </h3>
          </Link>

          {/* Rating & Seller */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-500">
            <div className="flex items-center text-amber-500 font-bold gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>4.9</span>
            </div>
            <span>•</span>
            <span>Sold by <strong className="text-neutral-700">{product.seller?.storeName || 'Demo Seller'}</strong></span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-neutral-900">
                From {formatGBP(product.basePrice)}
              </span>
            </div>
            {product.compareAtPrice > product.basePrice && (
              <span className="text-xs text-neutral-400 line-through block">
                RRP {formatGBP(product.compareAtPrice)}
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-colors min-h-[44px]"
            aria-label={`Customise ${product.title}`}
          >
            <span>Customise</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
