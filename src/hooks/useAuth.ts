// src/hooks/useAuth.ts
import { useAuth as useAuthContext } from '@/components/AuthProvider';

/**
 * Custom hook untuk mengakses konteks autentikasi.
 * Ini adalah re-export dari useAuth yang didefinisikan di AuthProvider.
 * Memungkinkan penggunaan yang lebih bersih di komponen lain: `import { useAuth } from '@/hooks/useAuth';`
 */
export const useAuth = useAuthContext;
