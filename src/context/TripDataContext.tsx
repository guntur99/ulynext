// src/context/TripDataContext.tsx
"use client"; // This is a client component

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RecommendationResponse } from '../types/interfaces'; // Ensure correct path

interface TripDataContextType {
  tripData: RecommendationResponse | null;
  setTripData: (data: RecommendationResponse | null) => void;
  isLoadingTripData: boolean; // Optional: to indicate if data is being fetched/processed
  setIsLoadingTripData: (loading: boolean) => void;
  tripDataError: string | null; // Optional: to store any error related to trip data
  setTripDataError: (error: string | null) => void;
}

const TripDataContext = createContext<TripDataContextType | undefined>(undefined);

export const TripDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tripData, setTripData] = useState<RecommendationResponse | null>(null);
  const [isLoadingTripData, setIsLoadingTripData] = useState<boolean>(false);
  const [tripDataError, setTripDataError] = useState<string | null>(null);

  return (
    <TripDataContext.Provider
      value={{
        tripData,
        setTripData,
        isLoadingTripData,
        setIsLoadingTripData,
        tripDataError,
        setTripDataError,
      }}
    >
      {children}
    </TripDataContext.Provider>
  );
};

export const useTripData = () => {
  const context = useContext(TripDataContext);
  if (context === undefined) {
    throw new Error('useTripData must be used within a TripDataProvider');
  }
  return context;
};