'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // menuItemId
  name: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  prepTimeMinutes: number;
  quantity: number;
  customizations?: { [key: string]: string };
  cartKey: string; // unique key combining id and customizations
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: any, quantity?: number, customizations?: { [key: string]: string }) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  couponCode: string;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string; discount?: number }>;
  removeCoupon: () => void;
  loyaltyPointsToRedeem: number;
  setLoyaltyPointsToRedeem: (points: number) => void;
  loyaltyDiscount: number;
  finalTotal: number;
  pickupSlot: string;
  setPickupSlot: (slot: string) => void;
  specialInstructions: string;
  setSpecialInstructions: (text: string) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState<number>(0);
  const [pickupSlot, setPickupSlot] = useState<string>('Immediate (10-15 mins)');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('scp_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem('scp_cart_coupon');
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        setCouponCode(parsed.code || '');
        setCouponDiscount(parsed.discount || 0);
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scp_cart', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  const generateCartKey = (id: string, customizations?: { [key: string]: string }) => {
    if (!customizations || Object.keys(customizations).length === 0) {
      return id;
    }
    const sorted = Object.entries(customizations).sort().map(([k, v]) => `${k}:${v}`).join('|');
    return `${id}_${sorted}`;
  };

  const addItem = (item: any, quantity: number = 1, customizations?: { [key: string]: string }) => {
    const key = generateCartKey(item.id, customizations);
    let effectivePrice = item.price;
    if (item.isSurplus && item.surplusDiscountPercent > 0) {
      effectivePrice = item.price * (1 - item.surplusDiscountPercent / 100);
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === key);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: effectivePrice,
          imageUrl: item.imageUrl,
          isVeg: item.isVeg,
          prepTimeMinutes: item.prepTimeMinutes,
          quantity,
          customizations,
          cartKey: key,
        },
      ];
    });
  };

  const removeItem = (cartKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartKey);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setCouponDiscount(0);
    setLoyaltyPointsToRedeem(0);
    setSpecialInstructions('');
    try {
      localStorage.removeItem('scp_cart');
      localStorage.removeItem('scp_cart_coupon');
    } catch (e) {}
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code: string) => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Please enter a coupon code.' };
    }
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Invalid coupon.' };
      }
      setCouponCode(data.coupon.code);
      setCouponDiscount(data.coupon.discountAmount);
      localStorage.setItem(
        'scp_cart_coupon',
        JSON.stringify({ code: data.coupon.code, discount: data.coupon.discountAmount })
      );
      return { success: true, message: data.message, discount: data.coupon.discountAmount };
    } catch (err: any) {
      return { success: false, message: 'Network error validating coupon.' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    try {
      localStorage.removeItem('scp_cart_coupon');
    } catch (e) {}
  };

  const loyaltyDiscount = loyaltyPointsToRedeem * 0.5; // 1 point = ₹0.50
  const finalTotal = Math.max(0, subtotal - couponDiscount - loyaltyDiscount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
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
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
