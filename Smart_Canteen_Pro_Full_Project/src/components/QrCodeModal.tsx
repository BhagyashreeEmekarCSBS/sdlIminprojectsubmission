'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Printer, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface QrModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function QrCodeModal({ order, isOpen, onClose }: QrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (order && order.qrCodeData) {
      QRCode.toDataURL(order.qrCodeData, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 260,
        color: { dark: '#0f172a', light: '#ffffff' },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300';
      case 'PREPARING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border-amber-300';
      case 'COLLECTED':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
      case 'CONFIRMED':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-400 border-sky-300';
      default:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400 border-orange-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Smart Pickup Pass
            </span>
            <p className="text-xs text-slate-500 font-medium">Show at Canteen Counter</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Token Number Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Pickup Token
          </span>
          <h2 className="text-4xl font-black text-orange-600 dark:text-orange-400 tracking-wider mt-1">
            {order.tokenNumber}
          </h2>
          <span
            className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>

        {/* QR Code Image */}
        <div className="flex flex-col items-center justify-center py-2">
          {qrDataUrl ? (
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
              <img src={qrDataUrl} alt="Order QR Code" className="w-48 h-48 rounded-lg" />
            </div>
          ) : (
            <div className="w-48 h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center animate-pulse text-xs text-slate-400">
              Generating Secure QR...
            </div>
          )}
          <p className="text-[11px] text-slate-400 font-mono mt-2">{order.orderNumber}</p>
        </div>

        {/* Order Details Brief */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-left space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Pickup Slot:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{order.pickupSlot}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Items:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {order.items?.length || 0} items (₹{order.totalAmount?.toFixed(2)})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment:</span>
            <span className="font-bold text-emerald-600">{order.paymentMethod} (PAID)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handlePrint}
            type="button"
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/25 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
