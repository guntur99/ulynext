// src/components/TravelRouteMap.tsx
"use client"; // Menandai komponen ini sebagai Client Component

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api'; // Import instance Axios

/**
 * Komponen untuk menampilkan peta Google Maps dan merencanakan rute perjalanan.
 */
const TravelRouteMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null); // Ref untuk elemen div peta
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]); // Array untuk menyimpan custom markers

  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [message, setMessage] = useState<string>('');

  // Efek untuk menginisialisasi peta Google Maps saat komponen mount
  useEffect(() => {
    // Pastikan Google Maps API sudah dimuat sebelum mencoba menggunakannya
    if (typeof window !== 'undefined' && window.google && mapRef.current) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: -6.2088, lng: 106.8456 }, // Default ke Jakarta
        zoom: 10,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID, // Opsional: Gunakan Map ID jika ada
      });
      setMap(googleMap);

      const service = new window.google.maps.DirectionsService();
      setDirectionsService(service);

      const renderer = new window.google.maps.DirectionsRenderer();
      renderer.setMap(googleMap);
      setDirectionsRenderer(renderer);

      // Muat custom markers dari backend saat peta dimuat
      fetchCustomMarkers(googleMap);
    }
  }, []); // Hanya dijalankan sekali saat komponen mount

  /**
   * Fungsi untuk menghitung dan menampilkan rute di peta.
   * Mengirim permintaan ke backend untuk mendapatkan data rute.
   */
  const calculateRoute = async () => {
    setMessage('');
    setRouteInfo(null);
    if (!origin || !destination) {
      setMessage('Harap masukkan titik awal dan tujuan.');
      return;
    }

    if (!directionsService || !directionsRenderer) {
      setMessage('Peta belum sepenuhnya dimuat. Coba lagi.');
      return;
    }

    try {
      // Panggil backend Axum untuk mendapatkan rute
      const response = await api.post('/route', { origin, destination });
      const directionsData: google.maps.DirectionsResult = response.data;

      if (directionsData.routes && directionsData.routes.length > 0) {
        directionsRenderer.setDirections(directionsData); // Langsung set DirectionsResult

        // Ambil informasi jarak dan durasi dari rute pertama
        const leg = directionsData.routes[0].legs[0];
        setRouteInfo({
          distance: leg.distance.text,
          duration: leg.duration.text
        });
      } else {
        setMessage('Tidak dapat menemukan rute untuk lokasi yang diberikan.');
        directionsRenderer.setDirections({ routes: [] }); // Bersihkan rute sebelumnya
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Gagal menghitung rute. Periksa lokasi atau coba lagi.');
      console.error('Error calculating route:', err);
      directionsRenderer.setDirections({ routes: [] }); // Bersihkan rute sebelumnya
    }
  };

  /**
   * Fungsi untuk mengambil custom markers dari backend dan menampilkannya di peta.
   * @param currentMap Instance peta Google Maps.
   */
  const fetchCustomMarkers = async (currentMap: google.maps.Map) => {
    try {
      // Panggil backend Axum untuk mendapatkan custom markers
      // Asumsi endpoint ini TIDAK dilindungi otentikasi JWT untuk tampilan publik
      const response = await api.get('/markers'); // Sesuaikan dengan endpoint API Anda
      const customMarkers: Array<{ latitude: number; longitude: number; name: string; description?: string }> = response.data;

      // Bersihkan marker yang ada sebelum menambahkan yang baru
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]); // Reset array markers

      const newMarkers: google.maps.Marker[] = [];
      customMarkers.forEach((m) => {
        const marker = new google.maps.Marker({
          position: { lat: m.latitude, lng: m.longitude },
          map: currentMap,
          title: m.name,
          animation: google.maps.Animation.DROP, // Efek animasi saat marker muncul
        });
        newMarkers.push(marker);

        // Tambahkan info window (opsional)
        const infowindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold text-lg mb-1">${m.name}</h3>
              <p class="text-sm text-gray-700">${m.description || 'Tidak ada deskripsi.'}</p>
            </div>
          `
        });
        marker.addListener('click', () => {
          infowindow.open(currentMap, marker);
        });
      });
      setMarkers(newMarkers);
    } catch (err: any) {
      console.error('Error fetching custom markers:', err);
      setMessage('Gagal memuat tempat rekomendasi.');
    }
  };

  return (
    <>
    <div className="travel-route-container bg-white p-6 rounded-lg shadow-md">
      <div className="input-section grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="form-group">
          <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">Titik Awal:</label>
          <input
            type="text"
            id="origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Misal: Jakarta"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="form-group">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Tujuan:</label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Misal: Bandung"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <button
          onClick={calculateRoute}
          className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 transition-colors duration-300 font-semibold self-end"
        >
          Cari Rute
        </button>
      </div>

      {message && (
        <p className="route-message text-red-600 text-center mb-4">{message}</p>
      )}

      {routeInfo && (
        <>
        <div className="route-info bg-blue-50 p-4 rounded-md mb-6">
          <p className="text-lg">Jarak: <strong className="text-blue-700">
            {/* {{ routeInfo.distance }} */}
            </strong></p>
          <p className="text-lg">Estimasi Waktu: <strong className="text-blue-700">
            {/* {{ routeInfo.duration }} */}
            </strong></p>
        </div>
        </>
      )}

      <div
        id="map"
        ref={mapRef}
        className="w-full h-[500px] rounded-lg shadow-inner bg-gray-200"
      ></div>
    </div>
    </>
  );
};

export default TravelRouteMap;