// src/components/plantrip/SearchInput.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { RecommendationResponse } from '../../types/interfaces'; // Removed unused 'LatLng'
import { useAuth } from '@/hooks/useAuth';
import { useTripData } from '../../context/TripDataContext'; // Import your new hook

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
  const { setTripData, setIsLoadingTripData, setTripDataError } = useTripData(); // Use the context

  const API_BASE_URL: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    onSearchStart?.();

    // Reset trip data context state
    setTripData(null);
    setTripDataError(null);
    setIsLoadingTripData(true);

    // Ensure user is authenticated and token is available
    if (!isAuthenticated || !user || !user.token) {
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
    } catch (geoError: unknown) { // Changed type from 'any' to 'unknown'
      if (geoError instanceof Error) {
        console.warn(`Could not get current geolocation: ${geoError.message}. Using default coordinates.`);
      } else {
        console.warn("Could not get current geolocation. Using default coordinates.", geoError);
      }
      currentLat = -6.890614; // Default to Bandung
      currentLng = 107.610531; // Default to Bandung
      setError("Could not get your current location. Using default coordinates for the search.");
    }

    if (!API_BASE_URL) {
      const errorMessage = "API Base URL is not configured. Please set NEXT_PUBLIC_API_BASE_URL.";
      setError(errorMessage);
      onSearchEnd?.(null, errorMessage);
      setLoading(false);
      setIsLoadingTripData(false); // Make sure to set loading to false
      return;
    }

    if (!prompt.trim()) {
      const errorMessage = "Please enter your travel and food wishes.";
      setError(errorMessage);
      onSearchEnd?.(null, errorMessage);
      setLoading(false);
      setIsLoadingTripData(false); // Make sure to set loading to false
      return;
    }

    if (currentLat === undefined || currentLng === undefined) {
        const errorMessage = "Geolocation data is missing. Cannot proceed with trip planning.";
        setError(errorMessage);
        onSearchEnd?.(null, errorMessage);
        setLoading(false);
        setIsLoadingTripData(false); // Make sure to set loading to false
        return;
    }

    // --- Prepare the JSON payload ---
    const requestBody = {
      query: prompt,
      origin: `${currentLat},${currentLng}`,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/plan-trip`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `Backend error! Status: ${response.status}, Message: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
            console.warn("Could not parse backend error response as JSON:", parseError);
        }
        throw new Error(errorMessage);
      }

      const data: RecommendationResponse = await response.json();
      console.log('Recommendation received:', data);

      // --- Store the data in context instead of URL query params ---
      setTripData(data); // Save the data to the context

      // Redirect to /results page
      router.push(`/results`);

      onSearchEnd?.(data, null);

    } catch (err: unknown) { // Changed type from 'any' to 'unknown'
      console.error("Failed to fetch recommendation:", err);
      let errorMessage = "An unknown error occurred during the search.";
      if (err instanceof Error) {
        errorMessage = `An error occurred during search: ${err.message}`;
      }
      setError(errorMessage);
      setTripDataError(errorMessage); // Store error in context
      onSearchEnd?.(null, errorMessage);
    } finally {
      setLoading(false);
      setIsLoadingTripData(false); // Ensure loading state is false in context
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
