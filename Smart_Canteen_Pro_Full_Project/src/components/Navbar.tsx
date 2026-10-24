'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { useCart } from '@/lib/cartContext';
import ThemeToggle from './ThemeToggle';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Menu as MenuIcon,
  X,
} from 'lucide-react';

export default function Navbar({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const { user, logout, switchDemoAccount } = useAuth();
  const { itemCount, setIsDrawerOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const [crowdData, setCrowdData] = useState<{
    crowdLabel: string;
    crowdColor: string;
    estimatedWaitMinutes: number;
    activeOrdersCount: number;
  } | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Poll crowd & notifications
  const fetchCrowd = async () => {
    try {
      const res = await fetch('/api/crowd');
      if (res.ok) {
        const data = await res.json();
        setCrowdData(data.prediction);
      }
    } catch (e) {}
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchCrowd();
    const crowdInterval = setInterval(fetchCrowd, 30000); // 30s poll
    return () => clearInterval(crowdInterval);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const notifInterval = setInterval(fetchNotifications, 20000); // 20s poll
      return () => clearInterval(notifInterval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMobileMenuToggle}
              type="button"
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Smart Canteen <span className="text-orange-600 dark:text-orange-400 font-extrabold">PRO</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  RSCOE Pune • CSBS
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Live Smart Crowd & Wait Predictor (Requirement 8.A & 8.B) */}
          <div className="hidden lg:flex items-center gap-3">
            {crowdData && (
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${crowdData.crowdColor}`}
                title={`Based on ${crowdData.activeOrdersCount} active kitchen orders`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{crowdData.crowdLabel}</span>
                <span className="opacity-40">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{crowdData.estimatedWaitMinutes} min wait
                </span>
              </div>
            )}

            {/* Quick Demo Switcher for Evaluation */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
              <span className="px-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Demo
              </span>
              <button
                onClick={() => switchDemoAccount('STUDENT')}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  user?.role === 'STUDENT'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-orange-600'
                }`}
                title="Switch to Student account"
              >
                Student
              </button>
              <button
                onClick={() => switchDemoAccount('STAFF')}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  user?.role === 'STAFF'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-orange-600'
                }`}
                title="Switch to Staff Kitchen account"
              >
                Staff
              </button>
              <button
                onClick={() => switchDemoAccount('ADMIN')}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  user?.role === 'ADMIN'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-orange-600'
                }`}
                title="Switch to Administrator account"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Right: Actions (Theme, Cart, Notifs, Auth) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {/* Cart Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              type="button"
              className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Open Cart"
              title="View Cart & Checkout"
            >
              <ShoppingBag className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white shadow-md shadow-orange-600/30 animate-scale">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  type="button"
                  className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                              !n.isRead ? 'bg-orange-50/40 dark:bg-orange-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-xs text-slate-900 dark:text-white">
                                {n.title}
                              </p>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {n.message}
                            </p>
                            {n.link && (
                              <Link
                                href={n.link}
                                onClick={() => setIsNotifOpen(false)}
                                className="inline-block text-[11px] font-semibold text-orange-600 dark:text-orange-400 mt-1.5 hover:underline"
                              >
                                View Details →
                              </Link>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-600/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 mt-0.5">
                      {user.role} {user.role === 'STUDENT' ? `• ${user.loyaltyPoints} pts` : ''}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {user.studentId && (
                        <p className="text-[10px] font-mono text-orange-600 dark:text-orange-400 mt-0.5">
                          ID: {user.studentId}
                        </p>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      My Profile & Preferences
                    </Link>

                    <Link
                      href="/loyalty"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Loyalty Points & Coupons
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Admin Dashboard
                      </Link>
                    )}

                    {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                      <Link
                        href="/kitchen"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Clock className="w-4 h-4 text-sky-500" />
                        Kitchen Display & Scanner
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
