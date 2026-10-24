'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  Home,
  UtensilsCrossed,
  Clock,
  Sparkles,
  MessageSquare,
  CookingPot,
  LayoutDashboard,
  User,
  Coffee,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Food Menu', href: '/menu', icon: UtensilsCrossed },
    { label: 'My Orders & Tokens', href: '/orders', icon: Clock },
    { label: 'Loyalty & Offers', href: '/loyalty', icon: Sparkles },
    { label: 'Feedback & Support', href: '/feedback', icon: MessageSquare },
  ];

  // Staff & Admin tabs
  if (user?.role === 'STAFF' || user?.role === 'ADMIN') {
    navItems.push({ label: 'Kitchen & Scanner', href: '/kitchen', icon: CookingPot });
  }

  // Admin exclusive tabs
  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard });
  }

  const content = (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between md:hidden pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-slate-900 dark:text-white">Navigation</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Canteen Hours & Campus Info */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Coffee className="w-4 h-4" />
            <span>Canteen Timings</span>
          </div>
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 mt-1">
            08:00 AM - 08:00 PM
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            RSCOE Tathawade Campus, Pune
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-4rem)] sticky top-16 transition-colors">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
