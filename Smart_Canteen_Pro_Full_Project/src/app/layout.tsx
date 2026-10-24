import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { CartProvider } from '@/lib/cartContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'Smart Canteen Pro - RSCOE Pune',
  description: 'Smart Canteen Pre-Order & Token System for Rajarshi Shahu College of Engineering, Pune',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-orange-500 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-1 flex flex-col">{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
