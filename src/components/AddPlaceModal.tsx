// components/AddPlaceModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

/**
 * Interface for the Category data received from the API.
 */
interface Category {
  id: string; // Assuming category ID is a UUID (string)
  name: string;
}

/**
 * Interface for the data structure of a new marker/place to be sent to the API.
 * Matches your backend's expected payload.
 */
interface NewPlaceMarkerData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category_id?: string; // Change to string to match UUID, make optional if your backend allows null
}

/**
 * Props for the AddPlaceModal component.
 */
interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceAdded: () => void; // Callback to notify parent a place was added
}

/**
 * AddPlaceModal Component
 * Renders a modal for adding new place markers.
 */
const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ isOpen, onClose, onPlaceAdded }) => {
  const { user } = useAuth(); // Get user for token

  // Form input states
  const [newPlaceName, setNewPlaceName] = useState<string>('');
  const [newPlaceDescription, setNewPlaceDescription] = useState<string>('');
  const [newPlaceLatitude, setNewPlaceLatitude] = useState<number | ''>('');
  const [newPlaceLongitude, setNewPlaceLongitude] = useState<number | ''>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // State for selected category ID

  // Data states
  const [categories, setCategories] = useState<Category[]>([]); // State to store fetched categories

  // Loading/Error states for categories
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Submission states for adding place
  const [isSubmittingPlace, setIsSubmittingPlace] = useState<boolean>(false);
  const [submitPlaceError, setSubmitPlaceError] = useState<string | null>(null);
  const [submitPlaceSuccess, setSubmitPlaceSuccess] = useState<string | null>(null);

  // Get API Base URL from environment variables
  const API_BASE_URL: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL;

  // --- Effect to fetch categories when modal opens ---
  useEffect(() => {
    const fetchCategories = async () => {
      if (!API_BASE_URL) {
        setCategoriesError("API Base URL is not configured.");
        setIsLoadingCategories(false);
        return;
      }
      if (!user?.token) {
        setCategoriesError("Authentication token not found. Please log in.");
        setIsLoadingCategories(false);
        return;
      }

      setIsLoadingCategories(true);
      setCategoriesError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/marker/categories`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch categories: ${response.statusText}`);
        }

        const data: Category[] = await response.json();
        setCategories(data);
        // console.log(data);
        
        // Automatically select the first category if available
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (error: unknown) {
        console.error('Error fetching categories:', error);
        if (error instanceof Error) {
          setCategoriesError(`Failed to load categories: ${error.message}`);
        } else {
          setCategoriesError('Failed to load categories due to an unknown error.');
        }
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
      // Reset form and messages when modal opens
      setNewPlaceName('');
      setNewPlaceDescription('');
      setNewPlaceLatitude('');
      setNewPlaceLongitude('');
      setSelectedCategoryId('');
      setSubmitPlaceError(null);
      setSubmitPlaceSuccess(null);
    }
  }, [isOpen, API_BASE_URL, user?.token]); // Re-run effect when modal opens or auth changes

  // Handle form submission for adding a new place
  const handleSubmitNewPlace = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmittingPlace(true);
    setSubmitPlaceError(null);
    setSubmitPlaceSuccess(null);

    // Input validation
    if (!newPlaceName || !newPlaceDescription || newPlaceLatitude === '' || newPlaceLongitude === '') {
      setSubmitPlaceError("All fields are required.");
      setIsSubmittingPlace(false);
      return;
    }

    if (isNaN(Number(newPlaceLatitude)) || isNaN(Number(newPlaceLongitude))) {
      setSubmitPlaceError("Latitude and Longitude must be numbers.");
      setIsSubmittingPlace(false);
      return;
    }

    if (!API_BASE_URL) {
      setSubmitPlaceError("API Base URL is not configured. Please set NEXT_PUBLIC_API_BASE_URL.");
      setIsSubmittingPlace(false);
      return;
    }

    if (!user?.token) {
        setSubmitPlaceError("You are not authenticated. Please log in.");
        setIsSubmittingPlace(false);
        return;
    }

    // Ensure a category is selected if your backend requires it
    // If category_id can be optional, you can remove this check or make it conditional
    if (!selectedCategoryId) {
      setSubmitPlaceError("Please select a category.");
      setIsSubmittingPlace(false);
      return;
    }


    try {
      const token = user.token; // Get token from the authenticated user

      const newPlaceData: NewPlaceMarkerData = {
        name: newPlaceName,
        description: newPlaceDescription,
        latitude: Number(newPlaceLatitude),
        longitude: Number(newPlaceLongitude),
        category_id: selectedCategoryId, // Use the selected category ID
      };

      const response = await fetch(`${API_BASE_URL}/markers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include authentication token
        },
        body: JSON.stringify(newPlaceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add place: ${response.statusText}`);
      }

    //   const result = await response.json();
    //   console.log('Place successfully added:', result);
      setSubmitPlaceSuccess("Place successfully added!");

      // Reset form fields after successful submission
      setNewPlaceName('');
      setNewPlaceDescription('');
      setNewPlaceLatitude('');
      setNewPlaceLongitude('');
      setSelectedCategoryId(''); // Reset selected category
      
      onPlaceAdded(); // Call the callback to notify parent
      // onClose(); // Consider if the modal should close immediately or after a short delay

    } catch (error: unknown) {
      console.error('Error adding new place:', error);
      if (error instanceof Error) {
        setSubmitPlaceError(`An error occurred: ${error.message}`);
      } else {
        setSubmitPlaceError('An unknown error occurred.');
      }
    } finally {
      setIsSubmittingPlace(false);
    }
  };

  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Place</h3>

        {/* Input Form */}
        <form onSubmit={handleSubmitNewPlace} className="space-y-4">
          <div>
            <label htmlFor="placeName" className="block text-sm font-medium text-gray-700">Place Name</label>
            <input
              type="text"
              id="placeName"
              value={newPlaceName}
              onChange={(e) => setNewPlaceName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              placeholder="Enter place name"
              required
            />
          </div>
          <div>
            <label htmlFor="placeDescription" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="placeDescription"
              value={newPlaceDescription}
              onChange={(e) => setNewPlaceDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              placeholder="Describe this place"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="placeLatitude" className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                type="number"
                id="placeLatitude"
                value={newPlaceLatitude}
                onChange={(e) => setNewPlaceLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                step="any"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                placeholder="Example: -6.2088"
                required
              />
            </div>
            <div>
              <label htmlFor="placeLongitude" className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                type="number"
                id="placeLongitude"
                value={newPlaceLongitude}
                onChange={(e) => setNewPlaceLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                step="any"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                placeholder="Example: 106.8456"
                required
              />
            </div>
          </div>

          {/* Category Select Option */}
          <div>
            <label htmlFor="placeCategory" className="block text-sm font-medium text-gray-700">Category</label>
            {isLoadingCategories ? (
              <p className="text-gray-500 text-sm mt-1">Loading categories...</p>
            ) : categoriesError ? (
              <p className="text-red-500 text-sm mt-1">{categoriesError}</p>
            ) : (
              <select
                id="placeCategory"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                required // Make category selection required if your backend requires it
              >
                {categories.length === 0 && (
                  <option value="">No categories available</option>
                )}
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Display error or success messages */}
          {submitPlaceError && (
            <p className="text-red-500 text-sm text-center">{submitPlaceError}</p>
          )}
          {submitPlaceSuccess && (
            <p className="text-green-600 text-sm text-center">{submitPlaceSuccess}</p>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingPlace || isLoadingCategories || categoriesError !== null}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingPlace ? 'Saving...' : 'Save Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceModal;