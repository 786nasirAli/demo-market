'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { formatGBP } from '@/lib/pricing';
import {
  ShieldAlert,
  CheckCircle,
  Truck,
  CreditCard,
  ArrowLeft,
  Lock,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState<any | null>(null);

  // Demo Shipping Address Pre-filled for convenience
  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Sarah Jenkins',
    email: user?.email || 'buyer@demo.com',
    addressLine1: '14 Highfield Gardens',
    city: 'Manchester',
    postcode: 'M14 6TJ',
    phone: '+44 7911 123456',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Map cart items into server order payload
      const orderPayload = {
        buyerId: user?.id || 'usr-buyer-001',
        buyerEmail: formData.email,
        buyerName: formData.fullName,
        shippingAddress: {
          fullName: formData.fullName,
          addressLine1: formData.addressLine1,
          city: formData.city,
          postcode: formData.postcode,
          phone: formData.phone,
        },
        items: items.map((item) => {
          const selectedOptionsMap: Record<string, { groupId: string; optionId: string }> = {};
          Object.keys(item.selectedOptions).forEach((groupName) => {
            selectedOptionsMap[groupName] = {
              groupId: item.selectedOptions[groupName].groupId,
              optionId: item.selectedOptions[groupName].optionId,
            };
          });

          return {
            productId: item.productId,
            quantity: item.quantity,
            selectedOptions: selectedOptionsMap,
          };
        }),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to place order.');
      }

      setOrderComplete(json.data);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  // If order is completed, show clean order confirmation screen
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 text-neutral-900">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
            Order Successfully Placed
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-3 mb-1">
            Thank You For Your Order!
          </h1>
          <p className="text-xs text-neutral-500 mb-6">
            Order ID: <strong className="text-neutral-800">{orderComplete.id}</strong>
          </p>

          <div className="bg-neutral-50 rounded-2xl p-4 text-left space-y-3 mb-6 border border-neutral-100 text-xs">
            <div className="flex justify-between border-b border-neutral-200/60 pb-2">
              <span className="text-neutral-500">Order Total:</span>
              <span className="font-extrabold text-neutral-900 text-sm">
                {formatGBP(orderComplete.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between border-b border-neutral-200/60 pb-2">
              <span className="text-neutral-500">Status:</span>
              <span className="font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded-md">
                {orderComplete.status}
              </span>
            </div>
            <div className="border-b border-neutral-200/60 pb-2">
              <span className="text-neutral-500 block mb-1">Shipping To:</span>
              <p className="font-medium text-neutral-800">
                {orderComplete.shippingAddress.fullName} – {orderComplete.shippingAddress.addressLine1}, {orderComplete.shippingAddress.city} ({orderComplete.shippingAddress.postcode})
              </p>
            </div>
            <div>
              <span className="text-neutral-500 block mb-1">Ordered Items ({orderComplete.items.length}):</span>
              {orderComplete.items.map((item: any) => (
                <div key={item.id} className="mt-1.5 p-2 bg-white rounded-lg border border-neutral-200">
                  <div className="font-bold text-neutral-900">{item.productTitle} × {item.quantity}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {Object.entries(item.selectedConfiguration || {}).map(([k, v]: any) => (
                      <span key={k} className="inline-block mr-2">{k}: {v}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/orders"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors min-h-[44px] flex items-center justify-center"
            >
              View in My Orders
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-bold text-xs transition-colors min-h-[44px] flex items-center justify-center"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <p className="text-sm text-neutral-500 mb-4">No items in your cart to checkout.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8 text-neutral-900">
      <div className="max-w-4xl mx-auto">
        {/* Fake Checkout Warning Banner */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-extrabold text-amber-900">
              Notice: Fake Demo Checkout (No Real Payment Processing)
            </h3>
            <p className="text-amber-800 mt-0.5">
              This is a sandbox test simulation for the ESOLS assessment. No real money or credit card information is required or collected. Submitting this form will register a verified order in the database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/cart"
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Basket</span>
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="text-xs font-bold text-neutral-900">Checkout</span>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Shipping Form */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>1. Delivery Information</span>
            </h2>

            <div className="grid grid-cols-1 gap-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">UK Postcode</label>
                  <input
                    type="text"
                    name="postcode"
                    required
                    value={formData.postcode}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Mobile Telephone</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>
            </div>

            {/* Fake Payment Method Section */}
            <div className="pt-4 border-t border-neutral-100">
              <h2 className="text-lg font-extrabold text-neutral-900 pb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>2. Payment Method</span>
              </h2>
              <div className="p-3.5 rounded-xl border-2 border-emerald-600 bg-emerald-50/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 block">Fake Demo Simulation</span>
                    <span className="text-neutral-500">Auto-approved sandbox transaction</span>
                  </div>
                </div>
                <span className="font-extrabold text-emerald-700">£0.00 DUE</span>
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-4 sticky top-24">
              <h3 className="font-extrabold text-base text-neutral-900">Order Items ({items.length})</h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="text-xs border-b border-neutral-100 pb-2">
                    <div className="flex justify-between font-bold text-neutral-900">
                      <span className="truncate max-w-[180px]">{item.productTitle}</span>
                      <span>{formatGBP(item.lineTotal)}</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Qty: {item.quantity} | {item.selectedOptions['Colour']?.label} | {item.selectedOptions['Size']?.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-200 text-sm space-y-2">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Shipping:</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>
                <div className="flex justify-between font-extrabold text-base text-neutral-900 pt-1">
                  <span>Total Amount:</span>
                  <span className="text-xl text-neutral-900">{formatGBP(subtotal)}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition-all min-h-[52px] cursor-pointer"
              >
                {loading ? (
                  <span>Verifying & Placing Order...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Confirm & Place Order ({formatGBP(subtotal)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
