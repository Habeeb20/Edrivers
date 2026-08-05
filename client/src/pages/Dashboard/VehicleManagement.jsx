// // src/pages/VehicleManagement.jsx
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Car, ListChecks, KeyRound } from 'lucide-react';
// import PostCar from './Postcar';
// import MyRentedCars from './MyRentedCar';
// import RentCar from './RentACar';


// const TABS = [
//   { id: 'post', label: 'Post a Car', shortLabel: 'Post', icon: Car },
//   { id: 'rent', label: 'Rent a Car', shortLabel: 'Rent', icon: KeyRound },
//   { id: 'myRentals', label: 'My Rented Cars', shortLabel: 'My Rentals', icon: ListChecks },
// ];

// const VehicleManagement = () => {
//   const [activeTab, setActiveTab] = useState('rent');

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Tab bar */}
//       <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-6xl mx-auto px-2 sm:px-4">
//           <nav className="flex">
//             {TABS.map((tab) => {
//               const Icon = tab.icon;
//               const isActive = activeTab === tab.id;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex-1 sm:flex-none flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2
//                     px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all border-b-4
//                     ${isActive
//                       ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
//                 >
//                   <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
//                   {/* Short label on mobile, full label on larger screens */}
//                   <span className="sm:hidden">{tab.shortLabel}</span>
//                   <span className="hidden sm:inline">{tab.label}</span>
//                 </button>
//               );
//             })}
//           </nav>
//         </div>
//       </div>

//       {/* Tab content */}
//       <motion.div
//         key={activeTab}
//         initial={{ opacity: 0, y: 8 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.25 }}
//       >
//         {activeTab === 'post' && <PostCar />}
//         {activeTab === 'rent' && <RentCar />}
//         {activeTab === 'myRentals' && <MyRentedCars />}
//       </motion.div>
//     </div>
//   );
// };

// export default VehicleManagement;


// src/pages/VehicleManagement.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, ListChecks, KeyRound } from 'lucide-react';
import PostCar from './Postcar';
import MyRentedCars from './MyRentedCar';
import RentCar from './RentACar';


const TABS = [
  { id: 'post', label: 'Post a Car', shortLabel: 'Post', icon: Car },
  { id: 'rent', label: 'Rent a Car', shortLabel: 'Rent', icon: KeyRound },
  { id: 'myRentals', label: 'My Rented Cars', shortLabel: 'My Rentals', icon: ListChecks },
];

const VehicleManagement = () => {
  const [activeTab, setActiveTab] = useState('rent');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab bar — scrolls with the page, no longer pinned to the top */}
      <div className="bg-white border-b border-gray-200 shadow-sm rounded-t-lg">
        <div className="max-w-6xl mx-auto mt-9 px-2 sm:px-4">
          <nav className="flex">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2
                    px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all border-b-4
                    ${isActive
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                  {/* Short label on mobile, full label on larger screens */}
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === 'post' && <PostCar />}
        {activeTab === 'rent' && <RentCar />}
        {activeTab === 'myRentals' && <MyRentedCars />}
      </motion.div>
    </div>
  );
};

export default VehicleManagement;