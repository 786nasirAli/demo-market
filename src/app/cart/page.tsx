'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { formatGBP } from '@/lib/pricing';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
} from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-900 mb-2">Your Basket is Empty</h2>
          <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
            Configure your bespoke Prague Divan Bed with your preferred colour, size, storage, and headboard options.
          </p>
          <Link
            href="/products/prague-divan-bed-cream-naples"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors min-h-[44px]"
          >
            <span>Customise Prague Divan Bed</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8 text-neutral-900">
      <div className="max-w-7xl mx-auto">
        {/* Title & Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-neutral-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Shopping Basket
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Review your customized bed configurations before fake checkout.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Basket</span>
            </button>
            <Link
              href="/"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item, idx) => {
              const opts = item.selectedOptions;
              const colourOpt = opts['Colour'];
              const sizeOpt = opts['Size'];
              const storageOpt = opts['Storage'];
              const headboardOpt = opts['Headboard'];
              const baseOpt = opts['Base'];
              const assemblyOpt = opts['Assembly'];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between"
                >
                  {/* Item Image */}
                  <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-100">
                    <Image
                      src={item.productImage}
                      alt={item.productTitle}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg">
                        {item.productTitle}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* All Chosen Options Display (Strict Requirement) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-600 pt-1 border-t border-neutral-100">
                      {colourOpt && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-neutral-800">Colour:</span>
                          <span className="flex items-center gap-1 text-emerald-800 font-medium">
                            {colourOpt.swatchHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                                style={{ backgroundColor: colourOpt.swatchHex }}
                              />
                            )}
                            {colourOpt.label}
                          </span>
                        </div>
                      )}

                      {sizeOpt && (
                        <div>
                          <span className="font-semibold text-neutral-800">Size:</span>{' '}
                          <span>{sizeOpt.label} (+{formatGBP(sizeOpt.extraPrice)})</span>
                        </div>
                      )}

                      {storageOpt && (
                        <div>
                          <span className="font-semibold text-neutral-800">Storage:</span>{' '}
                          <span>
                            {storageOpt.label}{' '}
                            {storageOpt.extraPrice > 0
                              ? `(+${formatGBP(storageOpt.extraPrice)})`
                              : '(Included)'}
                          </span>
                        </div>
                      )}

                      {headboardOpt && (
                        <div>
                          <span className="font-semibold text-neutral-800">Headboard:</span>{' '}
                          <span>
                            {headboardOpt.label}{' '}
                            {headboardOpt.extraPrice > 0
                              ? `(+${formatGBP(headboardOpt.extraPrice)})`
                              : '(Included)'}
                          </span>
                        </div>
                      )}

                      {baseOpt && (
                        <div>
                          <span className="font-semibold text-neutral-800">Base:</span>{' '}
                          <span>
                            {baseOpt.label}{' '}
                            {baseOpt.extraPrice > 0
                              ? `(+${formatGBP(baseOpt.extraPrice)})`
                              : '(Included)'}
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="font-semibold text-neutral-800">Assembly:</span>{' '}
                        <span>
                          {assemblyOpt
                            ? `Professional Assembly (+${formatGBP(assemblyOpt.extraPrice)})`
                            : 'Standard Self-Assembly'}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Pricing */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      {/* Quantity Stepper (min 44px tap targets) */}
                      <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-neutral-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-neutral-200 text-neutral-600 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-neutral-900 min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-neutral-200 text-neutral-600 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Price & Unit Price */}
                      <div className="text-right">
                        <span className="text-xs text-neutral-500 block">
                          {item.quantity} × {formatGBP(item.unitPrice)}
                        </span>
                        <span className="text-lg font-extrabold text-neutral-900">
                          {formatGBP(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-6 sticky top-24">
              <h2 className="text-lg font-extrabold text-neutral-900">Order Summary</h2>

              <div className="space-y-3 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <span>Items Subtotal ({itemCount})</span>
                  <span className="font-bold text-neutral-900">{formatGBP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Standard UK Delivery</span>
                  <span className="font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Estimated VAT (20%)</span>
                  <span>Included</span>
                </div>
                <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-neutral-900">Total</span>
                  <span className="text-2xl font-black text-neutral-900">
                    {formatGBP(subtotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base shadow-md transition-all min-h-[52px]"
              >
                <span>Proceed to Fake Checkout</span>
                <ArrowRight className="w-5 h-5 text-emerald-400" />
              </Link>

              <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free room of choice delivery included</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Secure demo order processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
