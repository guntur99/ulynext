"use client"; // Menandai komponen ini sebagai Client Component

import React, { useEffect, useState } from 'react'; // Import useState
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider'; // Import useAuth hook
import TravelRouteMap from '@/components/TravelRouteMap'; // Import komponen peta
import MarkersPage from '@/app/markers/page'; // Import komponen MarkersPage yang baru

/**
 * Interface untuk struktur data marker/tempat yang akan dikirim ke API
 */
interface NewPlaceMarkerData {
  nama: string;
  deskripsi: string;
  latitude: number;
  longitude: number;
  kategori?: string; // Menambahkan kategori opsional jika diperlukan oleh API
}

/**
 * Halaman utama aplikasi.
 * Menampilkan konten yang berbeda tergantung status autentikasi pengguna.
 */
const HomePage: React.FC = () => {
  // Dapatkan state dan fungsi dari konteks autentikasi
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const router = useRouter();

  // State untuk mengontrol visibilitas modal "Tambah Tempat"
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false);

  // State untuk input formulir dalam modal
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceDescription, setNewPlaceDescription] = useState('');
  const [newPlaceLatitude, setNewPlaceLatitude] = useState<number | ''>('');
  const [newPlaceLongitude, setNewPlaceLongitude] = useState<number | ''>('');
  const [newPlaceCategory, setNewPlaceCategory] = useState(''); // Tambahkan state untuk kategori
  const [isSubmittingPlace, setIsSubmittingPlace] = useState(false);
  const [submitPlaceError, setSubmitPlaceError] = useState<string | null>(null);
  const [submitPlaceSuccess, setSubmitPlaceSuccess] = useState<string | null>(null);

  // State to trigger refresh of MarkersPage
//   const [refreshMarkers, setRefreshMarkers] = useState(false);

  // Ganti placeholder URL ini dengan URL API dasar Anda yang sebenarnya
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Efek untuk mengarahkan pengguna jika tidak terautentikasi atau menangani peran yang tidak ada
  useEffect(() => {
    // Jika loading selesai dan pengguna tidak terautentikasi, arahkan ke halaman login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return; // Penting: Hentikan eksekusi useEffect setelah redirect
    }

    // Jika loading selesai, pengguna terautentikasi, tetapi objek user atau peran tidak ada.
    // Ini mengindikasikan masalah data atau status yang tidak valid.
    // Tindakan terbaik adalah melakukan logout dan mengarahkan kembali ke login.
    if (!isLoading && isAuthenticated && !user?.role) {
        console.warn("User authenticated but role is missing or undefined. Logging out and redirecting to login page.");
        logout(); // Lakukan logout secara eksplisit
        router.push('/login'); // Arahkan ke halaman login
        // Setelah logout dan push, state isAuthenticated akan berubah, memicu useEffect ini lagi
        // namun kondisi !isAuthenticated akan menangani redirect berikutnya.
        return; // Penting: Hentikan eksekusi useEffect setelah redirect
    }
  }, [isLoading, isAuthenticated, router, user, logout]); // Tambahkan `logout` ke dependensi useEffect

  // Fungsi untuk membuka modal "Tambah Tempat"
  const handleAddPlaceClick = () => {
    // Reset form state saat modal dibuka
    setNewPlaceName('');
    setNewPlaceDescription('');
    setNewPlaceLatitude('');
    setNewPlaceLongitude('');
    setNewPlaceCategory('');
    setSubmitPlaceError(null);
    setSubmitPlaceSuccess(null);
    setIsAddPlaceModalOpen(true);
  };

  // Fungsi untuk menutup modal "Tambah Tempat"
  const handleCloseModal = () => {
    setIsAddPlaceModalOpen(false);
    // Mungkin ada kebutuhan untuk me-refresh data MarkersPage di sini.
    // Ini bisa dilakukan dengan state management global (misal, Context API atau Redux)
    // atau dengan mempassing fungsi callback dari MarkersPage jika itu komponen anak langsung.
    // Untuk saat ini, kita biarkan kosong.
  };

  // Fungsi untuk menangani submit formulir tambah tempat
  const handleSubmitNewPlace = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmittingPlace(true);
    setSubmitPlaceError(null);
    setSubmitPlaceSuccess(null);

    // Validasi input
    if (!newPlaceName || !newPlaceDescription || newPlaceLatitude === '' || newPlaceLongitude === '') {
      setSubmitPlaceError("Semua field wajib diisi.");
      setIsSubmittingPlace(false);
      return;
    }

    if (isNaN(Number(newPlaceLatitude)) || isNaN(Number(newPlaceLongitude))) {
        setSubmitPlaceError("Latitude dan Longitude harus berupa angka.");
        setIsSubmittingPlace(false);
        return;
    }

    // Pastikan API_BASE_URL tersedia
    if (!API_BASE_URL) {
      setSubmitPlaceError("API Base URL tidak dikonfigurasi. Harap set NEXT_PUBLIC_API_BASE_URL.");
      setIsSubmittingPlace(false);
      return;
    }

    try {
      const token = user?.token; // Ambil token dari user

      const newPlaceData: NewPlaceMarkerData = {
        nama: newPlaceName,
        deskripsi: newPlaceDescription,
        latitude: Number(newPlaceLatitude), // Pastikan ini number
        longitude: Number(newPlaceLongitude), // Pastikan ini number
        kategori: newPlaceCategory || 'Uncategorized', // Default kategori jika tidak diisi
      };

      // CORS errors must be fixed on the backend; this is a frontend-only workaround for local development.
      const response = await fetch(`${API_BASE_URL}/api/markers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '', // Sertakan token autentikasi
        },
        body: JSON.stringify(newPlaceData),
        // mode: 'cors', // Default is 'cors', but CORS must be handled by the backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal menambahkan tempat: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Tempat berhasil ditambahkan:', result);
    // Trigger refresh of MarkersPage by toggling state
    // setRefreshMarkers((prev) => !prev);
      setSubmitPlaceSuccess("Tempat berhasil ditambahkan!");
      // Opsional: Reset form atau tutup modal setelah sukses
      setNewPlaceName('');
      setNewPlaceDescription('');
      setNewPlaceLatitude('');
      setNewPlaceLongitude('');
      setNewPlaceCategory('');
      handleCloseModal(); // Pertimbangkan apakah modal harus langsung ditutup atau tidak
                               // Bisa juga tampilkan pesan sukses sebentar lalu tutup.

                               <div className="mt-4">
                                 {submitPlaceSuccess && (
                                   <p className="text-green-500">{submitPlaceSuccess}</p>
                                 )}
                               </div>


    } catch (error: unknown) {
      console.error('Error adding new place:', error);
      if (error instanceof Error) {
        setSubmitPlaceError(`Terjadi kesalahan: ${error.message}`);
      } else {
        setSubmitPlaceError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsSubmittingPlace(false);
    }
  };

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
    <div className="home-container bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto my-10">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-700">
        Selamat datang, {user?.username || 'Pengguna'}!
      </h1>
      <p className="text-lg text-center mb-6 text-gray-600">Ini adalah halaman utama Anda.</p>
      
      <div className="flex justify-center mb-10 space-x-4">
        {/* Tombol "Tambah Markers" hanya untuk peran 'admin' */}
        {user?.role === 'admin' && (
          <button
            onClick={handleAddPlaceClick}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 font-semibold"
          >
            Tambah Markers
          </button>
        )}
      </div>

      {/* Komponen MarkersPage (tabel daftar tempat) hanya untuk peran 'admin' */}
      {/* Komponen MarkersPage (tabel daftar tempat) hanya untuk peran 'admin' */}
      {isAuthenticated && user?.role === 'admin' && (
        <MarkersPage />
      )}
      <hr className="my-8 border-gray-300" />

      {/* Bagian TravelRouteMap untuk peran 'user' atau siapa saja yang tidak memiliki role 'admin' */}
      {isAuthenticated && user?.role === 'user' && ( // Tampilkan khusus untuk user
        <>
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Rencanakan Perjalanan Anda</h2>
          <TravelRouteMap />
        </>
      )}

      {/* Modal untuk menambah tempat/marker hanya dirender jika isAddPlaceModalOpen true */}
      {isAddPlaceModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative animate-fade-in-up"> {/* Mengubah max-w-md menjadi max-w-lg untuk modal yang lebih besar */}
            {/* Tombol Tutup Modal */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              aria-label="Tutup"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Tambah Tempat Baru</h3>
            
            {/* Form input */}
            <form onSubmit={handleSubmitNewPlace} className="space-y-4">
              <div>
                <label htmlFor="placeName" className="block text-sm font-medium text-gray-700">Nama Tempat</label>
                <input
                  type="text"
                  id="placeName"
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  // Added text-gray-900 for dark text color
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="Masukkan nama tempat"
                  required
                />
              </div>
              <div>
                <label htmlFor="placeDescription" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  id="placeDescription"
                  value={newPlaceDescription}
                  onChange={(e) => setNewPlaceDescription(e.target.value)}
                  rows={3}
                  // Added text-gray-900 for dark text color
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="Deskripsikan tempat ini"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="placeLatitude" className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    type="number"
                    id="placeLatitude"
                    value={newPlaceLatitude}
                    onChange={(e) => setNewPlaceLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                    step="any"
                    // Added text-gray-900 for dark text color
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    placeholder="Contoh: -6.2088"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="placeLongitude" className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    type="number"
                    id="placeLongitude"
                    value={newPlaceLongitude}
                    onChange={(e) => setNewPlaceLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                    step="any"
                    // Added text-gray-900 for dark text color
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    placeholder="Contoh: 106.8456"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="placeCategory" className="block text-sm font-medium text-gray-700">Kategori (Opsional)</label>
                <input
                  type="text"
                  id="placeCategory"
                  value={newPlaceCategory}
                  onChange={(e) => setNewPlaceCategory(e.target.value)}
                  // Added text-gray-900 for dark text color
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="Contoh: Landmark, Beach, Restaurant"
                />
              </div>

              {/* Tampilkan pesan error atau sukses */}
              {submitPlaceError && (
                <p className="text-red-500 text-sm text-center">{submitPlaceError}</p>
              )}
              {submitPlaceSuccess && (
                <p className="text-green-600 text-sm text-center">{submitPlaceSuccess}</p>
              )}

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlace}
                  className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingPlace ? 'Menyimpan...' : 'Simpan Tempat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
