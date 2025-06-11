// types/index.ts

// Definisi untuk data rekomendasi dari Go backend Anda
export interface RecommendationResponse {
    route: LatLng[];
    vendors: Vendor[];
    message: string;
  }
  
  // Definisi untuk Vendor (sesuai dengan struct Go Anda)
  export interface Vendor {
    id?: number; // Opsional karena mungkin dari Maps API tidak ada ID
    name: string;
    item_type: string;
    latitude: number;
    longitude: number;
    address?: string;
    rating?: number; // Opsional
  }
  
  // Definisi untuk LatLng (sesuai Google Maps API atau Polyline Go)
  export interface LatLng {
    lat: number;
    lng: number;
  }
  
  // Properti untuk komponen GoogleMap
  export interface GoogleMapProps {
    center: LatLng;
    zoom: number;
    mapContainerStyle: React.CSSProperties; // Untuk style inline
  }
  
  // Properti untuk Marker
  export interface MarkerProps {
    position: LatLng;
    title?: string;
    // icon?: google.maps.Icon | google.maps.Symbol; // Jika Anda menggunakan ikon kustom
  }
  
  // Properti untuk Polyline
  export interface PolylineProps {
    path: LatLng[];
    options?: google.maps.PolylineOptions;
  }
  
  // Tambahkan definisi tipe lain sesuai kebutuhan