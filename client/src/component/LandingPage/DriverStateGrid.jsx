// // Frontend: src/components/DriverStatesGrid.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Icons (using react-icons; generic location for states)
import { MdLocationOn } from 'react-icons/md';

const DriverStatesGrid = () => {
  const [states, setStates] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch states with driver counts
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setError(null);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver/states`);
        setStates(response.data);
        console.log('States loaded:', response.data);
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
        <h3 className='text-2xl text-center font-bold pb-5'>States we cover</h3>
      {/* States Grid: 2 cols on mobile/desktop small, 4 on large */}
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
                  <p className="text-xs text-gray-600 font-medium">{state.count} drivers</p>
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

      {/* View More/Less Button: Responsive, full-width on mobile */}
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






// // src/components/DriverStatesGrid.jsx
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { MdLocationOn } from 'react-icons/md';

// const DriverStatesGrid = () => {
//   const [states, setStates] = useState([]);
//   const [showMore, setShowMore] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchStates = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/driver/states`
//         );

//         // Optional safety: ensure uniqueness just in case backend has bug
//         const uniqueStates = res.data.reduce((acc, curr) => {
//           if (!acc.some((item) => item.name === curr.name)) {
//             acc.push(curr);
//           }
//           return acc;
//         }, []);

//         // Sort alphabetically (in case backend sort is missing)
//         uniqueStates.sort((a, b) => a.name.localeCompare(b.name));

//         setStates(uniqueStates);

//         console.log('States loaded (unique count):', uniqueStates.length);
//         console.log('First few states:', uniqueStates.slice(0, 3));
//       } catch (err) {
//         console.error('Failed to load driver states:', err);
//         setError('Unable to load states. Please check your connection and try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStates();
//   }, []);

//   const displayedStates = showMore ? states : states.slice(0, 8); // increased from 4 → 8 feels better

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-12">
//         <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
//           <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
//           <p className="text-gray-600 font-medium">Loading available states...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto px-4 py-12 text-center">
//         <div className="max-w-md mx-auto">
//           <p className="text-red-600 font-medium mb-4 text-lg">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
//       <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-10">
//         States We Operate In
//       </h2>

//       {states.length === 0 ? (
//         <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
//           <p className="text-lg text-gray-600 font-medium">
//             No active drivers found in any state yet.
//           </p>
//           <p className="mt-2 text-gray-500">
//             Check back later as we continue to expand.
//           </p>
//         </div>
//       ) : (
//         <>
//           {/* Grid */}
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
//             {displayedStates.map((state) => (
//               <div
//                 key={state.name}
//                 className="group relative bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300 overflow-hidden"
//               >
//                 <div className="p-5 sm:p-6 text-center">
//                   <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-green-100 text-green-600 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
//                     <MdLocationOn className="w-6 h-6 sm:w-7 sm:h-7" />
//                   </div>

//                   <h3 className="text-base sm:text-lg font-semibold text-gray-800 capitalize mb-1.5">
//                     {state.name}
//                   </h3>

//                   <p className="text-sm text-gray-600 font-medium">
//                     {state.count} {state.count === 1 ? 'driver' : 'drivers'}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Show more / less */}
//           {states.length > 8 && (
//             <div className="mt-10 text-center">
//               <button
//                 onClick={() => setShowMore(!showMore)}
//                 className="inline-flex items-center px-8 py-3.5 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-md active:scale-95"
//               >
//                 {showMore
//                   ? 'Show Fewer States'
//                   : `View All States (${states.length})`}
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </section>
//   );
// };

// export default DriverStatesGrid;