// src/components/plantrip/MapDisplay.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
// FIX: Impor komponen yang dibutuhkan dari React dan Google Maps API
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { LatLng, Vendor } from '../../types/interfaces';

// --- Konfigurasi dasar untuk peta ---
const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const googleMapsApiKey = process.env.NEXT_PUBLIC_Maps_API_KEY || "";
// ------------------------------------

interface MapDisplayProps {
  route: LatLng[];
  vendors: Vendor[];
  defaultCenter?: LatLng;
  zoom?: number;
  selectedVendor?: Vendor | null;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
  route,
  vendors,
  defaultCenter = { lat: -6.2088, lng: 106.8456 }, // Fallback ke Jakarta
  zoom = 12,
  selectedVendor: propSelectedVendor,
}) => {
  // FIX: State 'map' dan 'setMap' yang tidak digunakan telah dihapus.
  const [internalSelectedVendor, setInternalSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    setInternalSelectedVendor(propSelectedVendor || null);
  }, [propSelectedVendor]);

  const currentSelectedVendor = propSelectedVendor !== undefined ? propSelectedVendor : internalSelectedVendor;

  const handleMarkerClick = useCallback((vendor: Vendor) => {
    setInternalSelectedVendor(vendor);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setInternalSelectedVendor(null);
  }, []);

  if (!googleMapsApiKey) {
    return <div className="p-4 text-center text-red-500">Kunci API Google Maps tidak ditemukan.</div>;
  }

  return (
    <div className="map-display-container" style={{ height: '500px', width: '100%' }}>
      {/* FIX: Komponen sekarang sudah terdefinisi karena diimpor */}
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter} // FIX: Prop 'defaultCenter' sekarang digunakan
          zoom={zoom}             // FIX: Prop 'zoom' sekarang digunakan
        >
          {/* Render Rute Perjalanan */}
          {/* FIX: Prop 'route' sekarang digunakan untuk menggambar Polyline */}
          {route && route.length > 0 && (
            <Polyline
              path={route}
              options={{
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 3,
              }}
            />
          )}

          {/* Render Penanda (Marker) untuk setiap Vendor */}
          {vendors.map((vendor) => (
            <Marker
              key={vendor.id || `${vendor.name}-${vendor.latitude}`}
              position={{ lat: vendor.latitude, lng: vendor.longitude }}
              title={vendor.name}
              onClick={() => handleMarkerClick(vendor)}
            />
          ))}

          {/* Render InfoWindow untuk vendor yang dipilih */}
          {currentSelectedVendor && (
            <InfoWindow
              position={{ lat: currentSelectedVendor.latitude, lng: currentSelectedVendor.longitude }}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="p-1">
                <h3 className="font-bold">{currentSelectedVendor.name}</h3>
                <p>{currentSelectedVendor.address}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapDisplay;