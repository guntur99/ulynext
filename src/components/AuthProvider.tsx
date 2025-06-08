// src/components/AuthProvider.tsx
"use client"; // Menandai komponen ini sebagai Client Component

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthState, AuthContextType, User } from '@/types/auth'; // Import types

// Buat AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider adalah komponen yang menyediakan state dan fungsi autentikasi
 * ke seluruh aplikasi melalui React Context.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true, // Set true secara default saat aplikasi pertama dimuat
  });

  // Efek untuk menginisialisasi state autentikasi dari localStorage saat komponen mount
  useEffect(() => {
    if (typeof window !== 'undefined') { // Pastikan kode berjalan di sisi klien
      const storedToken = localStorage.getItem('jwt_token');
        // Jika ada token di localStorage, decode token tersebut
        // console.log(storedToken);
        
        // setAuthState((prev) => ({ ...prev, isLoading: true })); // Set isLoading true saat memuat
      if (storedToken) {
        try {
          const decoded: any = jwtDecode(storedToken);
            console.log(decoded);
          // Periksa apakah token masih valid (opsional, tambahkan logika is_expired jika perlu)
          const user: User = {
            id: decoded.sub,
            username: decoded.username || decoded.sub,
            email: decoded.email || undefined,
            role: decoded.role || undefined, // Tambahkan role jika ada
            token: storedToken, // Simpan token di user untuk akses mudah
          };
          setAuthState({
            token: storedToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to decode JWT from localStorage:", error);
          localStorage.removeItem('jwt_token');
          setAuthState({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false })); // Selesai memuat jika tidak ada token
      }
    } else {
        setAuthState((prev) => ({ ...prev, isLoading: false })); // Selesai memuat jika di server
    }
  }, []);

  /**
   * Fungsi untuk login pengguna.
   * Menyimpan token ke localStorage dan memperbarui state.
   * @param newToken Token JWT yang diterima dari API.
   */
  const login = (newToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jwt_token', newToken);
      try {
        const decoded: any = jwtDecode(newToken);
        const user: User = {
          id: decoded.sub,
          username: decoded.username || decoded.sub,
          email: decoded.email || undefined,
          role: decoded.role || undefined, // Tambahkan role jika ada
        };
        setAuthState({
          token: newToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to decode JWT after login:", error);
        logout(); // Logout jika token tidak valid
      }
    }
  };

  /**
   * Fungsi untuk logout pengguna.
   * Menghapus token dari localStorage dan mereset state.
   */
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // Nilai yang akan disediakan oleh konteks
  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook untuk menggunakan konteks autentikasi.
 * Memudahkan akses ke state dan fungsi autentikasi di komponen.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};