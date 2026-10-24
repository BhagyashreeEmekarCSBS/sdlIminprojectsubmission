'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { useAuth } from '@/lib/authContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Ticket,
  Clock,
  CreditCard,
  QrCode,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    loyaltyPointsToRedeem,
    setLoyaltyPointsToRedeem,
    loyaltyDiscount,
    finalTotal,
    pickupSlot,
    setPickupSlot,
    specialInstructions,
    setSpecialInstructions,
  } = useCart();

  const { user } = useAuth();
  const router = useRouter();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('DEMO_UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  if (!isDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg(null);
    const res = await applyCoupon(inputCoupon);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setInputCoupon('');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsDrawerOpen(false);
      router.push('/login?redirect=/menu');
      return;
    }

    if (items.length === 0) return;

    setIsSubmitting(true);
    setOrderError(null);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          menuItemId: i.id,
          quantity: i.quantity,
          customizations: i.customizations,
        })),
        couponCode: couponCode || undefined,
        redeemLoyaltyPoints: loyaltyPointsToRedeem,
        paymentMethod,
        pickupSlot,
        specialInstructions,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Success! Clear cart, close drawer, and redirect to orders page
      clearCart();
      setIsDrawerOpen(false);
      router.push(`/orders?token=${data.order.tokenNumber}&new=1`);
    } catch (err: any) {
      setOrderError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-colors animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-600/10 text-orange-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Your Canteen Cart ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {orderError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{orderError}</span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  Your cart is empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Add hot snacks, chai, biryani, or combos to generate your pickup token!
                </p>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="mt-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-600/20 hover:bg-orange-700"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.cartKey}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <p className="font-extrabold text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                          ₹{item.price.toFixed(0)}
                        </p>
                        {item.customizations && Object.keys(item.customizations).length > 0 && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {Object.entries(item.customizations)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5 min-w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.cartKey)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pickup Slot Selection */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Pickup Time Slot</span>
                  </label>
                  <select
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Immediate (10-15 mins)">Immediate Pickup (10-15 mins)</option>
                    <option value="12:45 - 13:00 Short Break">12:45 - 13:00 (Short Break)</option>
                    <option value="13:15 - 13:30 Lunch Break">13:15 - 13:30 (Lunch Break)</option>
                    <option value="15:00 - 15:15 Tea Break">15:00 - 15:15 (Tea Break)</option>
                    <option value="16:30 - 16:45 Evening Snack">16:30 - 16:45 (Evening Snack)</option>
                  </select>
                </div>

                {/* Special Instructions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cooking Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Extra spicy, less oil, pack in paper bag"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Coupon Code Section */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-orange-600" />
                      Promo Coupon
                    </span>
                    <span className="text-[10px] text-slate-400">e.g. WELCOME20, HUNGRY50</span>
                  </div>

                  {couponCode ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                          {couponCode} (-₹{couponDiscount.toFixed(2)})
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                        placeholder="ENTER COUPON"
                        className="flex-1 text-xs uppercase font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponMsg && (
                    <p
                      className={`text-[11px] font-medium mt-1 ${
                        couponMsg.isError ? 'text-rose-500' : 'text-emerald-600'
                      }`}
                    >
                      {couponMsg.text}
                    </p>
                  )}
                </div>

                {/* Loyalty Points Redemption */}
                {user && user.loyaltyPoints > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Redeem Loyalty Points
                      </span>
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                        {user.loyaltyPoints} Available
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>Redeem 50 pts (₹25 off):</span>
                      <input
                        type="checkbox"
                        checked={loyaltyPointsToRedeem >= 50}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const pts = Math.min(user.loyaltyPoints, 100);
                            setLoyaltyPointsToRedeem(pts);
                          } else {
                            setLoyaltyPointsToRedeem(0);
                          }
                        }}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </div>
                    {loyaltyPointsToRedeem > 0 && (
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Redeeming {loyaltyPointsToRedeem} points: -₹{(loyaltyPointsToRedeem * 0.5).toFixed(2)} off!
                      </p>
                    )}
                  </div>
                )}

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Payment Method (College Demo)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'DEMO_UPI', label: 'UPI QR (GPay/Paytm)', icon: QrCode },
                      { id: 'CAMPUS_CARD', label: 'College Smart Card', icon: CreditCard },
                      { id: 'CASH_ON_PICKUP', label: 'Cash at Counter', icon: DollarSign },
                      { id: 'NETBANKING', label: 'Net Banking', icon: ShieldCheck },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = paymentMethod === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setPaymentMethod(mode.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-700 dark:text-orange-400 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-orange-600 shrink-0" />
                          <span className="truncate">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer & Order Confirmation */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount ({couponCode})</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span>Loyalty Points Discount</span>
                    <span>-₹{loyaltyDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>GST (Included)</span>
                  <span>₹0.00</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
                  <span>Total Payable</span>
                  <span className="text-orange-600 dark:text-orange-400">
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Place Order & Generate Token</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
