"use client"; // Menandai komponen ini sebagai Client Component

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider'; // Import useAuth hook

// Import AG Grid components dan styles
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-theme-alpine.css";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);
/**
 * Interface untuk struktur data marker/tempat
 */
interface PlaceMarker {
  id: string; // Tambahkan ID untuk identifikasi unik
  name: string;
  description: string;
  kategori: string;
  latitude?: number; // Tambahkan properti opsional untuk koordinat
  longitude?: number;
  // Anda mungkin perlu menambahkan properti lain sesuai respons API Anda
}

/**
 * Komponen halaman yang menampilkan daftar places/markers menggunakan AG Grid.
 * Data diambil dari API.
 */
const MarkersPage: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth(); // Dapatkan state autentikasi untuk fetch data
  const router = useRouter();

  // State untuk data tabel tempat/marker yang akan diambil dari API
  const [rowData, setRowData] = useState<PlaceMarker[]>([]);
  // State untuk menunjukkan status loading data tabel
  const [isPlacesDataLoading, setIsPlacesDataLoading] = useState(true);
  // State untuk menyimpan error jika terjadi saat fetch data
  const [placesDataError, setPlacesDataError] = useState<string | null>(null);

  // Ganti placeholder URL ini dengan URL API dasar Anda yang sebenarnya
  // Pastikan NEXT_PUBLIC_API_BASE_URL sudah diatur di file .env.local Anda
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Definisikan kolom untuk AG Grid menggunakan useMemo
  // columnDefs akan diinisialisasi berdasarkan keys dari rowData pertama atau fallback default
  const columnDefs = useMemo(() => {
    // Ambil semua key unik dari rowData (jika ada data)
    const keys = rowData.length > 0
        ? Object.keys(rowData[0]).filter(key => key !== 'latitude' && key !== 'longitude') // Filter out coords if not needed in table
        : ["name", "location", "category"]; // Fallback default jika data kosong

    // Buat definisi kolom secara dinamis
    const columns = [
      {
        headerName: "No",
        valueGetter: (params: any) => params.node ? params.node.rowIndex + 1 : '',
        filter: false,
        sortable: false,
        resizable: false,
        minWidth: 60,
        maxWidth: 80,
      },
      {
        field: "name",
        headerName: "Nama Tempat",
        filter: true,
        sortable: true,
        resizable: true,
      },
      {
        field: "description",
        headerName: "Deskripsi",
        filter: true,
        sortable: true,
        resizable: true,
      }
    ];

    // Anda bisa menambahkan kolom aksi di sini jika diinginkan
    columns.push({
      headerName: "Action",
      cellRenderer: (params: any) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={async () => {
              const marker = params.data as PlaceMarker;
              if (!API_BASE_URL || !user?.token) return;
              const newName = prompt("Edit Nama Tempat:", marker.name);
              if (newName === null || newName === marker.name) return;
              try {
            const res = await fetch(`${API_BASE_URL}/markers/${marker.id}`, {
              method: "PUT",
              headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ...marker, name: newName }),
            });
            if (!res.ok) throw new Error("Gagal mengedit marker");
            fetchPlacesData();
              } catch (e) {
            alert("Gagal mengedit marker");
              }
            }}
          >
            Edit
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={async () => {
              const marker = params.data as PlaceMarker;
              if (!API_BASE_URL || !user?.token) return;
              if (!confirm(`Hapus marker "${marker.name}"?`)) return;
              try {
            const res = await fetch(`${API_BASE_URL}/markers/${marker.id}`, {
              method: "DELETE",
              headers: {
                'Authorization': `Bearer ${user.token}`,
              },
            });
            if (!res.ok) throw new Error("Gagal menghapus marker");
            fetchPlacesData();
              } catch (e) {
            alert("Gagal menghapus marker");
              }
            }}
          >
            Hapus
          </button>
        </div>
      ),
      minWidth: 120,
      maxWidth: 150,
      flex: 0,
      sortable: false,
      filter: false,
      resizable: false,
    });

    return columns;
  }, [rowData]); // columnDefs akan dibuat ulang jika rowData berubah

  // DefaultColDef untuk mengatur properti default untuk semua kolom
  const defaultColDef = useMemo(() => ({
    flex: 1, // Setiap kolom akan mengisi ruang yang tersedia secara merata
    minWidth: 100, // Lebar minimum kolom
    floatingFilter: true, // Tampilkan filter di bawah header kolom
  }), []);

  // Fungsi untuk mengambil data places/markers dari API
  const fetchPlacesData = useCallback(async () => {
    setIsPlacesDataLoading(true);
    setPlacesDataError(null);

    // Pastikan API_BASE_URL tersedia
    if (!API_BASE_URL) {
      setPlacesDataError("API Base URL tidak dikonfigurasi. Harap set NEXT_PUBLIC_API_BASE_URL.");
      setIsPlacesDataLoading(false);
      return;
    }

    try {
      // Ambil token dari user (misal user.token, sesuaikan dengan struktur user Anda)
      // Asumsi `user` memiliki properti `token`
      const token = user?.token;
        if (!token) {
            setPlacesDataError("Token tidak ditemukan. Pastikan Anda sudah login.");
            setIsPlacesDataLoading(false);
            return;
        }

      const response = await fetch(`${API_BASE_URL}/markers`, {
        headers: {
          // Pastikan token ada sebelum menambahkannya ke header
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Tangani respons non-OK, misalnya 401 Unauthorized
        if (response.status === 401) {
            router.push('/login'); // Arahkan ke login jika token tidak valid
            return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal mengambil data: ${response.statusText}`);
      }

      const data: PlaceMarker[] = await response.json();
    //   console.log("Fetched places data:", data); // Debug log untuk melihat data yang diambil

      setRowData(data);
    } catch (error: any) {
      console.error("Error fetching places data:", error);
      setPlacesDataError(`Gagal memuat data tempat: ${error.message}`);
    } finally {
      setIsPlacesDataLoading(false);
    }
  }, [API_BASE_URL, user, router]); // Tambahkan `user` dan `router` ke dependensi

  // Efek untuk mengarahkan pengguna jika tidak terautentikasi dan loading selesai
  // Dan untuk memicu pengambilan data saat komponen dimuat atau status autentikasi berubah
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login'); // Arahkan ke halaman login jika belum login
    }
    // Jika autentikasi sudah selesai dan pengguna terautentikasi, ambil data tempat
    if (!isLoading && isAuthenticated) {
      fetchPlacesData();
    }
  }, [isLoading, isAuthenticated, router, fetchPlacesData]);

  // Tampilkan loading state saat autentikasi sedang dicek
  if (isLoading || isPlacesDataLoading) { // Gabungkan loading autentikasi dan loading data
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Memuat data tempat...</p>
      </div>
    );
  }

  // Tampilkan error jika gagal mengambil data
  if (placesDataError) {
    return (
      <div className="text-center text-red-500 border border-red-300 bg-red-50 rounded-md max-w-2xl mx-auto my-10">
        <p className="font-semibold">Error:</p>
        <p>{placesDataError}</p>
        <button
          onClick={fetchPlacesData}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // Tampilkan tabel jika data sudah dimuat dan tidak ada error
  return (
    <div className="p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Daftar Tempat Tersimpan</h2>
      <div className="text-dark" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={rowData} // Data yang akan ditampilkan di tabel
          columnDefs={columnDefs} // Definisi kolom
          defaultColDef={defaultColDef} // Definisi kolom default
          animateRows={true} // Animasi baris saat data berubah
          rowSelection='multiple' // Memungkinkan pemilihan multiple baris
          pagination={true} // Aktifkan paginasi
          paginationPageSize={10} // Jumlah baris per halaman
          // Tambahkan ini untuk handle jika tidak ada baris data
          noRowsOverlayComponent={() => (
              <div className="flex items-center justify-center h-full text-gray-500">
                  Tidak ada data tempat untuk ditampilkan.
              </div>
          )}
        />
      </div>
    </div>
  );
};

export default MarkersPage;
