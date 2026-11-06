'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Seller, ProductWithVariations } from '@/lib/types';
import { formatGBP } from '@/lib/pricing';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  EyeOff,
  Eye,
  Store,
  Package,
  RotateCw,
  Lock,
} from 'lucide-react';

export default function AdminPage() {
  const { role, switchRole } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<ProductWithVariations[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'sellers'>('listings');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [resSellers, resProducts] = await Promise.all([
        fetch('/api/admin/sellers'),
        fetch('/api/admin/products'),
      ]);

      const dataSellers = await resSellers.json();
      const dataProducts = await resProducts.json();

      if (dataSellers.success) setSellers(dataSellers.data);
      if (dataProducts.success) {
        let prods = [...dataProducts.data];
        try {
          const localItems = JSON.parse(localStorage.getItem('demo_local_products') || '[]');
          for (const itm of localItems) {
            const idx = prods.findIndex((p: any) => p.id === itm.id || p.slug === itm.slug);
            if (idx !== -1) {
              prods[idx] = { ...prods[idx], ...itm };
            } else {
              prods.unshift(itm);
            }
          }
        } catch (e) {}
        setProducts(prods);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      loadAdminData();
    }
  }, [role]);

  // Handle seller approval or suspension (Optimistic 0ms Instant UI)
  const handleUpdateSeller = async (sellerId: string, newStatus: 'approved' | 'suspended') => {
    // 1. Instant optimistic update on screen
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, status: newStatus } : s))
    );

    // 2. Background database sync
    try {
      await fetch('/api/admin/sellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, status: newStatus }),
      });
    } catch (err) {
      console.error('Error updating seller', err);
    }
  };

  // Handle product approval or hiding (Optimistic 0ms Instant UI)
  const handleUpdateProduct = async (productId: string, newStatus: 'approved' | 'hidden') => {
    // 1. Instant optimistic update on screen & localStorage
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
    );

    try {
      const localItems = JSON.parse(localStorage.getItem('demo_local_products') || '[]');
      const updatedLocal = localItems.map((p: any) =>
        p.id === productId ? { ...p, status: newStatus } : p
      );
      localStorage.setItem('demo_local_products', JSON.stringify(updatedLocal));
    } catch (e) {}

    // 2. Background database sync
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, status: newStatus }),
      });
    } catch (err) {
      console.error('Error updating product listing', err);
    }
  };

  // Role Gate Enforcement (Strict Requirement: Admin-only access)
  if (role !== 'admin') {
    return (
      <div className="min-h-[70vh] bg-neutral-50 flex items-center justify-center p-4 text-neutral-900">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-900">Admin Authorization Required</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            This dashboard is restricted to administrators. You are currently authenticated with the role: <strong className="text-neutral-800 uppercase">{role || 'guest'}</strong>.
          </p>
          <div className="pt-2">
            <button
              onClick={() => switchRole('admin')}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors min-h-[44px] cursor-pointer"
            >
              Switch to Test Admin Account (admin@demo.com)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8 text-neutral-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-neutral-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  Admin Console
                </h1>
                <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                  Admin Role Verified
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Marketplace moderation: approve/hide vendor listings and verify registered sellers.
              </p>
            </div>
          </div>

          <button
            onClick={loadAdminData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer min-h-[44px] self-start sm:self-auto"
          >
            <RotateCw className="w-3.5 h-3.5 text-neutral-500" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 border-b border-neutral-200 pb-2">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'listings'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Listing Approvals ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sellers')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'sellers'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Seller Management ({sellers.length})</span>
          </button>
        </div>

        {/* Tab 1: Product Listings Approval */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {products.map((prod) => {
              const isApproved = prod.status === 'approved';
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                      <img
                        src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=200&q=80'}
                        alt={prod.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-neutral-900 text-base">{prod.title}</h3>
                        <span
                          className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {prod.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Base: <strong>{formatGBP(prod.basePrice)}</strong> | Variations:{' '}
                        {prod.variationGroups.map((g) => g.name).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isApproved ? (
                      <button
                        onClick={() => handleUpdateProduct(prod.id, 'hidden')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold min-h-[44px] cursor-pointer"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Listing</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateProduct(prod.id, 'approved')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold min-h-[44px] cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Listing</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Seller Approvals */}
        {activeTab === 'sellers' && (
          <div className="space-y-4">
            {sellers.map((s) => {
              const isApproved = s.status === 'approved';
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-neutral-900 text-base">{s.storeName}</h3>
                      <span
                        className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{s.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isApproved ? (
                      <button
                        onClick={() => handleUpdateSeller(s.id, 'suspended')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold min-h-[44px] cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Suspend Seller</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateSeller(s.id, 'approved')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold min-h-[44px] cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Seller</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
