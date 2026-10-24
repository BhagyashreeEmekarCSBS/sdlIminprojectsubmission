'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/authContext';
import { User, Phone, Mail, Award, BookOpen, Save, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [department, setDepartment] = useState(user?.department || 'CSBS');
  const [year, setYear] = useState(user?.year || 'S.Y. B.Tech');
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, studentId, department, year }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Profile updated successfully!');
        await refreshUser();
      } else {
        setMsg(data.error || 'Failed to update profile');
      }
    } catch (e) {
      setMsg('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex w-full">
      <Sidebar />

      <div className="flex-1 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <User className="w-7 h-7 text-orange-600" />
            <span>Student Profile & Account Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal college contact details and academic branch
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-orange-600/10 text-orange-600 font-black text-2xl flex items-center justify-center">
              {user ? user.name.charAt(0) : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400">
                  {user?.role}
                </span>
                <span className="text-xs text-amber-600 font-bold">
                  {user?.loyaltyPoints} Loyalty Points
                </span>
              </div>
            </div>
          </div>

          {msg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{msg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Roll Number / Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
