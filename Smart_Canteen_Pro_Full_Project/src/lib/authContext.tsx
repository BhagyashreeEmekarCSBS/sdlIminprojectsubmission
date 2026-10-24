'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  phone?: string;
  studentId?: string;
  department?: string;
  year?: string;
  loyaltyPoints: number;
  favorites?: string[];
  unreadNotificationsCount?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchDemoAccount: (role: 'STUDENT' | 'STAFF' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to sign in' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error during sign-in' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create account' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error during registration' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (e) {
      setUser(null);
    }
  };

  // 1-Click Demo Account switch helper for fast grading and viva presentation!
  const switchDemoAccount = async (role: 'STUDENT' | 'STAFF' | 'ADMIN') => {
    let email = 'student@rscoe.edu';
    let password = 'Student@123';

    if (role === 'STAFF') {
      email = 'staff@canteen.rscoe.edu';
      password = 'Staff@123';
    } else if (role === 'ADMIN') {
      email = 'admin@canteen.rscoe.edu';
      password = 'Admin@123';
    }

    const res = await login(email, password);
    if (res.success) {
      if (role === 'ADMIN') router.push('/admin');
      else if (role === 'STAFF') router.push('/kitchen');
      else router.push('/menu');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
