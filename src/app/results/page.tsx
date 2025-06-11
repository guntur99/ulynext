// src/app/results/page.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import { useTripData } from '@/context/TripDataContext';
import { RecommendationResponse } from '@/types/interfaces';

// Declare google as a global variable to avoid TypeScript errors
declare const google: any;

function ResultsPage() {
  const { tripData, isLoadingTripData, tripDataError, setTripDataError } = useTripData();
  const mapRef = useRef<HTMLDivElement>(null); // Ref for the map container

  useEffect(() => {
    if (!isLoadingTripData && !tripData && !tripDataError) {
      setTripDataError("No trip data found. Please start a new search.");
    }
  }, [tripData, isLoadingTripData, tripDataError, setTripDataError]);

  useEffect(() => {
    // Function to load Google Maps API script
    const loadGoogleMapsScript = (callback: () => void) => {
      if (document.getElementById('google-maps-script')) {
        callback();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      // Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual Google Maps API Key
      // Ensure 'libraries=geometry' is included for polyline decoding
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => callback();
      script.onerror = () => {
        console.error("Failed to load Google Maps script.");
        setTripDataError("Failed to load map. Please check your internet connection or API key.");
      };
      document.head.appendChild(script);
    };

    // Initialize map once script is loaded and tripData is available
    const initializeMap = () => {
      if (mapRef.current && tripData && tripData.main_route && tripData.main_route.routes.length > 0) {
        const mainRoute = tripData.main_route.routes[0];
        const polylinePoints = mainRoute.overview_polyline.points;

        if (!polylinePoints) {
          console.warn("No polyline points found for the main route.");
          return;
        }

        // Initialize the map
        const map = new google.maps.Map(mapRef.current, {
          zoom: 10,
          center: { lat: 0, lng: 0 }, // Initial center, will be adjusted by bounds
          mapTypeId: 'roadmap',
          disableDefaultUI: false, // You can customize UI controls
        });

        // Decode the polyline path
        const path = google.maps.geometry.encoding.decodePath(polylinePoints);

        // Create a LatLngBounds object to encompass the entire route
        const bounds = new google.maps.LatLngBounds();
        path.forEach((latLng: any) => {
          bounds.extend(latLng);
        });

        // Draw the polyline on the map
        const routePolyline = new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: '#4285F4', // Google Maps blue
          strokeOpacity: 0.8,
          strokeWeight: 5,
          map: map,
        });

        // Fit the map to the bounds of the polyline
        map.fitBounds(bounds);
      }
    };

    if (tripData && tripData.main_route && tripData.main_route.routes.length > 0) {
      loadGoogleMapsScript(initializeMap);
    }
  }, [tripData]); // Re-run effect if tripData changes

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
          style={{ minHeight: '300px' }} // Ensures map has a minimum height
        >
          {/* Map will be rendered here */}
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

      {/* Main Route Details (original section modified to remove textarea) */}
      <section className="mb-8 p-6 bg-green-50 rounded-lg shadow-inner">
        <h2 className="text-2xl font-semibold mb-4 text-green-800">Main Route Details</h2>
        {tripData.main_route.routes[0].legs && tripData.main_route.routes[0].legs.length > 0 && (
          <div className="text-gray-700">
            <p>Distance: <span className="font-medium">{tripData.main_route.routes[0].legs[0].distance.text}</span></p>
            <p>Duration: <span className="font-medium">{tripData.main_route.routes[0].legs[0].duration.text}</span></p>
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
      {tripData.return_trip_shop && tripData.return_trip_shop.results && tripData.return_trip_shop.results.length > 0 && (
        <section className="p-6 bg-red-50 rounded-lg shadow-inner">
          <h2 className="text-2xl font-semibold mb-4 text-red-800">Return Trip Shops</h2>
          <ul className="list-disc list-inside text-gray-700 ml-5">
            {tripData.return_trip_shop.results.map((shop, index) => (
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