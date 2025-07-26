"use client"; // Menandai komponen ini sebagai Client Component

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider'; // Import useAuth hook

// Import AG Grid components dan styles
import { ColDef, ModuleRegistry, AllCommunityModule, ValueGetterParams, ICellRendererParams } from 'ag-grid-community'; // Import ICellRendererParams
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

  // Fungsi untuk mengambil data places/markers dari API
  // useCallback digunakan agar fungsi ini tidak dibuat ulang di setiap render, kecuali dependensinya berubah.
  const fetchPlacesData = useCallback(async () => {
    setIsPlacesDataLoading(true);
    setPlacesDataError(null);

    if (!API_BASE_URL) {
      setPlacesDataError("API Base URL tidak dikonfigurasi. Harap set NEXT_PUBLIC_API_BASE_URL.");
      setIsPlacesDataLoading(false);
      return;
    }

    try {
      const token = user?.token;
      if (!token) {
        setPlacesDataError("Token tidak ditemukan. Pastikan Anda sudah login.");
        setIsPlacesDataLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/markers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal mengambil data: ${response.statusText}`);
      }

      const data: PlaceMarker[] = await response.json();
      setRowData(data);
    } catch (error) {
      console.error("Error fetching places data:", error);
      setPlacesDataError(`Gagal memuat data tempat: ${error}`);
    } finally {
      setIsPlacesDataLoading(false);
    }
  }, [API_BASE_URL, user, router]); // Dependensi untuk useCallback

  // Definisikan kolom untuk AG Grid menggunakan useMemo
  const columnDefs = useMemo(() => {
    const columns: ColDef<PlaceMarker>[] = [
      {
        headerName: "No",
        valueGetter: (params: ValueGetterParams<PlaceMarker>) => params.node?.rowIndex != null ? params.node.rowIndex + 1 : '',
        filter: false,
        sortable: false,
        resizable: false,
        minWidth: 60,
        maxWidth: 80,
      },
      { field: "name", headerName: "Nama Tempat", filter: true, sortable: true, resizable: true },
      { field: "description", headerName: "Deskripsi", filter: true, sortable: true, resizable: true }
    ];

    columns.push({
      headerName: "Action",
      // FIX 1: Mengganti 'any' dengan 'ICellRendererParams<PlaceMarker>'
      cellRenderer: (params: ICellRendererParams<PlaceMarker>) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={async () => {
              const marker = params.data;
              if (!marker || !API_BASE_URL || !user?.token) return;
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
                alert("Gagal mengedit marker: " + e);
              }
            }}
          >
            Edit
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={async () => {
              const marker = params.data;
              if (!marker || !API_BASE_URL || !user?.token) return;
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
                alert("Gagal menghapus marker" + e);
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
  // FIX 2: Menambahkan dependensi yang hilang (API_BASE_URL, user, fetchPlacesData)
  // dan menghapus dependensi 'rowData' yang tidak relevan.
  }, [API_BASE_URL, user, fetchPlacesData]);

  // DefaultColDef untuk mengatur properti default untuk semua kolom
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    floatingFilter: true,
  }), []);

  // Efek untuk mengarahkan pengguna dan memuat data
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated) {
      fetchPlacesData();
    }
  }, [isLoading, isAuthenticated, router, fetchPlacesData]);

  // Tampilkan loading state
  if (isLoading || isPlacesDataLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Memuat data tempat...</p>
      </div>
    );
  }

  // Tampilkan error jika gagal
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

  // Tampilkan tabel
  return (
    <div className="p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Daftar Tempat Tersimpan</h2>
      <div className="ag-theme-alpine text-dark" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          rowSelection='multiple'
          pagination={true}
          paginationPageSize={10}
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