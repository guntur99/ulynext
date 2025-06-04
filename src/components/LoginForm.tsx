// src/components/LoginForm.tsx
"use client"; // Menandai komponen ini sebagai Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Menggunakan useRouter dari next/navigation
import api from '@/lib/api'; // Import instance Axios
import { useAuth } from '@/components/AuthProvider'; // Import useAuth hook dari AuthProvider

/**
 * Komponen form untuk login pengguna.
 */
const LoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const router = useRouter(); // Inisialisasi router
  const { login } = useAuth(); // Dapatkan fungsi login dari konteks autentikasi

  /**
   * Handler untuk submit form login.
   * Mengirim kredensial ke API backend, menyimpan token, dan memperbarui state autentikasi.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError(false);

    try {
      // Sesuaikan endpoint dan payload dengan backend Axum Anda
      const response = await api.post('/auth/login', { username, password });
      const token: string = response.data.token; // Asumsi backend mengembalikan { token: "..." }

      login(token); // Panggil fungsi login dari konteks untuk menyimpan token dan memperbarui state
      setMessage('Login berhasil!');
      router.push('/'); // Redirect ke halaman utama setelah login berhasil
    } catch (err: any) {
      setError(true);
      setMessage(err.response?.data?.message || 'Login gagal. Periksa username dan password Anda.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
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
          Login
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center ${error ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
      <p className="mt-4 text-center text-gray-600">
        Belum punya akun? <a href="/register" className="text-blue-600 hover:underline">Daftar di sini</a>
      </p>
    </div>
  );
};

export default LoginForm;