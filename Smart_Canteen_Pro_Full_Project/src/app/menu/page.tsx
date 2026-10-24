'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import FoodCard, { FoodItemProps } from '@/components/FoodCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Flame,
  UtensilsCrossed,
  X,
  RotateCcw,
} from 'lucide-react';

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSurplus = searchParams.get('surplus') === 'true';

  const [items, setItems] = useState<FoodItemProps[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [diet, setDiet] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'rating_desc' | 'prep_asc'>('default');
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [showSurplusOnly, setShowSurplusOnly] = useState(initialSurplus);

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (e) {}
    }
    loadCategories();
  }, []);

  // Fetch menu with filters
  const fetchMenu = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (diet !== 'all') params.set('diet', diet);
      if (sortBy !== 'default') params.set('sortBy', sortBy);
      if (maxPrice < 200) params.set('maxPrice', maxPrice.toString());
      if (showSurplusOnly) params.set('surplus', 'true');

      const res = await fetch(`/api/menu?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error('Failed to fetch menu:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [selectedCategory, diet, sortBy, maxPrice, showSurplusOnly]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setDiet('all');
    setSortBy('default');
    setMaxPrice(200);
    setShowSurplusOnly(false);
  };

  return (
    <div className="flex-1 flex w-full">
      <Sidebar />

      <div className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <UtensilsCrossed className="w-7 h-7 text-orange-600" />
              <span>Smart Canteen Menu</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Freshly prepared meals, snacks, and beverages with instant pickup tokens
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, chai, snacks..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 10 Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls Bar */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Diet Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setDiet('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  diet === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDiet('veg')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  diet === 'veg'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-emerald-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Veg Only</span>
              </button>
              <button
                onClick={() => setDiet('nonveg')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  diet === 'nonveg'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Non-Veg</span>
              </button>
            </div>

            {/* Surplus Food Deal Toggle */}
            <button
              onClick={() => setShowSurplusOnly(!showSurplusOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all ${
                showSurplusOnly
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-emerald-500" />
              <span>Surplus Deals Only</span>
            </button>

            {/* Price Max Slider */}
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
              <span>Max: ₹{maxPrice}</span>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-24 accent-orange-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Right: Sort & Reset */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="default">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="prep_asc">Fastest Prep Time</option>
            </select>

            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Food Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <UtensilsCrossed className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              No matching food items found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, price limit, or category filter to discover delicious options.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:bg-orange-700"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Smart Menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
