// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Import global CSS (termasuk Tailwind)
import { AuthProvider } from '@/components/AuthProvider'; // Import AuthProvider
import Header from '@/components/Header'; // Import Header

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TravelApp Next.js',
  description: 'Aplikasi perencanaan perjalanan dengan Next.js dan Google Maps.',
};

/**
 * Root layout untuk aplikasi Next.js.
 * Membungkus seluruh aplikasi dengan AuthProvider dan menyediakan struktur dasar.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Script untuk Google Maps API */}
        {/* Ganti YOUR_GOOGLE_MAPS_API_KEY dengan kunci API Anda */}
        <script
          async
          defer
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        ></script>
      </head>
      <body className={`${inter.className} bg-gray-100 text-gray-800`}>
        <AuthProvider>
          <Header />
          <main className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}