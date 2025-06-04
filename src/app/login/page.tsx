// src/app/(auth)/login/page.tsx
"use client"; // Menandai komponen ini sebagai Client Component

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm'; // Import komponen LoginForm
import { useAuth } from '@/components/AuthProvider'; // Import useAuth hook

/**
 * Halaman login.
 * Mengarahkan pengguna ke halaman utama jika sudah login.
 */
const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth(); // Dapatkan state autentikasi
  const router = useRouter();

  // Efek untuk mengarahkan pengguna jika sudah terautentikasi dan loading selesai
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/'); // Arahkan ke halaman utama jika sudah login
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

  // Tampilkan form login jika belum terautentikasi
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-128px)] py-8">
      <LoginForm />
    </div>
  );
};

export default LoginPage;