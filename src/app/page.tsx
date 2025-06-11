// src/app/page.tsx
"use client"; // Mark this component as a Client Component

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider'; // Import useAuth hook
// import TravelRouteMap from '@/components/TravelRouteMap'; // Import TravelRouteMap component
// import MarkersPage from '@/app/markers/page'; // Import MarkersPage component (assuming it's a client component)
import AddPlaceModal from '@/components/AddPlaceModal'; // Import the new AddPlaceModal component
// import HomeContentUser from '@/components/HomeContentUser'; // Component for User role content
import HomeContentAdmin from '@/components/HomeContentAdmin'; // Component for Admin role content
import SearchInput from '@/components/plantrip/SearchInput'; // Import the new SearchInput component

/**
 * Main application page.
 * Displays different content based on user authentication status and role.
 */
const HomePage: React.FC = () => {
  // Get state and functions from the authentication context
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const router = useRouter();
  

  // State to control visibility of the "Add Place" modal
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState<boolean>(false);
  
  // State to trigger refresh of MarkersPage data (e.g., when a new marker is added)
  const [markerRefreshKey, setMarkerRefreshKey] = useState<number>(0); 

  // Effect to redirect users if unauthenticated or handle missing roles
  useEffect(() => {
    // If loading is complete and the user is not authenticated, redirect to the login page.
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return; 
    }

    // If loading is complete, user is authenticated, but the user object or role is missing.
    // This indicates a data issue or an invalid state.
    // The best action is to log out and redirect back to login.
    if (!isLoading && isAuthenticated && !user?.role) {
        console.warn("User authenticated but role is missing or undefined. Logging out and redirecting to login page.");
        logout(); 
        router.push('/login'); 
        return; 
    }
  }, [isLoading, isAuthenticated, router, user, logout]);

  // Function to open the "Add Place" modal
  const handleAddPlaceClick = () => {
    setIsAddPlaceModalOpen(true);
  };

  // Function to close the "Add Place" modal
  const handleCloseAddPlaceModal = () => {
    setIsAddPlaceModalOpen(false);
  };

  // Callback function to be called when a new place is successfully added
  const handlePlaceAdded = () => {
    // Increment the key to force re-render/re-fetch of MarkersPage if it uses this key
    setMarkerRefreshKey(prevKey => prevKey + 1); 
    handleCloseAddPlaceModal(); // Close the modal after successful addition
  };

  // Display loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-700">Loading application...</p>
      </div>
    );
  }

  // Display page content if authenticated
  return (
    <div className="home-container bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto my-10">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-700">
        Welcome, {user?.username || 'User'}!
      </h1>
      <p className="text-lg text-center mb-6 text-gray-600">This is your main page.</p>
      
      {/* Conditionally render content based on user role */}
      {isAuthenticated && user?.role === 'admin' && (
        <HomeContentAdmin 
          onAddPlaceClick={handleAddPlaceClick} 
          markerRefreshKey={markerRefreshKey} 
        />
      )}

      {isAuthenticated && user?.role === 'user' && (
        <>
            {/* <HomeContentUser /> */}
            <SearchInput />
        </>
      )}

      {/* Add Place Modal, rendered only when isOpen is true */}
      <AddPlaceModal
        isOpen={isAddPlaceModalOpen}
        onClose={handleCloseAddPlaceModal}
        onPlaceAdded={handlePlaceAdded}
      />
    </div>
  );
};

export default HomePage;