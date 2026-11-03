'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Order } from '@/lib/types';
import { formatGBP } from '@/lib/pricing';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCw,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export default function BuyerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const buyerId = user?.id || 'usr-buyer-001';
      const res = await fetch(`/api/orders?buyerId=${buyerId}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            <span>New Order</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8 text-neutral-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-neutral-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              My Orders & History
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Logged in as: <strong className="text-neutral-800">{user?.email || 'buyer@demo.com'}</strong> ({user?.fullName || 'Sarah Jenkins'})
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer min-h-[44px]"
          >
            <RotateCw className="w-3.5 h-3.5 text-neutral-500" />
            <span>Refresh Status</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-neutral-200 h-40 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 max-w-md mx-auto">
            <Package className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="font-extrabold text-lg text-neutral-900">No Orders Placed Yet</h3>
            <p className="text-xs text-neutral-500 mt-1 mb-6">
              When you purchase items via fake checkout, your custom configurations and live statuses will appear here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-neutral-900 block">
                        Order #{order.id}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="font-extrabold text-base text-neutral-900">
                      {formatGBP(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-neutral-50/70 rounded-2xl border border-neutral-100 flex flex-col sm:flex-row justify-between gap-3"
                    >
                      <div>
                        <div className="font-extrabold text-sm text-neutral-900">
                          {item.productTitle} × {item.quantity}
                        </div>

                        {/* Selected Configuration Snapshot */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {Object.entries(item.selectedConfiguration || {}).map(([k, v]) => (
                            <span
                              key={k}
                              className="inline-block bg-white border border-neutral-200 px-2 py-0.5 rounded-md text-[11px] text-neutral-700"
                            >
                              <strong className="text-neutral-900">{k}:</strong> {v}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-xs text-neutral-400 block">Line Total</span>
                        <span className="font-bold text-sm text-neutral-900">
                          {formatGBP(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping summary footer */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-500 gap-2">
                  <div>
                    Delivery to: <strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.city}, {order.shippingAddress.postcode})
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    ✓ Price and configuration permanently recorded in database
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
