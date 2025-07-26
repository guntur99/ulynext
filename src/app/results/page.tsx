// src/app/results/page.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTripData } from '@/context/TripDataContext';
import { RecommendationResponse } from '@/types/interfaces';

const LOCAL_STORAGE_KEY = 'lastTripData'; // Define a key for localStorage

function ResultsPage() {
  const { tripData, isLoadingTripData, tripDataError, setTripData, setIsLoadingTripData, setTripDataError } = useTripData();
  const mapRef = useRef<HTMLDivElement>(null); // Ref for the map container
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);

  // Effect 1: Handle loading/saving trip data to/from localStorage
  useEffect(() => {
    // 1. Try to load data from localStorage on mount
    if (!tripData && !isLoadingTripData) { // Only attempt to load if no data is currently in context and not already loading
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          const parsedData: RecommendationResponse = JSON.parse(storedData);
          setTripData(parsedData);
          setIsLoadingTripData(false); // Ensure loading is false
          setTripDataError(null); // Clear any previous error
          console.log("Trip data loaded from localStorage.");
          return; // Exit early if data was loaded from storage
        }
      } catch (e) {
        console.error("Failed to parse trip data from localStorage:", e);
        // If localStorage data is corrupt, clear it
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }

    // 2. Save data to localStorage whenever tripData in context changes and is not null
    if (tripData) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tripData));
        console.log("Trip data saved to localStorage.");
      } catch (e) {
        console.error("Failed to save trip data to localStorage:", e);
        setTripDataError("Could not save trip data locally. Browser storage might be full or blocked.");
      }
    }

    // 3. If no data in context and no data in localStorage, set initial error
    if (!tripData && !isLoadingTripData && !localStorage.getItem(LOCAL_STORAGE_KEY)) {
      setTripDataError("No trip data found. Please start a new search from the planning page.");
    }

  }, [tripData, isLoadingTripData, setTripData, setIsLoadingTripData, setTripDataError]); // Depend on tripData and loading states

  // Effect 2: Check for Google Maps API readiness
  useEffect(() => {
    const checkGoogleMapsReady = setInterval(() => {
      // Cek apakah objek 'google' dan properti yang dibutuhkan sudah tersedia di window
      if (typeof window.google !== 'undefined' && window.google.maps && window.google.maps.geometry) {
        setIsGoogleMapsReady(true);
        clearInterval(checkGoogleMapsReady);
      }
    }, 100);

    return () => clearInterval(checkGoogleMapsReady);
  }, []); // Empty dependency array means this runs once on mount

  // Effect 3: Initialize the map once Google Maps API is ready AND tripData is available
  useEffect(() => {
    if (isGoogleMapsReady && mapRef.current && tripData && tripData.main_route && tripData.main_route.routes.length > 0) {
      const mainRoute = tripData.main_route.routes[0];
      const polylinePoints = mainRoute.overview_polyline.points;

      if (!polylinePoints) {
        console.warn("No polyline points found for the main route.");
        return;
      }

      const map = new google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 0, lng: 0 },
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
      });

      const path = google.maps.geometry.encoding.decodePath(polylinePoints);
      const bounds = new google.maps.LatLngBounds();
      // FIX 2: Mengganti 'any' dengan tipe yang lebih spesifik 'google.maps.LatLng'
      path.forEach((latLng: google.maps.LatLng) => {
        bounds.extend(latLng);
      });

      // FIX 3: Menghapus variabel 'routePolyline' yang tidak digunakan
      new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 5,
        map: map,
      });

      map.fitBounds(bounds);
    }
  }, [isGoogleMapsReady, tripData]); // Re-run effect when script status or tripData changes

  if (isLoadingTripData) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-700">
        <p>Loading trip recommendations...</p>
      </div>
    );
  }

  if (tripDataError) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-600">
        <p>Error: {tripDataError}</p>
      </div>
    );
  }

  // Final check if tripData is still null after all loading attempts
  if (!tripData || !tripData.main_route || !tripData.main_route.routes || tripData.main_route.routes.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-700">
        <p>No recommendations found. Please go back and plan a trip.</p>
      </div>
    );
  }

  return (
    <div className="results-page-container p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Your Trip Recommendation</h1>

      {/* Map Section */}
      <section className="mb-8 p-4 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Route Map</h2>
        <div
          ref={mapRef}
          className="w-full h-80 md:h-96 rounded-lg shadow-inner border border-gray-300"
          style={{ minHeight: '300px' }}
        >
          {!isGoogleMapsReady && (
            <div className="flex items-center justify-center h-full text-gray-500">
              Loading map... (Please ensure API key is correct and network is stable)
            </div>
          )}
        </div>
        {tripData.main_route.routes[0].url && (
          <p className="mt-4 text-center">
            <a
              href={tripData.main_route.routes[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Open Route in Google Maps App
            </a>
          </p>
        )}
      </section>

      {/* Main Route Details */}
      <section className="mb-8 p-6 bg-green-50 rounded-lg shadow-inner">
        <h2 className="text-2xl font-semibold mb-4 text-green-800">Main Route Details</h2>
        {tripData.main_route.routes[0].legs && tripData.main_route.routes[0].legs.length > 0 && (
          <div className="text-gray-700">
            <p>Distance: <span className="font-medium">{tripData.main_route.routes[0].legs[0].distance?.text}</span></p>
            <p>Duration: <span className="font-medium">{tripData.main_route.routes[0].legs[0].duration?.text}</span></p>
          </div>
        )}
      </section>

      {/* Trip Interpretation Section */}
      {tripData.interpretation && (
        <section className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">Trip Interpretation</h2>
          <p className="text-lg text-gray-700">
            Destination: <span className="font-medium">{tripData.interpretation.destination}</span>
          </p>
          {tripData.interpretation.stops_along_the_way && tripData.interpretation.stops_along_the_way.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xl font-medium mb-2 text-blue-700">Stops Along The Way:</h3>
              <ul className="list-disc list-inside text-gray-700 ml-5">
                {tripData.interpretation.stops_along_the_way.map((stop, index) => (
                  <li key={index}>{stop}</li>
                ))}
              </ul>
            </div>
          )}
          {tripData.interpretation.return_trip_plan && (
            <p className="text-lg text-gray-700 mt-4">
              Return Trip Plan: <span className="font-medium">{tripData.interpretation.return_trip_plan}</span>
            </p>
          )}
        </section>
      )}

      {/* Suggested Stops Section */}
      {tripData.suggested_stops && Object.keys(tripData.suggested_stops).length > 0 && (
        <section className="mb-8 p-6 bg-yellow-50 rounded-lg shadow-inner">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-800">Suggested Stops</h2>
          {Object.entries(tripData.suggested_stops).map(([category, data], index) => (
            <div key={index} className="mb-4">
              <h3 className="text-xl font-medium mb-2 text-yellow-700 capitalize">{category.replace(/_/g, ' ')}:</h3>
              {data.results && data.results.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700 ml-5">
                  {data.results.map((place, placeIndex) => (
                    <li key={placeIndex}>
                      <strong>{place.name}</strong> - {place.formatted_address} (Rating: {place.rating || 'N/A'})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No {category.replace(/_/g, ' ')} stops found.</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Return Trip Shops Section */}
      {tripData.return_trip_shop && tripData.return_trip_shop.return_trip_shop.results && tripData.return_trip_shop.return_trip_shop.results.length > 0 && (
        <section className="p-6 bg-red-50 rounded-lg shadow-inner">
          <h2 className="text-2xl font-semibold mb-4 text-red-800">Return Trip Shops</h2>
          <ul className="list-disc list-inside text-gray-700 ml-5">
            {tripData.return_trip_shop.return_trip_shop.results.map((shop, index) => (
              <li key={index}>
                <strong>{shop.name}</strong> - {shop.formatted_address} (Rating: {shop.rating || 'N/A'})
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default ResultsPage;