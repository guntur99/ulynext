// src/components/plantrip/SearchInput.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LatLng, RecommendationResponse } from '../../types/interfaces'; // Corrected path
import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth is in src/hooks/useAuth.ts

interface SearchInputProps {
  onSearchStart?: () => void;
  onSearchEnd?: (data: RecommendationResponse | null, error: string | null) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearchStart, onSearchEnd }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const { user, isAuthenticated } = useAuth(); 

  const API_BASE_URL: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    onSearchStart?.();

    // Ensure user is authenticated and token is available
    if (!isAuthenticated || !user || !user.token) { // Added user check
        const errorMessage = "You must be logged in to plan a trip. Please log in.";
        setError(errorMessage);
        onSearchEnd?.(null, errorMessage);
        setLoading(false);
        router.push('/login');
        return;
    }

    let currentLat: number | undefined;
    let currentLng: number | undefined;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        } else {
          reject(new Error("Geolocation is not supported by this browser."));
        }
      });
      currentLat = position.coords.latitude;
      currentLng = position.coords.longitude;
      console.log("Current location:", currentLat, currentLng);
    } catch (geoError: any) {
      console.warn("Could not get current geolocation. Using default coordinates.", geoError);
      currentLat = -6.890614; // Default to Bandung
      currentLng = 107.610531; // Default to Bandung
      setError("Could not get your current location. Using default coordinates for the search.");
    }

    if (!API_BASE_URL) {
      const errorMessage = "API Base URL is not configured. Please set NEXT_PUBLIC_API_BASE_URL.";
      setError(errorMessage);
      onSearchEnd?.(null, errorMessage);
      setLoading(false);
      return;
    }

    if (!prompt.trim()) {
      const errorMessage = "Please enter your travel and food wishes.";
      setError(errorMessage);
      onSearchEnd?.(null, errorMessage);
      setLoading(false);
      return;
    }

    if (currentLat === undefined || currentLng === undefined) {
        const errorMessage = "Geolocation data is missing. Cannot proceed with trip planning.";
        setError(errorMessage);
        onSearchEnd?.(null, errorMessage);
        setLoading(false);
        return;
    }

    // --- Prepare the JSON payload ---
    // If your Go backend expects 'origin' as a string "lat,lng":
    const requestBody = {
      query: prompt,
      origin: `${currentLat},${currentLng}`, 
    };

    // If your Go backend expects 'origin_lat' and 'origin_lng' separately:
    // const requestBody = {
    //   query: prompt,
    //   origin_lat: currentLat,
    //   origin_lng: currentLng,
    // };

    // If your Go backend expects 'origin' to be a string name:
    // const requestBody = {
    //   query: prompt,
    //   origin: "My Current Location", // Or from a separate input field
    // };


    try {
      const response = await fetch(`${API_BASE_URL}/plan-trip`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${user.token}`, // user.token is guaranteed to exist by checks above
            'Content-Type': 'application/json', // This is correct for sending JSON
        },
        body: JSON.stringify(requestBody), // This is correct for sending JSON
      });

      if (!response.ok) {
        let errorMessage = `Backend error! Status: ${response.status}, Message: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage; // Use backend message if available
        } catch (parseError) {
            console.warn("Could not parse backend error response as JSON:", parseError);
        }
        throw new Error(errorMessage);
      }

      const data: RecommendationResponse = await response.json();
      console.log('Recommendation received:', data);

      // Redirect to /results page with data in query params
      router.push(`/results?data=${encodeURIComponent(JSON.stringify(data))}`);
      // Using encodeURIComponent is safer for complex JSON in URL
      
      onSearchEnd?.(data, null);

    } catch (err: any) {
      console.error("Failed to fetch recommendation:", err);
      const errorMessage = `An error occurred during search: ${err.message}`;
      setError(errorMessage);
      onSearchEnd?.(null, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-input-container bg-white p-8 rounded-lg shadow-md max-w-xl mx-auto my-5">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Plan Your Journey</h2>
      <p className="text-lg text-center mb-6 text-gray-600">
        Tell us where you want to go and what you want to eat!
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="sr-only">Your travel and food wishes</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg text-gray-900"
            placeholder="e.g., 'I want to go to Braga, buy cimol and Thai tea, and bring home Lembang milk cake!'"
            disabled={loading}
            required
          ></textarea>
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading || !isAuthenticated}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Plan My Trip!'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchInput;