'use client';

import React, { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/product-card';
import { ProductWithVariations } from '@/lib/types';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCw,
} from 'lucide-react';

const COLOUR_FILTERS = [
  { label: 'All Colours', value: 'all' },
  { label: 'Cream', value: 'Cream Naples', hex: '#F5F2EB' },
  { label: 'Seal Grey', value: 'Seal Grey Naples', hex: '#7D8184' },
  { label: 'Slate Grey', value: 'Slate Grey Naples', hex: '#4A4E51' },
  { label: 'Black', value: 'Black Naples', hex: '#1C1C1E' },
  { label: 'Mink', value: 'Mink Naples', hex: '#A89F91' },
  { label: 'Mauve', value: 'Mauve Naples', hex: '#8C7A87' },
];

const SIZE_FILTERS = [
  { label: 'All Sizes', value: 'all' },
  { label: 'Small Single (2FT6)', value: 'Small Single' },
  { label: 'Single (3FT)', value: 'Single 3FT' },
  { label: 'Small Double (4FT)', value: 'Small Double' },
  { label: 'Double (4FT6)', value: 'Double 4FT6' },
  { label: 'King (5FT)', value: 'King 5FT' },
  { label: 'Super King (6FT)', value: 'Super King' },
];

export default function HomePage() {
  const [products, setProducts] = useState<ProductWithVariations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedColour, setSelectedColour] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedColour !== 'all') params.set('colour', selectedColour);
      if (selectedSize !== 'all') params.set('size', selectedSize);
      if (maxPrice < 1000) params.set('maxPrice', String(maxPrice));

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedColour, selectedSize, maxPrice]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedColour('all');
    setSelectedSize('all');
    setMaxPrice(1000);
  };

  const activeFiltersCount =
    (search ? 1 : 0) +
    (selectedColour !== 'all' ? 1 : 0) +
    (selectedSize !== 'all' ? 1 : 0) +
    (maxPrice < 1000 ? 1 : 0);

  return (
    <main className="min-h-screen bg-neutral-50 pb-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Reference Product Available</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Handcrafted Divan Beds & Bespoke Bedroom Comfort
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore dynamic customisable beds with live price calculation. Choose custom Naples fabrics, storage drawers, floor-standing headboards, and white-glove assembly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto text-xs">
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block">Free UK Delivery</span>
                <span className="text-slate-300 text-[11px]">Direct to bedroom of choice</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block">5-Year Guarantee</span>
                <span className="text-slate-300 text-[11px]">British timber craftsmanship</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search Bar & Mobile Filter Trigger */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by bed title, Naples fabric, or storage option..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white text-neutral-900 font-medium placeholder:text-neutral-400 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[44px]"
            />
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-neutral-300 text-sm font-bold text-neutral-800 hover:bg-neutral-50 min-h-[44px] cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Filter Panel (Collapsible on mobile, visible on desktop) */}
        <div
          className={`bg-white rounded-2xl border border-neutral-200 p-5 mb-8 shadow-xs ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colour Swatch Filters */}
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-500 block mb-2.5">
                Filter by Colour
              </span>
              <div className="flex flex-wrap gap-2">
                {COLOUR_FILTERS.map((col) => {
                  const isActive = selectedColour === col.value;
                  return (
                    <button
                      key={col.value}
                      onClick={() => setSelectedColour(col.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all min-h-[44px] cursor-pointer ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {col.hex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-neutral-300 shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                      )}
                      <span>{col.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Filter Pills */}
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-500 block mb-2.5">
                Filter by Bed Size
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SIZE_FILTERS.map((sz) => {
                  const isActive = selectedSize === sz.value;
                  return (
                    <button
                      key={sz.value}
                      onClick={() => setSelectedSize(sz.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all min-h-[44px] cursor-pointer ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {sz.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Max Price Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                  Maximum Base Price
                </span>
                <span className="font-extrabold text-sm text-neutral-900">
                  £{maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="1000"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer min-h-[44px]"
              />
              <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                <span>£200</span>
                <span>£600</span>
                <span>£1000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count & Product Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>
              Showing <strong className="text-neutral-900">{products.length}</strong> product{products.length === 1 ? '' : 's'}
            </span>
            <span className="text-emerald-700 font-semibold">
              Category: Furniture &gt; Divan Beds
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-neutral-200" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
              <RotateCw className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="font-bold text-neutral-900 text-lg">No matching products found</h3>
              <p className="text-sm text-neutral-500 mt-1 mb-4">
                Try adjusting your search criteria or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
