// src/app/page.tsx
"use client"; // Menandai komponen ini sebagai Client Component

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider'; // Import useAuth hook
import TravelRouteMap from '@/components/TravelRouteMap'; // Import komponen peta

/**
 * Halaman utama aplikasi.
 * Menampilkan konten yang berbeda tergantung status autentikasi pengguna.
 */
const HomePage: React.FC = () => {
  const { isAuthenticated, user, isLoading, logout } = useAuth(); // Dapatkan state dan fungsi dari konteks autentikasi
  const router = useRouter();

  // Efek untuk mengarahkan pengguna jika tidak terautentikasi dan loading selesai
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login'); // Arahkan ke halaman login jika belum login
    }
  }, [isLoading, isAuthenticated, router]);

  // Tampilkan loading state saat autentikasi sedang dicek
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Memuat...</p>
      </div>
    );
  }

  // Tampilkan konten halaman jika sudah terautentikasi
  return (
    <div className="home-container bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-700">
        Selamat datang, {user?.username || 'Pengguna'}!
      </h1>
      <p className="text-lg text-center mb-6 text-gray-600">Ini adalah halaman utama Anda.</p>
      <div className="flex justify-center mb-10">
        <button
          onClick={logout}
          className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300 font-semibold"
        >
          Logout
        </button>
      </div>

      <hr className="my-8 border-gray-300" />

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Rencanakan Perjalanan Anda</h2>
      <TravelRouteMap />
    </div>
  );
};

export default HomePage;