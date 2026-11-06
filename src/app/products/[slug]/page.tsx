'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ImageGallery } from '@/components/product/image-gallery';
import { VariationSelector } from '@/components/product/variation-selector';
import { StickyMobileBar } from '@/components/product/sticky-mobile-bar';
import { useCart } from '@/context/cart-context';
import { ProductWithVariations, SelectedOptionDetail } from '@/lib/types';
import {
  calculateDynamicPrice,
  formatGBP,
  calculateDiscountPercent,
} from '@/lib/pricing';
import {
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  Check,
  ChevronRight,
  Info,
  Clock,
} from 'lucide-react';

function ProductDetailContent({ slug }: { slug: string }) {
  const [product, setProduct] = useState<ProductWithVariations | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, SelectedOptionDetail>>({});
  const [assemblyChecked, setAssemblyChecked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const { addItem } = useCart();

  // Fetch product data
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products?status=approved`);
        const json = await res.json();
        let match = null;
        if (json.success && json.data) {
          match = json.data.find(
            (p: ProductWithVariations) => p.slug === slug || p.id === slug
          );
        }

        if (!match) {
          try {
            const localItems = JSON.parse(localStorage.getItem('demo_local_products') || '[]');
            match = localItems.find((p: any) => p.slug === slug || p.id === slug) || null;
          } catch (e) {}
        }

        if (match) {
            setProduct(match);

            // Initialize default options from the database
            const defaults: Record<string, SelectedOptionDetail> = {};
            match.variationGroups.forEach((group: any) => {
              if (group.name.toLowerCase() === 'assembly') return;
              const defaultOpt =
                group.options.find((o: any) => o.isDefault) || group.options[0];
              if (defaultOpt) {
                defaults[group.name] = {
                  groupId: group.id,
                  groupName: group.name,
                  optionId: defaultOpt.id,
                  label: defaultOpt.label,
                  extraPrice: defaultOpt.extraPrice,
                  swatchHex: defaultOpt.swatchHex,
                };
              }
            });
            setSelectedOptions(defaults);
          }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 w-48 bg-neutral-200 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-4/3 bg-neutral-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-10 bg-neutral-200 rounded-md" />
            <div className="h-6 w-32 bg-neutral-200 rounded-md" />
            <div className="h-40 bg-neutral-200 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  // Handle Option selection
  const handleSelectOption = (groupName: string, detail: SelectedOptionDetail) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupName]: detail,
    }));
  };

  // Handle Assembly add-on
  const handleToggleAssembly = (checked: boolean) => {
    setAssemblyChecked(checked);
    const assemblyGroup = product.variationGroups.find(
      (g) => g.name.toLowerCase() === 'assembly'
    );
    const assemblyOpt = assemblyGroup?.options[0];

    if (checked && assemblyGroup && assemblyOpt) {
      setSelectedOptions((prev) => ({
        ...prev,
        Assembly: {
          groupId: assemblyGroup.id,
          groupName: 'Assembly',
          optionId: assemblyOpt.id,
          label: assemblyOpt.label,
          extraPrice: assemblyOpt.extraPrice,
        },
      }));
    } else {
      setSelectedOptions((prev) => {
        const copy = { ...prev };
        delete copy['Assembly'];
        return copy;
      });
    }
  };

  // Calculate live dynamic price
  const optionsList = Object.values(selectedOptions);
  const currentPrice = calculateDynamicPrice(product.basePrice, optionsList);
  const discountPercent = calculateDiscountPercent(currentPrice, product.compareAtPrice);

  // Dynamic Title: Prague Divan Bed – [Selected Colour]
  const selectedColour = selectedOptions['Colour']?.label;
  const dynamicTitle = selectedColour
    ? `Prague Divan Bed – ${selectedColour}`
    : product.title;

  // Add to basket action
  const handleAddToCart = () => {
    addItem(product, selectedOptions, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 sm:pb-16 text-neutral-900">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            {product.category?.name || 'Furniture > Divan Beds'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-neutral-900 truncate max-w-[200px] sm:max-w-none">
            {dynamicTitle}
          </span>
        </nav>
      </div>

      {/* Main Product Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery (At least 5 photos + swipe + zoom) */}
          <div className="lg:col-span-7">
            <div className="sticky top-20">
              <ImageGallery
                images={product.images}
                selectedColour={selectedColour}
                productTitle={dynamicTitle}
              />

              {/* Value Props & Assurance */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-neutral-200 text-center text-xs">
                <div className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-neutral-200">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold">Free Room Delivery</span>
                  <span className="text-neutral-500 text-[10px]">Within 3-5 Working Days</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-neutral-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold">5 Year Warranty</span>
                  <span className="text-neutral-500 text-[10px]">Solid Timber Guarantee</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-neutral-200">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold">Handcrafted UK</span>
                  <span className="text-neutral-500 text-[10px]">Custom Made to Order</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customiser Engine & Purchasing */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Header: Title, Seller & Rating */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  In Stock & Handcrafted
                </span>
                <span className="text-xs text-neutral-500">
                  Seller: <strong>{product.seller?.storeName || 'Demo Seller'}</strong>
                </span>
              </div>

              {/* Dynamic Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                {dynamicTitle}
              </h1>

              {/* Reviews preview */}
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-neutral-900">4.9 / 5</span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">142 Verified Bedroom Reviews</span>
              </div>
            </div>

            {/* Dynamic Price Block */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-baseline justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                    {formatGBP(currentPrice)}
                  </span>
                  {product.compareAtPrice > currentPrice && (
                    <span className="text-sm sm:text-base text-neutral-400 line-through">
                      RRP {formatGBP(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-500 mt-1 block">
                  Includes VAT & Selected Options Breakdown
                </span>
              </div>

              {discountPercent > 0 && (
                <div className="bg-red-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Variation Selector (Database Driven Options & Prices) */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
              <VariationSelector
                groups={product.variationGroups}
                selectedOptions={selectedOptions}
                onSelectOption={handleSelectOption}
                onToggleAssembly={handleToggleAssembly}
                assemblyChecked={assemblyChecked}
              />
            </div>

            {/* Desktop Add to Basket CTA */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-extrabold text-base text-white shadow-md transition-all cursor-pointer min-h-[52px] ${
                  isAdded
                    ? 'bg-emerald-600 ring-2 ring-emerald-500/50'
                    : 'bg-slate-900 hover:bg-slate-800 active:scale-99'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 text-white" />
                    <span>Bed Added to Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 text-emerald-400" />
                    <span>Add to Basket – {formatGBP(currentPrice)}</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-neutral-500 flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-neutral-400" />
                <span>Configure multiple combinations – each creates its own cart line</span>
              </p>
            </div>

            {/* Product Description & Highlights */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-700">
                Product Description
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>
              <ul className="text-xs text-neutral-600 space-y-1.5 list-disc list-inside pt-2 border-t border-neutral-100">
                <li>Upholstered in genuine high-durability Naples soft-touch fabric</li>
                <li>Choice of multiple underbed storage drawer combinations</li>
                <li>Supplied with standard or 100-stone reinforced solid platform base</li>
                <li>Precision hand-built in Yorkshire, United Kingdom</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile Screen (Requirement 3.2) */}
      <StickyMobileBar
        currentPrice={currentPrice}
        compareAtPrice={product.compareAtPrice}
        onAddToCart={handleAddToCart}
        isAdded={isAdded}
        selectedColourName={selectedColour}
      />
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
          <div className="h-6 w-48 bg-neutral-200 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-4/3 bg-neutral-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-10 bg-neutral-200 rounded-md" />
              <div className="h-6 w-32 bg-neutral-200 rounded-md" />
              <div className="h-40 bg-neutral-200 rounded-md" />
            </div>
          </div>
        </div>
      }
    >
      <ProductDetailContent slug={resolvedParams.slug} />
    </Suspense>
  );
}

