'use client';

import React from 'react';
import { formatGBP } from '@/lib/pricing';
import { ShoppingBag, Check } from 'lucide-react';

interface StickyMobileBarProps {
  currentPrice: number;
  compareAtPrice: number;
  onAddToCart: () => void;
  isAdded: boolean;
  selectedColourName?: string;
}

export function StickyMobileBar({
  currentPrice,
  compareAtPrice,
  onAddToCart,
  isAdded,
  selectedColourName,
}: StickyMobileBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-3 sm:hidden shadow-lg transition-transform">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-neutral-900 leading-none">
              {formatGBP(currentPrice)}
            </span>
            {compareAtPrice > currentPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatGBP(compareAtPrice)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold truncate max-w-[140px]">
            {selectedColourName || 'Naples Collection'}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all min-h-[48px] cursor-pointer ${
            isAdded ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800 active:scale-98'
          }`}
          aria-label="Add configured bed to basket"
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5 text-white" />
              <span>Added to Basket</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>Add to Basket</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
