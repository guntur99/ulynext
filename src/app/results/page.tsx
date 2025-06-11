// app/results/page.tsx
"use client";

import React, { useState, useEffect, FC } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

// SECTION: TypeScript Type Definitions
// Updated to precisely match the JSON structure from your screenshot.

// Basic types for directions
interface LatLng { lat: number; lng: number; }
interface Distance { text: string; value: number; }
interface Duration { text: string; value: number; }
interface Step {
  distance: Distance;
  duration: Duration;
  html_instructions: string;
}
interface Leg {
  distance: Distance;
  duration: Duration;
  end_address: string;
  start_address: string;
  steps: Step[];
}
interface Route {
  copyrights: string;
  legs: Leg[];
}

// Structure for the main route directions
interface DirectionsData {
  geocoded_waypoints: object[];
  routes: Route[];
  status: string;
}

// Structure for the recommended shops
interface ShopResult {
  place_id: string;
  name: string;
}
interface ReturnTripShopData {
  results: ShopResult[];
  status: string;
}

// The complete top-level response structure from your backend
interface RecommendationResponse {
  destination: string;
  return_trip_plan: string;
  main_route: DirectionsData;
  return_trip_shop: ReturnTripShopData;
}

// SECTION: Sub-Components for Rendering

// Renders a single direction step
const DirectionStep: FC<{ step: Step; index: number }> = ({ step, index }) => (
  <li className="py-4 border-b border-gray-200 last:border-b-0">
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
        {index + 1}
      </div>
      <div className="flex-1">
        <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: step.html_instructions }} />
        <div className="text-sm text-gray-500 mt-1">
          <span>{step.distance.text}</span>
          <span className="mx-2">·</span>
          <span>{step.duration.text}</span>
        </div>
      </div>
    </div>
  </li>
);

// Renders a single recommended shop
const RecommendedShop: FC<{ shop: ShopResult; index: number }> = ({ shop, index }) => (
    <li className="p-4 border-b border-gray-200 last:border-b-0">
        <p className="font-semibold text-gray-900">{index + 1}. {shop.name}</p>
        <p className="text-xs text-gray-500 mt-1">Place ID: {shop.place_id}</p>
    </li>
);

// SECTION: Main Page Component
const ResultsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const dataString = searchParams.get('data');
    if (dataString) {
      try {
        const parsedData: RecommendationResponse = JSON.parse(decodeURIComponent(dataString));
        console.log("test: ", parsedData);
        
        
        // **FIX**: Validate using the correct path from your screenshot: `main_route.routes`
        if (parsedData && parsedData.main_route && parsedData.main_route.routes && parsedData.main_route.routes.length > 0) {
          setRecommendation(parsedData);
        } else {
          throw new Error("The received data does not contain a valid 'main_route' object with routes.");
        }
      } catch (e: any) {
        console.error("Failed to parse recommendation data from URL:", e);
        setError(`There was an error reading your trip data. Details: ${e.message}`);
      }
    } else {
      setError("No trip data found in the URL. Please start a new search.");
    }
    
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-700">Loading your trip plan...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">An Error Occurred</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Start a New Search
        </button>
      </div>
    );
  }
  
  if (!recommendation) {
    // This handles the case where data is null after loading, though it's mostly covered by the error state.
    return <p>No recommendation data available.</p>
  }

  // Extract route and leg from the main_route object
  const route = recommendation.main_route.routes[0];
  const leg = route.legs[0];

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Button to go back to home */}
          <button
            onClick={() => router.push('/')}
            className="mb-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-300 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H16a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </button>

          {/* Header Section */}
          <div className="pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-extrabold text-gray-900">Your Trip to {recommendation.destination}</h1>
            <p className="mt-1 text-lg text-gray-600">
              Total Distance: <span className="font-semibold text-blue-600">{leg.distance.text}</span> | 
              Estimated Time: <span className="font-semibold text-blue-600">{leg.duration.text}</span>
            </p>
            <p className="text-sm text-gray-400 mt-2">{route.copyrights}</p>
          </div>

          {/* Start and End Points */}
          <div className="py-4">
            <div className="flex items-center space-x-3 mb-3">
              <span className="w-4 h-4 rounded-full bg-green-500 ring-4 ring-green-100"></span>
              <p className="font-medium text-gray-700">{leg.start_address}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-4 h-4 bg-red-500 ring-4 ring-red-100"></span>
              <p className="font-medium text-gray-700">{leg.end_address}</p>
            </div>
          </div>

          {/* Turn-by-Turn Directions */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mt-6 mb-2">Turn-by-Turn Directions</h2>
            <ul className="list-none p-0">
              {/* {leg.steps.map((step, index) => (
                <DirectionStep key={index} step={step} index={index} />
              ))} */}
            </ul>
          </div>
          
          {/* **NEW**: Display Recommended Shops */}
          {recommendation.return_trip_shop && recommendation.return_trip_shop.results.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                      Shop Recommendations for "{recommendation.return_trip_plan}"
                  </h2>
                  <ul className="list-none p-0 bg-blue-50 rounded-lg">
                      {recommendation.return_trip_shop.results.map((shop, index) => (
                          <RecommendedShop key={shop.place_id} shop={shop} index={index} />
                      ))}
                  </ul>
              </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;