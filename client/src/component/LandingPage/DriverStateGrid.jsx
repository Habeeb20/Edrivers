



// Frontend: src/components/DriverStatesGrid.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdLocationOn } from 'react-icons/md';

const DriverStatesGrid = () => {
  const [states, setStates] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setError(null);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver/states`);

        // Group by state name (case-insensitive) and sum the counts
        const uniqueStatesMap = response.data.reduce((acc, current) => {
          const key = current.name?.trim().toLowerCase();
          if (!key) return acc;

          if (acc[key]) {
            acc[key].count += Number(current.count) || 0;
          } else {
            acc[key] = {
              ...current,
              name: current.name.trim(), // keep original casing of first occurrence
              count: Number(current.count) || 0,
            };
          }
          return acc;
        }, {});

        const uniqueStates = Object.values(uniqueStatesMap);

        setStates(uniqueStates);
        console.log('States loaded (unique + summed):', uniqueStates);
      } catch (error) {
        console.error('Error fetching states:', error);
        setError('Failed to load states. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  const displayedStates = showMore ? states : states.slice(0, 4);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-base text-gray-600 animate-pulse">Loading states...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-base text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <h3 className="text-2xl text-center font-bold pb-5">States we cover</h3>

      <div className="mb-6 sm:mb-8">
        {displayedStates.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {displayedStates.map((state) => (
              <div
                key={state.name}
                className="group bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg lg:rounded-xl shadow-md lg:shadow-lg hover:shadow-xl transition-all duration-300 p-2 sm:p-3 lg:p-6 text-center cursor-default border border-green-200 hover:border-green-300 hover:from-green-100 hover:to-emerald-200"
              >
                <div className="relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 sm:mb-3 bg-green-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base lg:text-xl">
                    <MdLocationOn />
                  </div>
                  <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 capitalize mb-1 leading-tight">
                    {state.name}
                  </h3>
                  <p className="text-xs text-gray-600 font-medium">
                    {state.count} driver{state.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-base text-gray-600">No states with drivers available at the moment.</p>
          </div>
        )}
      </div>

      {states.length > 4 && (
        <div className="text-center mb-6 sm:mb-8">
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 font-medium text-sm sm:text-base shadow-md hover:shadow-lg active:scale-95"
          >
            {showMore ? 'View Less (4)' : `View More (+${states.length - 4})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverStatesGrid;