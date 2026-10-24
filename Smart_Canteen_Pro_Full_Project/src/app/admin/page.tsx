'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/authContext';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Download,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Package,
  MessageSquare,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'MENU' | 'INVENTORY' | 'COMPLAINTS'>('ANALYTICS');

  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [replyComplaintId, setReplyComplaintId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Form states for new menu item
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemVeg, setNewItemVeg] = useState(true);
  const [newItemStock, setNewItemStock] = useState('50');
  const [newItemPrepTime, setNewItemPrepTime] = useState('10');
  const [newItemImage, setNewItemImage] = useState('');

  // Restock form
  const [selectedInvId, setSelectedInvId] = useState('');
  const [restockQty, setRestockQty] = useState('');
  const [restockReason, setRestockReason] = useState('Weekly wholesale restock');

  // Waste form
  const [wasteItemName, setWasteItemName] = useState('');
  const [wasteQty, setWasteQty] = useState('');
  const [wasteUnit, setWasteUnit] = useState('kg');
  const [wasteValue, setWasteValue] = useState('');
  const [wasteReason, setWasteReason] = useState('End of day surplus');

  const fetchAllAdminData = async () => {
    try {
      const [orderRes, menuRes, catRes, invRes, compRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/menu'),
        fetch('/api/categories'),
        fetch('/api/inventory'),
        fetch('/api/complaints'),
      ]);

      if (orderRes.ok) setOrders((await orderRes.json()).orders || []);
      if (menuRes.ok) setMenuItems((await menuRes.json()).items || []);
      if (catRes.ok) {
        const cats = (await catRes.json()).categories || [];
        setCategories(cats);
        if (cats.length > 0 && !newItemCategory) setNewItemCategory(cats[0].id);
      }
      if (invRes.ok) setInventoryItems((await invRes.json()).items || []);
      if (compRes.ok) setComplaints((await compRes.json()).complaints || []);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const handleExportCsv = () => {
    window.open('/api/reports/export-csv', '_blank');
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName,
          description: newItemDesc,
          price: newItemPrice,
          categoryId: newItemCategory,
          isVeg: newItemVeg,
          stockQuantity: newItemStock,
          prepTimeMinutes: newItemPrepTime,
          imageUrl: newItemImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create menu item');
      } else {
        alert('Menu item created successfully!');
        setIsAddItemModalOpen(false);
        setNewItemName('');
        setNewItemDesc('');
        setNewItemPrice('');
        fetchAllAdminData();
      }
    } catch (e) {
      alert('Error creating menu item');
    }
  };

  const handleDeleteMenuItem = async (itemId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete or disable "${name}"?`)) return;
    try {
      const res = await fetch(`/api/menu/${itemId}`, { method: 'DELETE' });
      const data = await res.json();
      alert(data.message || 'Item updated.');
      fetchAllAdminData();
    } catch (e) {
      alert('Error deleting item.');
    }
  };

  const handleToggleSurplus = async (itemId: string, currentSurplus: boolean) => {
    try {
      const res = await fetch('/api/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_SURPLUS',
          menuItemId: itemId,
          isSurplus: !currentSurplus,
          surplusDiscountPercent: 20,
        }),
      });
      const data = await res.json();
      alert(data.message || 'Surplus offer updated.');
      fetchAllAdminData();
    } catch (e) {
      alert('Error toggling surplus');
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESTOCK',
          inventoryItemId: selectedInvId,
          quantity: restockQty,
          reason: restockReason,
        }),
      });
      const data = await res.json();
      alert(data.message || 'Inventory restocked.');
      setIsRestockModalOpen(false);
      setRestockQty('');
      fetchAllAdminData();
    } catch (e) {
      alert('Error updating inventory.');
    }
  };

  const handleLogWasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LOG_WASTE',
          itemName: wasteItemName,
          quantity: wasteQty,
          unit: wasteUnit,
          estimatedValue: wasteValue,
          reason: wasteReason,
        }),
      });
      const data = await res.json();
      alert(data.message || 'Waste record logged.');
      setIsWasteModalOpen(false);
      setWasteItemName('');
      setWasteQty('');
      setWasteValue('');
      fetchAllAdminData();
    } catch (e) {
      alert('Error logging waste.');
    }
  };

  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyComplaintId) return;

    try {
      const res = await fetch('/api/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: replyComplaintId,
          status: 'RESOLVED',
          adminResponse: adminReplyText,
        }),
      });
      const data = await res.json();
      alert(data.message || 'Complaint resolved.');
      setReplyComplaintId(null);
      setAdminReplyText('');
      fetchAllAdminData();
    } catch (e) {
      alert('Error resolving complaint');
    }
  };

  if (authLoading) return <div className="p-12 text-center text-xs">Checking permissions...</div>;

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex-1 flex w-full">
        <Sidebar />
        <div className="flex-1 max-w-xl mx-auto p-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Administrator Access Required</h2>
          <p className="text-xs text-slate-500">
            This dashboard is protected and accessible only by authorized Canteen Managers and Administrators.
          </p>
        </div>
      </div>
    );
  }

  // Analytics Metrics Calculations
  const completedOrders = orders.filter((o) => o.status === 'COLLECTED');
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED');
  const grossSales = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.totalAmount : 0), 0);
  const netCollected = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = completedOrders.length > 0 ? netCollected / completedOrders.length : 0;
  const cancellationRate = orders.length > 0 ? (cancelledOrders.length / orders.length) * 100 : 0;

  return (
    <div className="flex-1 flex w-full">
      <Sidebar />

      <div className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <LayoutDashboard className="w-7 h-7 text-orange-600" />
              <span>Canteen Management & Control Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real analytics, menu controls, inventory restocking, and CSV reports
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Sales CSV</span>
            </button>
            <button
              onClick={fetchAllAdminData}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'ANALYTICS', label: 'Analytics & KPIs' },
            { id: 'MENU', label: 'Menu Catalog' },
            { id: 'INVENTORY', label: 'Inventory & Supplies' },
            { id: 'COMPLAINTS', label: `Support Tickets (${complaints.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ANALYTICS */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Gross Sales Recorded
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{grossSales.toFixed(2)}
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  Net Collected: ₹{netCollected.toFixed(2)}
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {orders.length}
                </h3>
                <span className="text-[11px] text-orange-600 font-semibold">
                  {completedOrders.length} Completed Handover
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Average Order Value
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{avgOrderValue.toFixed(2)}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  Per fulfilled student order
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Cancellation Rate
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {cancellationRate.toFixed(1)}%
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {cancelledOrders.length} voids / rejections
                </span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Recent Order Records & Tokens
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="pb-3">Token</th>
                      <th className="pb-3">Order No</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {orders.slice(0, 10).map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-mono font-bold text-orange-600">{o.tokenNumber}</td>
                        <td className="py-3 font-mono text-slate-500">{o.orderNumber}</td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          {o.user?.name}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">
                          {o.items?.length || 0} items
                        </td>
                        <td className="py-3 font-bold">₹{o.totalAmount.toFixed(2)}</td>
                        <td className="py-3 text-emerald-600 font-bold">{o.paymentStatus}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MENU MANAGEMENT */}
        {activeTab === 'MENU' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Menu Items Catalog ({menuItems.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Add, update, or toggle surplus food reduction offers
                </p>
              </div>

              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-black text-orange-600 mt-0.5">₹{item.price}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Stock: {item.stockQuantity} • {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleToggleSurplus(item.id, item.isSurplus)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                          item.isSurplus
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                        title="Toggle surplus flash sale discount"
                      >
                        <Flame className="w-3 h-3" />
                        <span>{item.isSurplus ? 'Surplus Deal ON' : 'Make Surplus'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMenuItem(item.id, item.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-auto"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY & SUPPLIES */}
        {activeTab === 'INVENTORY' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-600" />
                  <span>Inventory & Supplier Management</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Track raw ingredients, supplier contacts, and restock records
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWasteModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 text-xs font-bold hover:bg-rose-50"
                >
                  Log Food Waste
                </button>
                <button
                  onClick={() => setIsRestockModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20"
                >
                  Restock Ingredients
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="pb-3">Ingredient</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Current Stock</th>
                    <th className="pb-3">Min Threshold</th>
                    <th className="pb-3">Supplier Name & Phone</th>
                    <th className="pb-3">Cost / Unit</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {inventoryItems.map((inv) => {
                    const isLow = inv.currentStock <= inv.minThreshold;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          {inv.name}
                        </td>
                        <td className="py-3 text-slate-500">{inv.category}</td>
                        <td className="py-3 font-bold">
                          {inv.currentStock} {inv.unit}
                        </td>
                        <td className="py-3 text-slate-500">
                          {inv.minThreshold} {inv.unit}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">
                          {inv.supplierName} ({inv.supplierPhone || 'Verified'})
                        </td>
                        <td className="py-3 font-bold">₹{inv.costPerUnit}</td>
                        <td className="py-3">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400">
                              Low Stock Alert
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                              Optimal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: COMPLAINTS & FEEDBACK */}
        {activeTab === 'COMPLAINTS' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-600" />
                <span>Student Support Tickets & Complaints</span>
              </h3>
              <p className="text-xs text-slate-500">
                Review grievances, respond to students, and resolve issues
              </p>
            </div>

            {complaints.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No complaint tickets recorded.</p>
            ) : (
              <div className="space-y-4">
                {complaints.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-orange-600">
                          {c.ticketNumber}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {c.subject}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-4">
                      <span>Student: {c.user?.name} ({c.user?.studentId || 'ID Verified'})</span>
                      <span>Date: {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>

                    {c.adminResponse && (
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
                        <span className="font-bold text-orange-600 block mb-0.5">Admin Response:</span>
                        <p className="text-slate-600 dark:text-slate-300">{c.adminResponse}</p>
                      </div>
                    )}

                    {c.status !== 'RESOLVED' && (
                      <button
                        onClick={() => setReplyComplaintId(c.id)}
                        className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700"
                      >
                        Reply & Resolve Ticket
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Add Menu Item */}
        {isAddItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <form
              onSubmit={handleCreateMenuItem}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Food Item</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Masala Dosa"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="e.g. Crispy fermented rice crepe served with fresh sambar..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Price in ₹</label>
                    <input
                      type="number"
                      required
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      placeholder="e.g. 70"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Category</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={newItemStock}
                      onChange={(e) => setNewItemStock(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Prep Time (mins)</label>
                    <input
                      type="number"
                      value={newItemPrepTime}
                      onChange={(e) => setNewItemPrepTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Food Image URL</label>
                  <input
                    type="url"
                    value={newItemImage}
                    onChange={(e) => setNewItemImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={newItemVeg}
                    onChange={(e) => setNewItemVeg(e.target.checked)}
                    id="vegCheckbox"
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <label htmlFor="vegCheckbox" className="font-bold">
                    Vegetarian Item
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
                >
                  Save Menu Item
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Restock */}
        {isRestockModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <form
              onSubmit={handleRestockSubmit}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Restock Ingredient
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Select Ingredient</label>
                  <select
                    value={selectedInvId}
                    onChange={(e) => setSelectedInvId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Choose Item --</option>
                    {inventoryItems.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} (Current: {inv.currentStock} {inv.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Quantity to Add</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Restock Reason</label>
                  <input
                    type="text"
                    value={restockReason}
                    onChange={(e) => setRestockReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Waste Log */}
        {isWasteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <form
              onSubmit={handleLogWasteSubmit}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Log Food Wastage
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={wasteItemName}
                    onChange={(e) => setWasteItemName(e.target.value)}
                    placeholder="e.g. Cooked Rice"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold block mb-1">Quantity</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={wasteQty}
                      onChange={(e) => setWasteQty(e.target.value)}
                      placeholder="e.g. 2.0"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Unit</label>
                    <input
                      type="text"
                      value={wasteUnit}
                      onChange={(e) => setWasteUnit(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={wasteValue}
                    onChange={(e) => setWasteValue(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWasteModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Log Wastage
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Complaint Reply */}
        {replyComplaintId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <form
              onSubmit={handleResolveComplaint}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Resolve Support Ticket
              </h3>
              <textarea
                rows={3}
                required
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                placeholder="Enter response for student (e.g. We have instructed the chef and refunded your token)..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyComplaintId(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Send & Resolve
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
