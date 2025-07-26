// src/lib/api.ts
import axios from 'axios';

// Dapatkan base URL dari variabel lingkungan
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Instance Axios yang sudah dikonfigurasi untuk berkomunikasi dengan backend.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token JWT ke setiap permintaan
api.interceptors.request.use(
  (config) => {
    // Pastikan kode berjalan di sisi klien sebelum mengakses localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani respons error (misalnya, 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Jika terjadi 401 Unauthorized, hapus token dan redirect ke halaman login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token');
        // Redirect ke halaman login. Gunakan window.location.href untuk hard refresh
        // atau router.push jika Anda memiliki akses ke Next.js router di sini.
        // Untuk kesederhanaan, kita akan biarkan komponen yang menggunakan `useAuth`
        // menangani redirect setelah state autentikasi berubah.
      }
    }
    return Promise.reject(error);
  }
);

export default api;