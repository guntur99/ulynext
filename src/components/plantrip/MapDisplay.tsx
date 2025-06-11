// src/components/plantrip/MapDisplay.tsx
// ... existing imports ...
import { LatLng, Vendor } from '../../types/interfaces';

interface MapDisplayProps {
  route: LatLng[];
  vendors: Vendor[];
  defaultCenter?: LatLng;
  zoom?: number;
  selectedVendor?: Vendor | null; // <-- ADD THIS PROP
}

const MapDisplay: React.FC<MapDisplayProps> = ({ route, vendors, defaultCenter, zoom = 14, selectedVendor: propSelectedVendor }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  // Use internal state for InfoWindow if no prop is passed, or override with prop
  const [internalSelectedVendor, setInternalSelectedVendor] = useState<Vendor | null>(null);

  // Effect to update internal selected vendor if prop changes
  useEffect(() => {
    setInternalSelectedVendor(propSelectedVendor);
  }, [propSelectedVendor]);

  // Determine which vendor's info window should be open
  const currentSelectedVendor = propSelectedVendor || internalSelectedVendor;

  // ... (rest of your MapDisplay.tsx code) ...

  const handleMarkerClick = useCallback((vendor: Vendor) => {
    setInternalSelectedVendor(vendor); // Update internal state on marker click
    // If you want to notify parent, you could add an `onMarkerClick` prop
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setInternalSelectedVendor(null); // Clear internal state on close
  }, []);

  return (
    <div className="map-display-container">
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          // ... existing props ...
        >
          {/* Render Route Polyline */}
          {/* ... */}

          {/* Render Vendor Markers */}
          {vendors.map((vendor) => (
            <Marker
              key={vendor.id || `<span class="math-inline">\{vendor\.name\}\-</span>{vendor.latitude}-${vendor.longitude}`}
              position={{ lat: vendor.latitude, lng: vendor.longitude }}
              title={vendor.name}
              onClick={() => handleMarkerClick(vendor)}
              // You might add an icon change here if this vendor is the selected one
              // icon={currentSelectedVendor && currentSelectedVendor.id === vendor.id ? { /* selected icon */ } : { /* default icon */ }}
            />
          ))}

          {/* Render InfoWindow for currentSelectedVendor */}
          {currentSelectedVendor && (
            <InfoWindow
              position={{ lat: currentSelectedVendor.latitude, lng: currentSelectedVendor.longitude }}
              onCloseClick={handleInfoWindowClose}
            >
              {/* ... InfoWindow content ... */}
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapDisplay;