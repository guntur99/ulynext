// components/HomeContentUser.tsx
import React from 'react';
import TravelRouteMap from '@/components/TravelRouteMap'; // Assuming this component exists

/**
 * HomeContentUser Component
 * Displays content specific to authenticated users with the 'user' role.
 */
const HomeContentUser: React.FC = () => {
  return (
    <>
      <hr className="my-8 border-gray-300" />
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Plan Your Journey</h2>
      <TravelRouteMap /> {/* Uncomment when TravelRouteMap is ready */}
      <div className="bg-gray-100 p-6 rounded-lg text-center text-gray-700">
        <p>Your travel route planning features will appear here.</p>
        <p className="text-sm mt-2">
          (TravelRouteMap component is currently commented out in the example.)
        </p>
      </div>
    </>
  );
};

export default HomeContentUser;