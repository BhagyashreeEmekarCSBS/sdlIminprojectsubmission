'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cartContext';
import { Star, Clock, Plus, Minus, Check, Flame, AlertTriangle } from 'lucide-react';

export interface FoodItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
  stockQuantity: number;
  prepTimeMinutes: number;
  rating: number;
  ratingCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isSurplus?: boolean;
  surplusDiscountPercent?: number;
  allergens?: string;
  ingredients?: string;
  category?: { name: string };
  customizationOptions?: Array<{
    name: string;
    choices: string[];
  }>;
}

export default function FoodCard({ item }: { item: FoodItemProps }) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [selectedCustomizations, setSelectedCustomizations] = useState<{ [key: string]: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate current item quantity in cart without customizations (or first match)
  const cartItem = items.find((i) => i.id === item.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  // Price calculations
  let effectivePrice = item.price;
  if (item.isSurplus && item.surplusDiscountPercent) {
    effectivePrice = item.price * (1 - item.surplusDiscountPercent / 100);
  }

  const handleAdd = () => {
    // If item has customizable options, open modal first
    if (item.customizationOptions && item.customizationOptions.length > 0 && currentQuantity === 0) {
      // Set defaults
      const defaults: { [key: string]: string } = {};
      item.customizationOptions.forEach((opt) => {
        if (opt.choices && opt.choices.length > 0) {
          defaults[opt.name] = opt.choices[0];
        }
      });
      setSelectedCustomizations(defaults);
      setIsModalOpen(true);
      return;
    }

    addItem(item, 1, selectedCustomizations);
  };

  const handleConfirmCustomization = () => {
    addItem(item, 1, selectedCustomizations);
    setIsModalOpen(false);
  };

  const handleIncrement = () => {
    if (cartItem) {
      if (cartItem.quantity >= item.stockQuantity) {
        alert(`Maximum available stock is ${item.stockQuantity}.`);
        return;
      }
      updateQuantity(cartItem.cartKey, cartItem.quantity + 1);
    } else {
      handleAdd();
    }
  };

  const handleDecrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.cartKey, cartItem.quantity - 1);
    }
  };

  const isSoldOut = !item.isAvailable || item.stockQuantity <= 0;
  const isLowStock = !isSoldOut && item.stockQuantity <= 5;

  return (
    <>
      <div className="flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Image Container */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={item.imageUrl}
            alt={item.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              isSoldOut ? 'grayscale contrast-75' : ''
            }`}
            loading="lazy"
          />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
            {/* Veg / Non-Veg Indicator */}
            <div
              className={`flex items-center justify-center w-5 h-5 rounded-md bg-white/95 dark:bg-slate-900/95 shadow-sm border ${
                item.isVeg ? 'border-emerald-500' : 'border-rose-500'
              }`}
              title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </div>

            {/* Best Seller / Featured */}
            {item.isBestSeller && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                Bestseller
              </span>
            )}

            {/* Surplus Food Deal */}
            {item.isSurplus && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs animate-pulse">
                <Flame className="w-3 h-3" />
                {item.surplusDiscountPercent}% OFF Surplus
              </span>
            )}
          </div>

          {/* Prep Time Pill */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium shadow-sm">
            <Clock className="w-3 h-3 text-orange-400" />
            <span>{item.prepTimeMinutes} mins</span>
          </div>

          {/* Stock Status Badge */}
          <div className="absolute bottom-2.5 right-2.5">
            {isSoldOut ? (
              <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow-md">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[11px] font-bold shadow-sm">
                Only {item.stockQuantity} left
              </span>
            ) : null}
          </div>
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-1 p-4 justify-between gap-3">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between gap-2 text-xs mb-1">
              <span className="font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider text-[10px]">
                {item.category?.name || 'Canteen'}
              </span>
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{item.rating.toFixed(1)}</span>
                <span className="text-slate-400 text-[10px] font-normal">({item.ratingCount})</span>
              </div>
            </div>

            {/* Item Name */}
            <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-orange-600 transition-colors">
              {item.name}
            </h3>

            {/* Description */}
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>

            {/* Allergens warning if any */}
            {item.allergens && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic">
                Contains: {item.allergens}
              </p>
            )}
          </div>

          {/* Pricing & Add to Cart Controls */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  ₹{effectivePrice.toFixed(0)}
                </span>
                {item.isSurplus && item.surplusDiscountPercent ? (
                  <span className="text-xs font-semibold text-slate-400 line-through">
                    ₹{item.price.toFixed(0)}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Action Buttons */}
            {isSoldOut ? (
              <button
                disabled
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
              >
                Unavailable
              </button>
            ) : currentQuantity > 0 ? (
              <div className="flex items-center bg-orange-600 text-white rounded-xl shadow-md shadow-orange-600/20 overflow-hidden">
                <button
                  onClick={handleDecrement}
                  type="button"
                  className="p-1.5 hover:bg-orange-700 transition-colors focus:outline-none"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-bold min-w-6 text-center">
                  {currentQuantity}
                </span>
                <button
                  onClick={handleIncrement}
                  type="button"
                  className="p-1.5 hover:bg-orange-700 transition-colors focus:outline-none"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/25 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {isModalOpen && item.customizationOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Customize {item.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your preferences before adding to cart
                </p>
              </div>
              <span className="font-extrabold text-lg text-orange-600">
                ₹{effectivePrice.toFixed(0)}
              </span>
            </div>

            <div className="space-y-4 py-2 max-h-60 overflow-y-auto">
              {item.customizationOptions.map((opt) => (
                <div key={opt.name} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {opt.name}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {opt.choices.map((choice) => {
                      const isSelected = selectedCustomizations[opt.name] === choice;
                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() =>
                            setSelectedCustomizations((prev) => ({ ...prev, [opt.name]: choice }))
                          }
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                            isSelected
                              ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-700 dark:text-orange-400'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{choice}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCustomization}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/25 transition-all"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
