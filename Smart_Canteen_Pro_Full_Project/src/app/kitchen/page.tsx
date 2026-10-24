'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import StaffScanner from '@/components/StaffScanner';
import { useAuth } from '@/lib/authContext';
import {
  CookingPot,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Utensils,
  XCircle,
  QrCode,
  Flame,
} from 'lucide-react';

export default function KitchenPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchKitchenData = async () => {
    try {
      const [orderRes, menuRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/menu'),
      ]);

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData.orders || []);
      }
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(menuData.items || []);
      }
    } catch (e) {
      console.error('Kitchen fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenData();
    const interval = setInterval(fetchKitchenData, 10000); // 10s kitchen queue poll
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, cancelReason: reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update order status.');
      } else {
        fetchKitchenData();
        setRejectingOrderId(null);
        setRejectReason('');
      }
    } catch (e) {
      alert('Error updating status.');
    }
  };

  const handleToggleItemAvailability = async (itemId: string, currentAvailable: boolean) => {
    try {
      const res = await fetch(`/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentAvailable }),
      });

      if (res.ok) {
        fetchKitchenData();
      }
    } catch (e) {
      alert('Error toggling availability.');
    }
  };

  if (authLoading) {
    return <div className="p-12 text-center text-xs">Loading kitchen console...</div>;
  }

  // Security guard check
  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    return (
      <div className="flex-1 flex w-full">
        <Sidebar />
        <div className="flex-1 max-w-xl mx-auto p-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">Kitchen Staff Access Required</h2>
          <p className="text-xs text-slate-500">
            Please log in with a Staff or Administrator account to manage the kitchen board and scanner.
          </p>
        </div>
      </div>
    );
  }

  const placedOrders = orders.filter((o) => o.status === 'PLACED');
  const preparingOrders = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  return (
    <div className="flex-1 flex w-full">
      <Sidebar />

      <div className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <CookingPot className="w-7 h-7 text-orange-600" />
              <span>Kitchen Display Board & Scanner</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active order queues, token preparation stages, and counter pickup verification
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-orange-600/10 text-orange-600 border border-orange-500/20">
              Staff: {user.name}
            </span>
            <button
              onClick={fetchKitchenData}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Counter QR & Token Scanner */}
        <StaffScanner onOrderVerified={fetchKitchenData} />

        {/* 3-Column Kitchen Order Flow Board */}
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span>Live Kitchen Queues</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. New Orders (PLACED) */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  New Orders ({placedOrders.length})
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              </div>

              {placedOrders.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center italic">No new orders placed.</p>
              ) : (
                <div className="space-y-3">
                  {placedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-orange-600 font-mono">
                          {order.tokenNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {order.user?.name} ({order.user?.studentId || 'ID Verified'})
                        </p>
                        <p className="text-slate-500 text-[11px]">Slot: {order.pickupSlot}</p>
                        {order.specialInstructions && (
                          <p className="text-amber-600 dark:text-amber-400 italic text-[11px]">
                            &quot;{order.specialInstructions}&quot;
                          </p>
                        )}
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="py-1 flex justify-between font-medium">
                            <span>{item.itemName}</span>
                            <span className="font-bold">x {item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => setRejectingOrderId(order.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 text-xs font-semibold hover:bg-rose-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          className="flex-1 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          Accept & Cook
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. In Kitchen (PREPARING) */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Cooking / Preparing ({preparingOrders.length})
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              </div>

              {preparingOrders.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center italic">Nothing currently cooking.</p>
              ) : (
                <div className="space-y-3">
                  {preparingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-amber-600 font-mono">
                          {order.tokenNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 text-[10px] font-bold">
                          Cooking
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {order.user?.name}
                        </p>
                        {order.specialInstructions && (
                          <p className="text-amber-600 dark:text-amber-400 italic text-[11px]">
                            &quot;{order.specialInstructions}&quot;
                          </p>
                        )}
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="py-1 flex justify-between font-medium">
                            <span>{item.itemName}</span>
                            <span className="font-bold">x {item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Ready for Pickup (READY) */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Ready at Counter ({readyOrders.length})
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {readyOrders.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center italic">No orders waiting at counter.</p>
              ) : (
                <div className="space-y-3">
                  {readyOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-emerald-600 font-mono">
                          {order.tokenNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold">
                          Ready
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {order.user?.name} ({order.user?.studentId || 'ID Verified'})
                      </p>

                      <div className="text-xs text-slate-500">
                        {order.items?.map((item: any) => (
                          <div key={item.id}>
                            • {item.itemName} x {item.quantity}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COLLECTED')}
                        className="w-full py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                      >
                        Manual Handover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Item Availability Management */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-orange-600" />
                <span>Quick Stock & Item Availability Toggle</span>
              </h3>
              <p className="text-xs text-slate-500">
                Instantly mark items as sold out when ingredients run low
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Stock: {item.stockQuantity} • ₹{item.price}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleItemAvailability(item.id, item.isAvailable)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                    item.isAvailable && item.stockQuantity > 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                  }`}
                >
                  {item.isAvailable && item.stockQuantity > 0 ? 'Active' : 'Sold Out'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Rejection Reason Modal */}
        {rejectingOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Reject Order?
              </h3>
              <p className="text-xs text-slate-500">
                Please specify a reason. Stock will be restored and student will be refunded.
              </p>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Kitchen queue overloaded, item ran out"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setRejectingOrderId(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(rejectingOrderId, 'REJECTED', rejectReason || 'Kitchen overloaded')
                  }
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
