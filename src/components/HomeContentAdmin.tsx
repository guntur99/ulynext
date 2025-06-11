// components/HomeContentAdmin.tsx
import React from 'react';
import MarkersPage from '@/app/markers/page'; // Assuming MarkersPage is a client component

/**
 * Props for the HomeContentAdmin component.
 */
interface HomeContentAdminProps {
  onAddPlaceClick: () => void;
  markerRefreshKey: number; // Key to trigger MarkersPage refresh
}

/**
 * HomeContentAdmin Component
 * Displays content specific to authenticated users with the 'admin' role.
 */
const HomeContentAdmin: React.FC<HomeContentAdminProps> = ({ onAddPlaceClick, markerRefreshKey }) => {
  return (
    <>
      <div className="flex justify-center mb-10 space-x-4">
        <button
          onClick={onAddPlaceClick}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 font-semibold"
        >
          Add Markers
        </button>
      </div>
      
      {/* MarkersPage component (list of places) */}
      <MarkersPage key={markerRefreshKey} /> {/* Use key to force remount/refresh */}
      <hr className="my-8 border-gray-300" />
    </>
  );
};

export default HomeContentAdmin;