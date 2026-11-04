'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/lib/types';
import {
  Lock,
  Mail,
  User,
  Store,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, user } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email);
      } else {
        await signup(email, fullName || email.split('@')[0], selectedRole);
      }

      // Route based on role
      if (selectedRole === 'seller' || email.includes('seller')) {
        router.push('/seller');
      } else if (selectedRole === 'admin' || email.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click test login for ESOLS assessors
  const handleQuickLogin = async (role: UserRole, testEmail: string) => {
    setLoading(true);
    await login(testEmail, role);
    setLoading(false);
    if (role === 'seller') router.push('/seller');
    else if (role === 'admin') router.push('/admin');
    else router.push('/');
  };

  return (
    <div className="min-h-[85vh] bg-neutral-50 flex items-center justify-center p-4 text-neutral-900">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
            {mode === 'login' ? 'Sign In to DemoMarket' : 'Create an Account'}
          </h1>
          <p className="text-xs text-neutral-500">
            {mode === 'login'
              ? 'Access your orders, custom bed configurations, or seller portal'
              : 'Register as a buyer or seller on the mini marketplace'}
          </p>
        </div>

        {/* 1-Click Fast Test Login Section (for Assessor) */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Assessor 1-Click Quick Logins:</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('buyer', 'buyer@demo.com')}
              className="py-2 px-1 rounded-xl bg-white/10 hover:bg-white/20 text-center font-bold transition-colors cursor-pointer min-h-[44px] flex flex-col items-center justify-center"
            >
              <User className="w-3.5 h-3.5 text-emerald-300 mb-0.5" />
              <span>Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('seller', 'seller@demo.com')}
              className="py-2 px-1 rounded-xl bg-white/10 hover:bg-white/20 text-center font-bold transition-colors cursor-pointer min-h-[44px] flex flex-col items-center justify-center"
            >
              <Store className="w-3.5 h-3.5 text-amber-300 mb-0.5" />
              <span>Seller</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin@demo.com')}
              className="py-2 px-1 rounded-xl bg-white/10 hover:bg-white/20 text-center font-bold transition-colors cursor-pointer min-h-[44px] flex flex-col items-center justify-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300 mb-0.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Tab switch between Login & Signup */}
        <div className="flex rounded-xl bg-neutral-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
              mode === 'signup' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Select Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    className={`p-2.5 rounded-xl border-2 text-left font-bold cursor-pointer transition-all min-h-[44px] flex items-center justify-between ${
                      selectedRole === 'buyer'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900'
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    <span>Buyer</span>
                    {selectedRole === 'buyer' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    className={`p-2.5 rounded-xl border-2 text-left font-bold cursor-pointer transition-all min-h-[44px] flex items-center justify-between ${
                      selectedRole === 'seller'
                        ? 'border-amber-600 bg-amber-50/60 text-amber-900'
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    <span>Seller</span>
                    {selectedRole === 'seller' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm transition-all min-h-[48px] flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </form>

        {user && (
          <div className="pt-2 border-t border-neutral-100 text-center text-xs text-neutral-500">
            Currently active session: <strong className="text-neutral-800">{user.email}</strong> ({user.role})
          </div>
        )}
      </div>
    </div>
  );
}
