// src/components/RegisterForm.tsx
"use client"; // Menandai komponen ini sebagai Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Menggunakan useRouter dari next/navigation untuk App Router
import api from '@/lib/api'; // Import instance Axios yang sudah dikonfigurasi

/**
 * Komponen form untuk registrasi pengguna baru.
 */
const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const router = useRouter(); // Inisialisasi router

  /**
   * Handler untuk submit form registrasi.
   * Mengirim data ke API backend dan menangani respons.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError(false);

    try {
      // Sesuaikan endpoint dan payload dengan backend Axum Anda
      await api.post('/auth/register', { username, email, password });
      setMessage('Registrasi berhasil! Silakan login.');
      router.push('/login'); // Redirect ke halaman login setelah registrasi berhasil
    } catch (err: any) {
      setError(true);
      setMessage(err.response?.data?.message || 'Registrasi gagal. Coba lagi.');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Registrasi</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors duration-300 font-semibold"
        >
          Daftar
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center ${error ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
      <p className="mt-4 text-center text-gray-600">
        Sudah punya akun? <a href="/login" className="text-blue-600 hover:underline">Login di sini</a>
      </p>
    </div>
  );
};

export default RegisterForm;