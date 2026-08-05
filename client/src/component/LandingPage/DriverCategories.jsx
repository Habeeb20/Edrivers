
// // Frontend: src/components/DriverCategoriesGrid.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // Assuming axios for API calls

// // Icons for categories (using react-icons for beauty; install if needed: npm i react-icons)
// import { 
//   MdWork, MdSchedule, MdWeekend, MdTimer, 
//   MdFlight, MdDirectionsCar, MdNightlight, 
//   MdBusinessCenter, MdFamilyRestroom, MdSchool, 
//   MdLocalShipping, MdCalendarMonth, MdPets 
// } from 'react-icons/md';

// const categoryIcons = {
//   'full-time': MdWork,
//   'part-time': MdSchedule,
//   'weekend': MdWeekend,
//   'short-time': MdTimer,
//   'airport-pickup': MdFlight,
//   'outstation-travel': MdDirectionsCar,
//   'night-out-designated': MdNightlight,
//   'executive-chauffeur': MdBusinessCenter,
//   'family-child-friendly': MdFamilyRestroom,
//   'school-bus': MdSchool,
//   'tanker-hazmat': MdLocalShipping,
//   'retained-monthly': MdCalendarMonth,
//   'pet-friendly': MdPets,
// };

// const DriverCategoriesGrid = () => {
//   const [categories, setCategories] = useState([]);
//   const [driversByCategory, setDriversByCategory] = useState({});
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [showMore, setShowMore] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [loadingDrivers, setLoadingDrivers] = useState(false);

//   // Fetch categories with driver counts
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver/categories`);
//         setCategories(response.data);
//         console.log(response);
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCategories();
//   }, []);

//   // Fetch drivers for a category when selected
//   const fetchDriversForCategory = async (category) => {
//     if (driversByCategory[category]) {
//       setSelectedCategory(category);
//       return;
//     }
//     setLoadingDrivers(true);
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver?category=${category}&limit=20`);
//       setDriversByCategory(prev => ({ ...prev, [category]: response.data.drivers }));
//       setSelectedCategory(category);
//     } catch (error) {
//       console.error('Error fetching drivers:', error);
//     } finally {
//       setLoadingDrivers(false);
//     }
//   };

//   // Fetch full driver details
//   const fetchDriverDetails = async (driverId) => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver/${driverId}`);
//       setSelectedDriver(response.data);
//     } catch (error) {
//       console.error('Error fetching driver details:', error);
//     }
//   };

//   const displayedCategories = showMore ? categories : categories.slice(0, 4);

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex justify-center items-center h-64">
//           <div className="text-base text-gray-600">Loading categories...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Categories Grid */}
//       <div className="mb-8">
//         {displayedCategories.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
//             {displayedCategories.map((cat) => {
//               const Icon = categoryIcons[cat.name] || MdWork;
//               return (
//                 <div
//                   key={cat.name}
//                   className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-3 sm:p-4 lg:p-6 text-center cursor-pointer border border-blue-200 hover:border-blue-300 hover:scale-105"
//                   onClick={() => fetchDriversForCategory(cat.name)}
//                 >
//                   <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-3 sm:mb-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base lg:text-xl">
//                     <Icon />
//                   </div>
//                   <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 capitalize mb-1 leading-relaxed">
//                     {cat.name.replace(/-/g, ' ')}
//                   </h3>
//                   <p className="text-xs sm:text-sm text-gray-600 font-medium">{cat.count} drivers</p>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <p className="text-base text-gray-600">No categories available at the moment.</p>
//           </div>
//         )}
//       </div>

//       {/* View More/Less Button */}
//       {categories.length > 4 && (
//         <div className="text-center mb-8">
//           <button
//             onClick={() => setShowMore(!showMore)}
//             className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 font-medium text-base shadow-md hover:shadow-lg"
//           >
//             {showMore ? 'View Less' : 'View More'}
//           </button>
//         </div>
//       )}

//       {/* Category Drivers Modal */}
//       {selectedCategory && (
//         <Modal onClose={() => {
//           setSelectedCategory(null);
//           setLoadingDrivers(false);
//         }}>
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl sm:text-2xl font-bold capitalize">{selectedCategory.replace(/-/g, ' ')} Drivers</h2>
//             {loadingDrivers && <div className="text-base text-blue-600">Loading drivers...</div>}
//           </div>
//           {loadingDrivers ? (
//             <div className="flex justify-center items-center h-32">
//               <div className="text-base text-gray-600">Loading drivers...</div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
//               {driversByCategory[selectedCategory]?.length > 0 ? (
//                 driversByCategory[selectedCategory].map((driver) => (
//                   <div
//                     key={driver._id}
//                     className="bg-white rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border border-gray-200"
//                     onClick={() => fetchDriverDetails(driver._id)}
//                   >
//                     <img
//                       src={driver.avatar || '/default-avatar.png'}
//                       alt={`${driver.firstName} ${driver.lastName}`}
//                       className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 sm:mb-3 object-cover"
//                     />
//                     <h3 className="text-center font-semibold text-gray-800 text-sm sm:text-base leading-relaxed">
//                       {driver.firstName} {driver.lastName}
//                     </h3>
//                     <p className="text-center text-xs sm:text-sm text-gray-600 mb-2">
//                       {driver.yearsOfExperience} years exp.
//                     </p>
//                     <div className="flex justify-center">
//                       <span className="text-yellow-500 text-sm sm:text-base">★ {driver.rating || 0}</span>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="col-span-full text-center text-base text-gray-500 py-8">No drivers available in this category.</p>
//               )}
//             </div>
//           )}
//         </Modal>
//       )}

//       {/* Driver Details Modal */}
//       {selectedDriver && (
//         <Modal onClose={() => setSelectedDriver(null)}>
//           <div className="max-w-sm sm:max-w-md mx-auto p-4 sm:p-6">
//             <img
//               src={selectedDriver.avatar || '/default-avatar.png'}
//               alt={`${selectedDriver.firstName} ${selectedDriver.lastName}`}
//               className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 sm:mb-6 object-cover"
//             />
//             <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
//               {selectedDriver.firstName} {selectedDriver.lastName}
//             </h2>
//             <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
//               {selectedDriver.bio && (
//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-1">Bio</h3>
//                   <p className="text-gray-600 leading-relaxed">{selectedDriver.bio}</p>
//                 </div>
//               )}
//               <div>
//                 <h3 className="font-semibold text-gray-700 mb-1">Experience</h3>
//                 <p className="text-gray-600">{selectedDriver.yearsOfExperience} years</p>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-gray-700 mb-1">Languages</h3>
//                 <p className="text-gray-600">{selectedDriver.languagesSpoken?.join(', ') || 'English'}</p>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-gray-700 mb-1">Expected Earnings</h3>
//                 <p className="text-gray-600">
//                   ${selectedDriver.expectedEarnings?.min || 0} - ${selectedDriver.expectedEarnings?.max || 0} {selectedDriver.expectedEarnings?.currency || 'USD'}/hr
//                 </p>
//               </div>
//               {selectedDriver.vehicle && (
//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-1">Vehicle</h3>
//                   <p className="text-gray-600">
//                     {selectedDriver.vehicle.make} {selectedDriver.vehicle.model} ({selectedDriver.vehicle.year})
//                   </p>
//                 </div>
//               )}
//               <div className="pt-4 sm:pt-6 border-t border-gray-200">
//                 <h3 className="font-semibold text-gray-700 mb-2">Rating</h3>
//                 <div className="flex justify-center">
//                   <span className="text-yellow-500 text-lg sm:text-xl">★ {selectedDriver.rating || 0}</span>
//                 </div>
//               </div>
//               {selectedDriver.totalTrips && (
//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-1">Total Trips</h3>
//                   <p className="text-gray-600">{selectedDriver.totalTrips}</p>
//                 </div>
//               )}
//               {selectedDriver.transmission && (
//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-1">Transmission</h3>
//                   <p className="text-gray-600">{selectedDriver.transmission.join(', ')}</p>
//                 </div>
//               )}
//               {selectedDriver.travelCapabilities && (
//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-1">Travel Capabilities</h3>
//                   <p className="text-gray-600">
//                     {selectedDriver.travelCapabilities.interstate ? 'Interstate: Yes' : 'Interstate: No'},{' '}
//                     {selectedDriver.travelCapabilities.international ? 'International: Yes' : 'International: No'}
//                   </p>
//                   {selectedDriver.travelCapabilities.travelNotes && (
//                     <p className="text-gray-600 mt-1 italic text-sm">Notes: {selectedDriver.travelCapabilities.travelNotes}</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// // Enhanced Modal Component
// const Modal = ({ children, onClose }) => (
//   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
//     <div className="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl">
//       <div className="sticky top-0 bg-white p-3 sm:p-4 border-b flex justify-between items-center rounded-t-xl">
//         <span></span> {/* Spacer */}
//         <button 
//           onClick={onClose} 
//           className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl font-bold transition-colors"
//         >
//           &times;
//         </button>
//       </div>
//       <div className="p-4 sm:p-6">{children}</div>
//     </div>
//   </div>
// );

// export default DriverCategoriesGrid;




import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Icons unchanged
import { 
  MdWork, MdSchedule, MdWeekend, MdTimer, 
  MdFlight, MdDirectionsCar, MdNightlight, 
  MdBusinessCenter, MdFamilyRestroom, MdSchool, 
  MdLocalShipping, MdCalendarMonth, MdPets 
} from 'react-icons/md';

const categoryIcons = {
  'full-time': MdWork,
  'part-time': MdSchedule,
  'weekend': MdWeekend,
  'short-time': MdTimer,
  'airport-pickup': MdFlight,
  'outstation-travel': MdDirectionsCar,
  'night-out-designated': MdNightlight,
  'executive-chauffeur': MdBusinessCenter,
  'family-child-friendly': MdFamilyRestroom,
  'school-bus': MdSchool,
  'tanker-hazmat': MdLocalShipping,
  'retained-monthly': MdCalendarMonth,
  'pet-friendly': MdPets,
};

const DriverCategoriesGrid = () => {
  const [categories, setCategories] = useState([]);
  const [driversByCategory, setDriversByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories with driver counts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError(null);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver/categories`);
        setCategories(response.data);
        console.log('Categories loaded:', response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch drivers for a category when selected
  const fetchDriversForCategory = async (category) => {
    console.log('Category clicked:', category); // Debug: Confirm click fires
    if (driversByCategory[category]) {
      setSelectedCategory(category);
      return;
    }
    setLoadingDrivers(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver?category=${category}&limit=20`);
      setDriversByCategory(prev => ({ ...prev, [category]: response.data.drivers }));
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Failed to load drivers for this category.');
    } finally {
      setLoadingDrivers(false);
    }
  };

  // Fetch full driver details
  const fetchDriverDetails = async (driverId) => {
    console.log('Driver clicked:', driverId); // Debug
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver/${driverId}`);
      setSelectedDriver(response.data);
    } catch (error) {
      console.error('Error fetching driver details:', error);
      setError('Failed to load driver details.');
    }
  };

  const displayedCategories = showMore ? categories : categories.slice(0, 4);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-base text-gray-600 animate-pulse">Loading categories...</div>
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
            <h3 className='text-2xl text-center font-bold pb-5'>Service categories</h3>
      {/* Categories Grid: 2 cols on mobile/desktop small, 4 on large */}
      <div className="mb-6 sm:mb-8">
        {displayedCategories.length > 0 ? (
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {displayedCategories.map((cat) => {
              const Icon = categoryIcons[cat.name] || MdWork;
              return (
                <div
                  key={cat.name}
                  className="group bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg lg:rounded-xl shadow-md lg:shadow-lg hover:shadow-xl transition-all duration-300 p-2 sm:p-3 lg:p-6 text-center cursor-pointer border border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-200 active:scale-95 pointer-events-auto relative overflow-hidden"
                  onClick={() => fetchDriversForCategory(cat.name)}
                >
                  {/* Optional ripple effect */}
                  <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-lg lg:rounded-xl"></div>
                  <div className="relative z-10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-2 sm:mb-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base lg:text-xl">
                      <Icon />
                    </div>
                    <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 capitalize mb-1 leading-tight">
                      {cat.name.replace(/-/g, ' ')}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">{cat.count} drivers</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-base text-gray-600">No categories available at the moment.</p>
          </div>
        )}
      </div>

      {/* View More/Less Button: Responsive, full-width on mobile */}
      {categories.length > 4 && (
        <div className="text-center mb-6 sm:mb-8">
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 font-medium text-sm sm:text-base shadow-md hover:shadow-lg active:scale-95"
          >
            {showMore ? 'View Less (4)' : `View More (+${categories.length - 4})`}
          </button>
        </div>
      )}

      {/* Category Drivers Modal */}
      {selectedCategory && (
        <Modal onClose={() => {
          setSelectedCategory(null);
          setLoadingDrivers(false);
        }}>
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold capitalize text-gray-800">
              {selectedCategory.replace(/-/g, ' ')} Drivers
            </h2>
            {loadingDrivers && <div className="text-sm sm:text-base text-blue-600 animate-pulse">Loading...</div>}
          </div>
          {loadingDrivers ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-base text-gray-600">Loading drivers...</div>
            </div>
          ) : driversByCategory[selectedCategory]?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {driversByCategory[selectedCategory].map((driver) => (
                <div
                  key={driver._id}
                  className="group bg-white rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border border-gray-200 active:scale-95 pointer-events-auto relative overflow-hidden"
                  onClick={() => fetchDriverDetails(driver._id)}
                >
                  <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-5 transition-opacity rounded-lg"></div>
                  <div className="relative z-10">
                    <img
                      src={driver.avatar || '/default-avatar.png'}
                      alt={`${driver.firstName} ${driver.lastName}`}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 sm:mb-3 object-cover"
                    />
                    <h3 className="text-center font-semibold text-gray-800 text-sm sm:text-base leading-tight">
                      {driver.firstName} {driver.lastName}
                    </h3>
                    <p className="text-center text-xs sm:text-sm text-gray-600 mb-2">
                      {driver.yearsOfExperience} yrs exp.
                    </p>
                    <div className="flex justify-center items-center mb-2">
                      <span className="text-yellow-500 text-sm sm:text-base mr-1">★ {driver.rating || 0}</span>
                      {driver.isAvailable && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="col-span-full text-center text-base text-gray-500 py-8">No drivers available in this category.</p>
          )}
        </Modal>
      )}

      {/* Enhanced Driver Details Modal */}
      {selectedDriver && (
        <Modal onClose={() => setSelectedDriver(null)}>
          <div className="max-w-sm sm:max-w-md mx-auto p-4 sm:p-6">
            <img
              src={selectedDriver.avatar || '/default-avatar.png'}
              alt={`${selectedDriver.firstName} ${selectedDriver.lastName}`}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 sm:mb-6 object-cover border-4 border-blue-100"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
              {selectedDriver.firstName} {selectedDriver.lastName}
            </h2>
            <div className="space-y-4 sm:space-y-6 text-sm">
              {/* Profile Bio & Experience */}
              {selectedDriver.bio && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1 flex items-center">
                    <span className="mr-2">📝</span>Bio
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{selectedDriver.bio}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 flex items-center">
                  <span className="mr-2">🚗</span>Experience
                </h3>
                <p className="text-gray-600">{selectedDriver.yearsOfExperience} years</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 flex items-center">
                  <span className="mr-2">🌐</span>Languages
                </h3>
                <p className="text-gray-600">{selectedDriver.languagesSpoken?.join(', ') || 'English'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 flex items-center">
                  <span className="mr-2">💰</span>Expected Earnings
                </h3>
                <p className="text-gray-600">
                  ${selectedDriver.expectedEarnings?.min || 0} - ${selectedDriver.expectedEarnings?.max || 0} {selectedDriver.expectedEarnings?.currency || 'USD'}/hr
                </p>
              </div>
              {/* Vehicle Details */}
              {selectedDriver.vehicle && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1 flex items-center">
                    <span className="mr-2">🚙</span>Vehicle
                  </h3>
                  <p className="text-gray-600">
                    {selectedDriver.vehicle.make} {selectedDriver.vehicle.model} ({selectedDriver.vehicle.year})
                  </p>
                  {selectedDriver.vehicle.color && <p className="text-gray-500 text-xs">Color: {selectedDriver.vehicle.color}</p>}
                  {/* {selectedDriver.vehicle.licensePlate && <p className="text-gray-500 text-xs">Plate: {selectedDriver.vehicle.licensePlate}</p>} */}
                  {selectedDriver.vehicle.capacity && <p className="text-gray-500 text-xs">Capacity: {selectedDriver.vehicle.capacity} passengers</p>}
                </div>
              )}
              {/* Transmission */}
              {selectedDriver.transmission && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1 flex items-center">
                    <span className="mr-2">⚙️</span>Transmission
                  </h3>
                  <p className="text-gray-600">{selectedDriver.transmission.join(', ')}</p>
                </div>
              )}
              {/* Travel Capabilities */}
              {selectedDriver.travelCapabilities && Object.values(selectedDriver.travelCapabilities).some(Boolean) && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1 flex items-center">
                    <span className="mr-2">✈️</span>Travel
                  </h3>
                  <p className="text-gray-600">
                    Interstate: {selectedDriver.travelCapabilities.interstate ? 'Yes' : 'No'} | International: {selectedDriver.travelCapabilities.international ? 'Yes' : 'No'}
                  </p>
                  {selectedDriver.travelCapabilities.travelNotes && <p className="text-gray-500 text-xs italic mt-1">Notes: {selectedDriver.travelCapabilities.travelNotes}</p>}
                </div>
              )}
              {/* Divider */}
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                {/* Contact Info */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">📞</span>Contact Info
                  </h3>
                  {/* {selectedDriver.phone && (
                    <p className="text-gray-600 mb-1"><span className="font-medium">Phone:</span> {selectedDriver.phone}</p>
                  )}
                  {selectedDriver.email && (
                    <p className="text-gray-600 mb-1"><span className="font-medium">Email:</span> {selectedDriver.email}</p>
                  )} */}
                  {selectedDriver.address && (
                    <p className="text-gray-600"><span className="font-medium">Address:</span> {selectedDriver.address.street ? `${selectedDriver.address.street}, ` : ''}{selectedDriver.address.city}, {selectedDriver.address.state} {selectedDriver.address.zipCode}, {selectedDriver.address.country}</p>
                  )}
                  {selectedDriver.dateOfBirth && (
                    <p className="text-gray-600 text-xs"><span className="font-medium">DOB:</span> {new Date(selectedDriver.dateOfBirth).toLocaleDateString()}</p>
                  )}
                </div>
                {/* Verification */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">✅</span>Verification
                  </h3>
                  <p className="text-gray-600 mb-1"><span className="font-medium">Status:</span> {selectedDriver.verificationStatus || 'Unverified'}</p>
                  <p className="text-gray-600"><span className="font-medium">Verified:</span> {selectedDriver.isVerified ? 'Yes' : 'No'}</p>
                </div>
                {/* Documents */}
                {selectedDriver.documents && selectedDriver.documents.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">📄</span>Documents
                    </h3>
                    <ul className="text-gray-600 space-y-1 text-xs">
                      {selectedDriver.documents.map((doc, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="font-medium">{doc.type}:</span>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-500 hover:underline">View</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Stats */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">📊</span>Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-gray-600 text-xs">Total Trips</p>
                      <p className="font-semibold text-gray-800">{selectedDriver.totalTrips || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Earnings</p>
                      <p className="font-semibold text-gray-800">${selectedDriver.earnings || 0}</p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className="text-yellow-500 text-lg sm:text-xl">★ {selectedDriver.rating || 0}</span>
                  </div>
                  {selectedDriver.isAvailable && <p className="text-center text-green-600 text-sm mt-1 font-medium">Currently Available</p>}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Enhanced Modal with better mobile support (unchanged)
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
    <div className="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl relative">
      <div className="sticky top-0 bg-white p-3 sm:p-4 border-b flex justify-between items-center rounded-t-xl z-10">
        <span className="invisible">Close</span> {/* Spacer for alignment */}
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl font-bold transition-colors absolute right-3 sm:right-4 top-3 sm:top-4"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  </div>
);

export default DriverCategoriesGrid;