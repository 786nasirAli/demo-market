import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { Navbar } from '@/components/layout/navbar';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Demo Marketplace – Luxury Divan Beds & Bedroom Furniture',
  description:
    'Customisable divan beds with live dynamic pricing, colour swatches, and bespoke storage options. Built for the ESOLS Technologies Software Engineer Assessment.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Demo Marketplace',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F172A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <ServiceWorkerRegister />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <footer className="bg-slate-900 text-slate-400 py-10 px-4 border-t border-slate-800 text-xs">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-white text-sm">Demo Marketplace</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ESOLS Technologies Software Engineer Practical Assessment MVP. Reference product: Prague Divan Bed.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>Role-Based Access</span>
                  <span>•</span>
                  <span>Installable PWA</span>
                  <span>•</span>
                  <span>Server-Verified Pricing</span>
                </div>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
