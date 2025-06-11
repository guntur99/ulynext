// src/components/plantrip/VendorCard.tsx
import React from 'react';
import { Vendor } from '../../types/interfaces'; // Adjust path based on your types location

/**
 * Props for the VendorCard component.
 */
interface VendorCardProps {
  vendor: Vendor; // The vendor data to display
  onViewOnMap?: (vendor: Vendor) => void; // Optional callback when "View on Map" is clicked
}

/**
 * VendorCard Component
 * Displays detailed information for a single vendor in a card format.
 */
const VendorCard: React.FC<VendorCardProps> = ({ vendor, onViewOnMap }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{vendor.name}</h3>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Type:</span> {vendor.item_type}
      </p>
      {vendor.rating !== undefined && (
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Rating:</span> {vendor.rating.toFixed(1)} &#9733;
        </p>
      )}
      {vendor.address && (
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-medium">Address:</span> {vendor.address}
        </p>
      )}
      
      <div className="flex space-x-2 mt-4">
        {onViewOnMap && (
          <button
            onClick={() => onViewOnMap(vendor)}
            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            View on Map
          </button>
        )}
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${vendor.latitude},${vendor.longitude}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 inline-flex justify-center items-center bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
        >
          Open in Maps
        </a>
      </div>
    </div>
  );
};

export default VendorCard;