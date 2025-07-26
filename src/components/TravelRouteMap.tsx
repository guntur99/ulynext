// src/components/TravelRouteMap.tsx
"use client"; // Menandai komponen ini sebagai Client Component

import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api'; // Import instance Axios
import { AxiosError } from 'axios'; // Import untuk type-checking error

/**
 * Komponen untuk menampilkan peta Google Maps dan merencanakan rute perjalanan.
 */
const TravelRouteMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null); // Ref untuk elemen div peta
  // FIX 1: Menghapus state 'map' yang tidak digunakan
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]); // Array untuk menyimpan custom markers

  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [message, setMessage] = useState<string>('');

  /**
   * Fungsi untuk mengambil custom markers dari backend dan menampilkannya di peta.
   * Dibungkus dengan useCallback agar tidak dibuat ulang di setiap render.
   */
  const fetchCustomMarkers = useCallback(async (currentMap: google.maps.Map) => {
    try {
      const response = await api.get('/markers');
      const customMarkersData: Array<{ latitude: number; longitude: number; name: string; description?: string }> = response.data;

      // Bersihkan marker yang ada sebelum menambahkan yang baru
      markers.forEach(marker => marker.setMap(null));

      const newMarkers = customMarkersData.map((m) => {
        const marker = new google.maps.Marker({
          position: { lat: m.latitude, lng: m.longitude },
          map: currentMap,
          title: m.name,
          animation: google.maps.Animation.DROP,
        });

        const infowindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold text-lg mb-1">${m.name}</h3>
              <p class="text-sm text-gray-700">${m.description || 'Tidak ada deskripsi.'}</p>
            </div>
          `
        });
        marker.addListener('click', () => infowindow.open(currentMap, marker));
        return marker;
      });

      setMarkers(newMarkers);
    } catch (err: unknown) { // FIX 4: Mengganti 'any' dengan 'unknown'
      console.error('Error fetching custom markers:', err);
      // Pemeriksaan tipe error untuk keamanan
      if (err instanceof AxiosError) {
        setMessage(err.response?.data?.message || 'Gagal memuat tempat rekomendasi.');
      } else {
        setMessage('Gagal memuat tempat rekomendasi.');
      }
    }
  }, [markers]); // Bergantung pada 'markers' untuk membersihkan marker lama

  // Efek untuk menginisialisasi peta Google Maps saat komponen mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && mapRef.current) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: -6.2088, lng: 106.8456 },
        zoom: 10,
        mapId: process.env.NEXT_PUBLIC_MAPS_MAP_ID,
      });

      setDirectionsService(new window.google.maps.DirectionsService());

      const renderer = new window.google.maps.DirectionsRenderer();
      renderer.setMap(googleMap);
      setDirectionsRenderer(renderer);

      fetchCustomMarkers(googleMap);
    }
  // FIX 2: Menambahkan fetchCustomMarkers ke dependency array.
  }, [fetchCustomMarkers]);

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
      const response = await api.post('/route', { origin, destination });
      const directionsData: google.maps.DirectionsResult = response.data;

      if (directionsData.routes && directionsData.routes.length > 0) {
        directionsRenderer.setDirections(directionsData);

        const leg = directionsData.routes[0].legs[0];
        if (leg.distance && leg.duration) {
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text
          });
        }
      } else {
        setMessage('Tidak dapat menemukan rute untuk lokasi yang diberikan.');
        directionsRenderer.setDirections({
            routes: [],
            request: {},
            geocoded_waypoints: [],
         });
      }
    } catch (err: unknown) { // FIX 3: Mengganti 'any' dengan 'unknown'
      console.error('Error calculating route:', err);
      let errorMessage = 'Gagal menghitung rute. Periksa lokasi atau coba lagi.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setMessage(errorMessage);
      directionsRenderer.setDirections({
        routes: [],
        request: {},
        geocoded_waypoints: [],
      });
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
          <div className="route-info bg-blue-50 p-4 rounded-md mb-6">
            <p className="text-lg">Jarak: <strong className="text-blue-700">{routeInfo.distance}</strong></p>
            <p className="text-lg">Estimasi Waktu: <strong className="text-blue-700">{routeInfo.duration}</strong></p>
          </div>
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