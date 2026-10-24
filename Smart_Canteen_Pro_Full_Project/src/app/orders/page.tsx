'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import QrCodeModal from '@/components/QrCodeModal';
import { useAuth } from '@/lib/authContext';
import {
  Clock,
  QrCode,
  Printer,
  XCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Star,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

function OrdersContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const highlightedToken = searchParams.get('token');
  const isNewlyPlaced = searchParams.get('new') === '1';

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [selectedOrderForQr, setSelectedOrderForQr] = useState<any | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [feedbackCategory, setFeedbackCategory] = useState<string>('Food Quality');
  const [feedbackComments, setFeedbackComments] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);

        // If there was a newly placed order highlighted, open its QR code popup automatically!
        if (highlightedToken && isNewlyPlaced) {
          const matched = (data.orders || []).find((o: any) => o.tokenNumber === highlightedToken);
          if (matched) {
            setSelectedOrderForQr(matched);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s live status poll
    return () => clearInterval(interval);
  }, [highlightedToken]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          cancelReason: cancelReason || 'Cancelled by student request',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to cancel order.');
      } else {
        alert('Order cancelled successfully. Stock has been restored.');
        setCancellingOrderId(null);
        setCancelReason('');
        fetchOrders();
      }
    } catch (e) {
      alert('Error cancelling order.');
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackOrderId) return;

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: feedbackOrderId,
          rating,
          category: feedbackCategory,
          comments: feedbackComments,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg(data.message);
        setTimeout(() => {
          setFeedbackOrderId(null);
          setFeedbackComments('');
          setFeedbackMsg(null);
        }, 2000);
      } else {
        alert(data.error || 'Failed to submit feedback.');
      }
    } catch (e) {
      alert('Failed to submit feedback.');
    }
  };

  const activeOrders = orders.filter(
    (o) => o.status === 'PLACED' || o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'READY'
  );
  const historyOrders = orders.filter(
    (o) => o.status === 'COLLECTED' || o.status === 'CANCELLED' || o.status === 'REJECTED'
  );

  const displayedOrders = activeTab === 'ACTIVE' ? activeOrders : historyOrders;

  const steps = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COLLECTED'];

  return (
    <div className="flex-1 flex w-full">
      <Sidebar />

      <div className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Clock className="w-7 h-7 text-orange-600" />
              <span>Orders & Pickup Tokens</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live status tracking, scannable QR tokens, and order receipts
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Tabs: Active vs History */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ACTIVE'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Live Kitchen Orders</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'HISTORY'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Past Orders ({historyOrders.length})</span>
          </button>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              {activeTab === 'ACTIVE' ? 'No active orders in progress' : 'No past orders yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'ACTIVE'
                ? 'When you place an order from the canteen menu, your active pickup token will appear here.'
                : 'Your completed or cancelled orders will be archived here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {displayedOrders.map((order) => {
              const currentStepIdx = steps.indexOf(order.status);
              const isReady = order.status === 'READY';
              const isCancelled = order.status === 'CANCELLED' || order.status === 'REJECTED';

              return (
                <div
                  key={order.id}
                  className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
                    order.tokenNumber === highlightedToken
                      ? 'border-orange-500 ring-2 ring-orange-500/20'
                      : 'border-slate-200/90 dark:border-slate-800'
                  } shadow-xs space-y-5`}
                >
                  {/* Top Bar: Token & Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      {/* Big Token Badge */}
                      <div className="px-4 py-2.5 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                          Pickup Token
                        </span>
                        <span className="text-2xl font-black text-orange-600 dark:text-orange-400 font-mono tracking-tight">
                          {order.tokenNumber}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            Order {order.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isReady
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 animate-pulse'
                                : isCancelled
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Placed on {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Slot: {order.pickupSlot}
                        </p>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrderForQr(order)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                        title="View Token & QR code"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View Pass</span>
                      </button>

                      {order.status === 'COLLECTED' && (
                        <button
                          onClick={() => setFeedbackOrderId(order.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>Rate Meal</span>
                        </button>
                      )}

                      {order.status === 'PLACED' && (
                        <button
                          onClick={() => setCancellingOrderId(order.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Progression Stepper (For Active Orders) */}
                  {!isCancelled && order.status !== 'COLLECTED' && (
                    <div className="py-2">
                      <div className="relative flex items-center justify-between">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-0" />
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-600 transition-all duration-500 -z-0"
                          style={{
                            width: `${(Math.max(0, currentStepIdx) / (steps.length - 2)) * 100}%`,
                          }}
                        />

                        {['PLACED', 'CONFIRMED', 'PREPARING', 'READY'].map((step, idx) => {
                          const isDone = currentStepIdx >= idx;
                          const isCurrent = currentStepIdx === idx;
                          return (
                            <div key={step} className="flex flex-col items-center gap-1 z-10">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  isCurrent
                                    ? 'bg-orange-600 text-white ring-4 ring-orange-500/20 scale-110'
                                    : isDone
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                                }`}
                              >
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span
                                className={`text-[10px] font-bold tracking-tight uppercase ${
                                  isCurrent
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {isReady && (
                        <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>
                            Your meal is ready! Please walk up to Counter 1 and show token {order.tokenNumber} or your QR pass.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Items Table */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.itemName}
                          </span>
                          <span className="text-slate-400">x {item.quantity}</span>
                          {item.customizations && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              {item.customizations}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ₹{item.lineTotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Totals */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-x-3 text-slate-500">
                      <span>Payment: <strong className="text-slate-800 dark:text-slate-200">{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                      {order.specialInstructions && (
                        <span>Note: <em className="text-slate-600 dark:text-slate-400">{order.specialInstructions}</em></span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {order.discountAmount > 0 && (
                        <span className="text-emerald-600 font-bold">
                          Discount: -₹{order.discountAmount.toFixed(2)}
                        </span>
                      )}
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Total: ₹{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* QR Code Pass Modal */}
        {selectedOrderForQr && (
          <QrCodeModal
            order={selectedOrderForQr}
            isOpen={Boolean(selectedOrderForQr)}
            onClose={() => setSelectedOrderForQr(null)}
          />
        )}

        {/* Cancellation Confirmation Modal */}
        {cancellingOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Cancel Canteen Order?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to cancel this order? The deducted ingredients will be returned to stock, and your payment will be refunded.
              </p>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setCancellingOrderId(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Keep Order
                </button>
                <button
                  onClick={() => handleCancelOrder(cancellingOrderId)}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Meal Rating & Feedback Modal */}
        {feedbackOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <form
              onSubmit={handleSubmitFeedback}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Rate Your Meal & Service
              </h3>
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <select
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Food Quality">Food Quality & Taste</option>
                <option value="Service Speed">Preparation & Service Speed</option>
                <option value="Cleanliness">Cleanliness & Packaging</option>
                <option value="App Experience">Smart Canteen App Experience</option>
              </select>

              <textarea
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                required
                rows={3}
                placeholder="Share your experience (e.g. Samosas were crispy and chai was great!)..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />

              {feedbackMsg && (
                <p className="text-xs font-bold text-emerald-600 text-center">{feedbackMsg}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackOrderId(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-600/20"
                >
                  Submit Review (+5 pts)
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Orders & Tokens...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
