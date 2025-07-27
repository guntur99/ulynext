// types/index.ts

// First, define the nested structures that `main_route` will contain
interface OverviewPolyline {
  points: string; // This holds the encoded polyline string
}

interface Route {
  overview_polyline: OverviewPolyline;
  url: string;
  legs?: Leg[];
  // Add any other properties that a 'Route' might have, if necessary
  // For example: legs?: any[]; summary?: string;
}

interface Leg {
  distance?: TextValue; // Make distance optional, or explicitly define its structure
  duration?: TextValue; // Make duration optional
  // ... other properties like start_location, end_location, steps, etc.
}

interface TextValue {
  text: string;
  value: number; // Google Maps typically provides a numeric value too
}

interface MainRoute {
  routes: Route[];
  // Add any other top-level properties that 'main_route' might have, if necessary
  // For example: bounds?: any; copyright?: string; warnings?: string[];
}

// Definisi untuk data rekomendasi dari Go backend Anda
export interface RecommendationResponse {
    route: LatLng[];
    vendors: Vendor[];
    message: string;
    main_route: MainRoute;
    interpretation: TripDetails;
    suggested_stops: {
        [category: string]: CategoryRecommendations; // A dynamic object where keys are category strings
    };
    return_trip_shop: {
        [category: string]: ShopRecommendations; // A dynamic object where keys are category strings
    };
  }

    interface TripDetails {
        destination: string;
        stops_along_the_way: string[];
        return_trip_plan: string;
    }

    interface ShopRecommendations {
    results: Place[];
    // If your API returns other properties at this level (e.g., "status", "html_attributions"), add them here.
    // For example:
    // status?: string;
    }

    interface CategoryRecommendations {
    results: Place[];
    // If your API returns other properties at this level (e.g., "status", "html_attributions"), add them here.
    // For example:
    // status?: string;
    }


    // Interface for a single place result
    export interface Place {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: PlaceGeometry;
    rating?: number; // Rating is often optional, so it's good practice to mark it as such
    // If there are other properties like 'types', 'photos', etc., add them here
    }

    interface GeometryLocation {
    lat: number;
    lng: number;
    }

    // For the 'geometry' object
    interface PlaceGeometry {
    location: GeometryLocation;
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