// src/components/Header.tsx
"use client"; // Menandai komponen ini sebagai Client Component

import React from 'react';
import Link from 'next/link'; // Menggunakan Link dari next/link
import { useAuth } from '@/components/AuthProvider'; // Import useAuth hook

/**
 * Komponen header navigasi aplikasi.
 * Menampilkan link navigasi dan status autentikasi pengguna.
 */
const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth(); // Dapatkan state dan fungsi dari konteks autentikasi

  return (
    <header className="bg-blue-800 text-white p-4 shadow-lg">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-white hover:text-blue-200 transition-colors duration-200">
          TravelApp
        </Link>
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <span className="text-lg font-medium">Halo, {user?.username || 'Pengguna'}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition-colors duration-300 font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-lg font-medium text-white hover:text-blue-200 transition-colors duration-200">
                Login
              </Link>
              <Link href="/register" className="text-lg font-medium text-white hover:text-blue-200 transition-colors duration-200">
                Registrasi
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;