// src/types/auth.ts

/**
 * Interface untuk data pengguna yang disimpan dalam state autentikasi.
 */
export interface User {
    id: string;
    username: string;
    email?: string; // Tambahkan properti lain jika ada
  }
  
  /**
   * Interface untuk state autentikasi.
   */
  export interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean; // Menunjukkan apakah proses inisialisasi autentikasi sedang berjalan
  }
  
  /**
   * Interface untuk konteks autentikasi, termasuk state dan fungsi-fungsi.
   */
  export interface AuthContextType extends AuthState {
    login: (token: string) => void;
    logout: () => void;
  }