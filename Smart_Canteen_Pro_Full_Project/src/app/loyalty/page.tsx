'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/authContext';
import { useCart } from '@/lib/cartContext';
import {
  Sparkles,
  Ticket,
  Gift,
  Award,
  ArrowRight,
  Copy,
  Check,
  Coins,
  History,
} from 'lucide-react';

export default function LoyaltyPage() {
  const { user } = useAuth();
  const { applyCoupon, setIsDrawerOpen } = useCart();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await fetch('/api/coupons');
        if (res.ok) {
          const data = await res.json();
          setCoupons(data.coupons || []);
        }
      } catch (e) {}
    }
    loadCoupons();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyToCart = async (code: string) => {
    await applyCoupon(code);
    setIsDrawerOpen(true);
  };

  const pointsValue = user ? (user.loyaltyPoints * 0.5).toFixed(2) : '0.00';

  return (
    <div className="flex-1 flex w-full">
      <Sidebar />

      <div className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 w-full">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-amber-500" />
            <span>Loyalty Points & Student Rewards</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Earn rewards with every bite and unlock exclusive college canteen discounts
          </p>
        </div>

        {/* Loyalty Balance Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white shadow-xl shadow-orange-600/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-200" />
              <span>Your Reward Balance</span>
            </span>
            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl sm:text-5xl font-black">
                {user ? user.loyaltyPoints : 50}
              </h2>
              <span className="text-base font-semibold text-amber-100">Loyalty Points</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-100/90 font-medium">
              Equivalent to <strong className="text-white">₹{pointsValue} discount</strong> on your next order (1 pt = ₹0.50).
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs space-y-2 max-w-sm">
            <span className="font-bold block text-white">How You Earn Points:</span>
            <ul className="space-y-1 text-amber-100">
              <li>• 1 Point for every ₹10 spent on completed orders</li>
              <li>• 50 Welcome bonus points on account creation</li>
              <li>• 5 Bonus points for leaving meal feedback</li>
            </ul>
          </div>
        </div>

        {/* Active Canteen Coupons Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-orange-600" />
              <span>Available Student Promo Coupons</span>
            </h2>
            <p className="text-xs text-slate-500">
              Apply these coupon codes during checkout for instant savings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-500/30 text-orange-700 dark:text-orange-400 font-mono font-extrabold text-xs tracking-wider">
                      {coupon.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} FLAT OFF`}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {coupon.description}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Min order ₹{coupon.minOrderAmount}
                    {coupon.maxDiscount ? ` • Up to ₹${coupon.maxDiscount}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleApplyToCart(coupon.code)}
                    className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
