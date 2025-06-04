// src/app/(auth)/register/page.tsx
"use client"; // Menandai komponen ini sebagai Client Component

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/RegisterForm'; // Import komponen RegisterForm
import { useAuth } from '@/components/AuthProvider'; // Import useAuth hook

/**
 * Halaman registrasi.
 * Mengarahkan pengguna ke halaman utama jika sudah login.
 */
const RegisterPage: React.FC = () => {
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

  // Tampilkan form registrasi jika belum terautentikasi
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-128px)] py-8">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;