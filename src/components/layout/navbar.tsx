'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import {
  ShoppingBag,
  User,
  Store,
  ShieldCheck,
  Menu,
  X,
  Bed,
  CheckCircle,
} from 'lucide-react';
import { formatGBP } from '@/lib/pricing';

export function Navbar() {
  const { user, role, switchRole, logout } = useAuth();
  const { itemCount, subtotal } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      {/* Top Notification / Demo Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ESOLS Practical Assessment MVP Demo</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">Free Next-Day UK Delivery Available</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Current Role:</span>
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="font-semibold text-emerald-400 hover:text-emerald-300 underline decoration-dotted cursor-pointer flex items-center gap-1"
                aria-label="Switch active role for testing"
              >
                {role === 'seller' ? 'Seller (Demo Seller)' : role === 'admin' ? 'Admin' : 'Buyer (Sarah)'}
                <span>▾</span>
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-52 bg-white text-neutral-800 rounded-lg shadow-xl border border-neutral-200 py-1 z-50 text-xs"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 font-semibold text-neutral-400 border-b border-neutral-100">
                    Switch Test Account
                  </div>
                  <button
                    onClick={() => switchRole('buyer')}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center justify-between"
                  >
                    <span>Buyer (buyer@demo.com)</span>
                    {role === 'buyer' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => switchRole('seller')}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center justify-between"
                  >
                    <span>Seller (seller@demo.com)</span>
                    {role === 'seller' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => switchRole('admin')}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center justify-between"
                  >
                    <span>Admin (admin@demo.com)</span>
                    {role === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-slate-800 transition-colors">
              <Bed className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-neutral-900 tracking-tight block leading-none">
                DemoMarket
              </span>
              <span className="text-[10px] text-neutral-600 font-medium tracking-wider uppercase">
                Furniture & Beds
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-700">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Browse Marketplace
            </Link>
            <Link href="/products/prague-divan-bed-cream-naples" className="hover:text-slate-900 transition-colors">
              Featured Prague Bed
            </Link>
            <Link href="/orders" className="hover:text-slate-900 transition-colors">
              My Orders
            </Link>
            {role === 'seller' && (
              <Link
                href="/seller"
                className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md font-semibold hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
              >
                <Store className="w-4 h-4" />
                Seller Portal
              </Link>
            )}
            {role === 'admin' && (
              <Link
                href="/admin"
                className="text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md font-semibold hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Console
              </Link>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Seller / Admin Shortcuts */}
            <div className="hidden lg:flex items-center gap-2 border-r border-neutral-200 pr-3">
              <Link
                href="/seller"
                className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5" />
                Seller Dashboard
              </Link>
              <Link
                href="/admin"
                className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </Link>
            </div>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] justify-center shadow-xs"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] text-slate-300 font-medium">Basket</span>
                <span className="text-xs font-bold text-white">{formatGBP(subtotal)}</span>
              </div>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-neutral-800 hover:bg-neutral-100 min-h-[44px] flex items-center"
          >
            Browse Marketplace
          </Link>
          <Link
            href="/products/prague-divan-bed-cream-naples"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-neutral-800 hover:bg-neutral-100 min-h-[44px] flex items-center"
          >
            Prague Divan Bed (Customiser)
          </Link>
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-neutral-800 hover:bg-neutral-100 min-h-[44px] flex items-center"
          >
            Buyer Orders
          </Link>
          <Link
            href="/seller"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 min-h-[44px] flex items-center gap-2"
          >
            <Store className="w-4 h-4" />
            Seller Dashboard
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 min-h-[44px] flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Admin Console
          </Link>
        </div>
      )}
    </header>
  );
}
