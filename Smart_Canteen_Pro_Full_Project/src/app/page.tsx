'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import FoodCard, { FoodItemProps } from '@/components/FoodCard';
import Sidebar from '@/components/Sidebar';
import {
  UtensilsCrossed,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Coffee,
  CheckCircle2,
  TrendingUp,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const { user, switchDemoAccount } = useAuth();
  const [featuredItems, setFeaturedItems] = useState<FoodItemProps[]>([]);
  const [surplusItems, setSurplusItems] = useState<FoodItemProps[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [menuRes, catRes] = await Promise.all([
          fetch('/api/menu'),
          fetch('/api/categories'),
        ]);

        if (menuRes.ok) {
          const menuData = await menuRes.json();
          const items: FoodItemProps[] = menuData.items || [];
          setFeaturedItems(items.filter((i) => i.isFeatured || i.isBestSeller).slice(0, 8));
          setSurplusItems(items.filter((i) => i.isSurplus));
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
      } catch (e) {
        console.error('Failed to load homepage data', e);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="flex-1 flex w-full">
      <Sidebar mobileOpen={mobileSidebar} onClose={() => setMobileSidebar(false)} />

      <div className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 w-full">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-700 to-amber-700 text-white p-6 sm:p-10 shadow-2xl shadow-orange-600/20">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-orange-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>RSCOE Pune • Smart Canteen Management</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Pre-Order Food. <br />
              <span className="text-amber-300">Skip the Canteen Queue.</span>
            </h1>

            <p className="text-sm sm:text-base text-orange-100 leading-relaxed max-w-xl">
              Place your canteen order during lectures or study breaks, get an instant digital pickup token, and collect your piping hot meal with zero wait time!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/menu"
                className="px-6 py-3 rounded-2xl bg-white text-orange-700 hover:bg-orange-50 font-bold text-sm shadow-xl shadow-black/10 flex items-center gap-2 group transition-all"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/orders"
                className="px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-sm transition-all"
              >
                Track My Orders
              </Link>
            </div>
          </div>

          {/* Decorative Pattern */}
          <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </div>

        {/* Categories Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-600" />
              <span>Explore Categories</span>
            </h2>
            <Link
              href="/menu"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All 10 Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/menu?category=${cat.slug}`}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500 text-slate-700 dark:text-slate-300 font-semibold text-xs whitespace-nowrap shadow-xs hover:shadow-md transition-all group"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 group-hover:scale-125 transition-transform" />
                <span>{cat.name}</span>
                <span className="text-[10px] text-slate-400">({cat._count?.items || 0})</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Surplus Food Flash Sale Banner (Feature 8.C: Food Waste Reduction) */}
        {surplusItems.length > 0 && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white">
                    Food Waste Reduction
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    Active Flash Sale
                  </span>
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white mt-1">
                  Surplus Kitchen Specials • 20% Discount
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Freshly prepared items from today&apos;s batch available at reduced prices to prevent food waste before closing!
                </p>
              </div>
            </div>

            <Link
              href="/menu?surplus=true"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 whitespace-nowrap"
            >
              Order Surplus Deals
            </Link>
          </div>
        )}

        {/* Featured Items Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span>Popular & Bestsellers</span>
              </h2>
              <p className="text-xs text-slate-500">Most ordered by RSCOE students today</p>
            </div>

            <Link
              href="/menu"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>See Full Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredItems.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* How It Works Workflow (Section 6 & 7) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
              Seamless Student Experience
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              How Smart Canteen Pro Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/10 text-orange-600 flex items-center justify-center font-extrabold mx-auto text-lg">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Choose Your Meal</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse all 10 categories, filter diet & customize portions directly from your phone.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-extrabold mx-auto text-lg">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Get Smart Token & QR</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                System generates a unique token (e.g. SC-1008) and scannable QR code with live queue tracking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-extrabold mx-auto text-lg">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Collect & Enjoy</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Walk to Counter 1 when notification pings &apos;READY&apos;. Staff scans your QR code and hands over food.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
