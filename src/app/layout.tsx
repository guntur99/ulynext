// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Import global CSS (termasuk Tailwind)
import { AuthProvider } from '@/components/AuthProvider'; // Import AuthProvider
import Header from '@/components/Header'; // Import Header
import { TripDataProvider } from '../context/TripDataContext'; // Import your context provider
import Script from 'next/script'; // Import the Script component from next/script

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TravelApp Next.js',
  description: 'Aplikasi perencanaan perjalanan dengan Next.js dan Google Maps.',
};

/**
 * Root layout for the Next.js application.
 * Wraps the entire application with AuthProvider and provides the basic structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 text-gray-800`}>
        <AuthProvider>
          <Header />
          <main className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
            <TripDataProvider>
              {children}
            </TripDataProvider>
          </main>
        </AuthProvider>

        {/* Load Google Maps JavaScript API using next/script */}
        {/* It's crucial to use 'geometry' library for decoding polylines */}
        <Script
          id="google-maps-script" // A unique ID for the script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`}
          strategy="beforeInteractive" // This strategy helps load the script early
          // Do NOT include onError or onLoad props here when using "beforeInteractive" strategy
          // Client-side detection in ResultsPage will handle readiness.
        />
      </body>
    </html>
  );
}