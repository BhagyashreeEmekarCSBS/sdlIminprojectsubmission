'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { UtensilsCrossed, Lock, Mail, ArrowRight, ShieldCheck, User, CookingPot } from 'lucide-react';

function LoginForm() {
  const { login, switchDemoAccount } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/menu';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Failed to sign in.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 items-center justify-center shadow-lg shadow-orange-500/20 text-white">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Sign In to Smart Canteen Pro
          </h2>
          <p className="text-xs text-slate-500">
            RSCOE Pune • Pre-Order & Token System
          </p>
        </div>

        {/* 1-Click Demo Evaluation Accounts */}
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              ⚡ Quick Demo Accounts (1-Click Login)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => switchDemoAccount('STUDENT')}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 text-left hover:border-orange-500 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <User className="w-3.5 h-3.5 text-orange-600" />
                <span>Student</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Yashraj (CSBS)</p>
            </button>

            <button
              onClick={() => switchDemoAccount('STAFF')}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 text-left hover:border-orange-500 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <CookingPot className="w-3.5 h-3.5 text-amber-600" />
                <span>Staff</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Chef Ramesh</p>
            </button>

            <button
              onClick={() => switchDemoAccount('ADMIN')}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 text-left hover:border-orange-500 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Mgr. Sharma</p>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              College Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@rscoe.edu"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-orange-600 font-bold hover:underline">
              Create Student Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
