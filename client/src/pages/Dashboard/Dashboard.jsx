// /* eslint-disable no-unused-vars */

// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import WalletDashboard from './WalletDashboard';
// import { Menu, X, Home, User, MapPin, CreditCard, Car, Settings, LogOut, Gauge, MessageCircleCode } from 'lucide-react';
// import Overview from './Overview';
// import ProfileUpdate from './ProfileUpdate';
// import DriverProfileUpdate from './DriverProfileUpdate';
// import { useSelector } from 'react-redux';
// import { MdDashboard, MdDriveFileMove, MdHideSource, MdMoney } from 'react-icons/md';
// import DriversList from './DriverList';
// import MyHires from './MyHires';
// import MyHiresClient from './MyHiredDrivers';
// import SubscribeHireOnDemand from './SubscribeHireOnDemand';
// import DriverHireOnDemandSubscription from './DriverHireOnDemandSubscription';
// import HireOnDemandDrivers from './HireOnDemandDrivers';
// import ClientFulltimeHire from './ClientFulltimeHire';
// import PostAtask from "./PostAtask"
// import DriverFulltimeSubscription from './DriverFulltimeSubscription';
// import AvailableTasks from './AvailableTasks';
// import DriverShop from './DriverShop';
// import RentCar from './RentACar';
// import {toast} from "sonner"
// import PostCar from './Postcar';
// import ApplyDriverLicense from './ApplyDriverLicense';
// import ApplyVehicleLicense from './ApplyVehicleLicense';
// import UserTasks from './UserTasks';
// import { logout } from '../../store/slices/userSlice';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import {  useDispatch } from 'react-redux';
// import MyCars from './MyCars';
// import ChatBox from './ChatBox';
// import MapDistance from './MapDistance';
// import ProfileDisplay from './ProfileDisplay';
// import MyRentedCars from './MyRentedCar';
// import ProviderAnnouncements from './DriverAnnouncement';
// // Import other components as needed: import Trips from './Trips'; etc.

// const PRIMARY_500 = '#3B82F6';

// const Dashboard = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [currentView, setCurrentView] = useState('overview');  // Default to Overview
// const [view, setView] = useState('overview'); 
// const [selectedHireForChat, setSelectedHireForChat] = useState(null);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//     const { user } = useSelector((state) => state.user);
//   const userRole = user?.role || 'client'; 


  
//     const handleLogout = () => {
//       dispatch(logout());
//       persistor.purge();
//       setIsOpen(false);
//       navigate('/login');
//     };

//   const sidebarLinks = [
//     { view: 'overview', label: 'Overview', icon: Home },
//    { view: 'drivers', label: 'Hire a Driver', icon: MdDriveFileMove, role: 'client' },
//    { view: 'myhiredrivers', label: 'Hired-Drivers', icon: MdDriveFileMove, role: 'client' },
//    { view: 'driversOnDemand', label: 'Hire on-demand driver', icon: MdDriveFileMove, role: 'client' },
//   // { view: 'map', label: 'check on map', icon: MdDriveFileMove, role: 'client' },
//   //  { view: 'postATask', label: 'Post a task', icon: MdDriveFileMove, role: 'client' },
//    { view: 'drivershop', label: 'Driver shop', icon: MdDashboard, role: 'client' },
//    { view: 'userTasks', label: 'Users Tasks', icon: MdDashboard, role: 'client' },
 
//   //  { view: 'driversfulltime', label: 'Hire full-time driver', icon: MdDriveFileMove, role: 'client' },
 
//    { view: 'hire', label: 'My Hire', icon: MdHideSource, role: 'driver' },
//    { view: 'tasks', label: 'Urgent vacancy needs', icon: MdHideSource, role: 'driver' },
//      { view: 'subscribe', label: 'Subscribe to hire on demand', icon: MapPin, role: 'driver' },
//      { view: 'fulltime', label: 'Subscribe to full time driving', icon: MapPin, role: 'driver' },
//     { view: 'profile', label: 'Profile', icon: User },
//     { view: 'driver-settings', label: 'Driver Profile', icon: Gauge, role: 'driver' },
//     { view: 'rentcar', label: 'Rent a car', icon: Car },
    
//     { view: 'your-rented-car', label: 'Your Rented car', icon: Car },
    
//     // { view: 'chat', label: 'Have a chat', icon: MessageCircleCode },
//     { view: 'mycar', label: 'My Cars', icon: Car },
//     { view: 'postcar', label: 'Rent your car', icon: CreditCard,  },
//     { view: 'vehicleLicense', label: 'Vehicle-license', icon: Car, role: 'driver' },
//     { view: 'driverLicense', label: 'Driver-license', icon: Settings },
//     { view: 'message', label: 'Announcements', icon: MessageCircleCode },
   
//   ];



//   const renderMainContent = () => {
//     switch (currentView) {
//       case 'overview':
//         return <Overview />;
//       case 'profile':
//         return <ProfileUpdate />;
//        case 'driver-settings':
//         return <DriverProfileUpdate />;
//       case 'drivers':
//         return <DriversList/>
//       case 'chat':
//        return <ChatBox 
//       initialSelectedHire={selectedHireForChat}   // ← new prop
//       onBack={() => {
//         setCurrentView('dashboard');              // or your home view
//         setSelectedHireForChat(null);             // clear after back
//       }}
//     />
      
//       case 'userTasks':
//         return <UserTasks/>
      
//  a
//       case 'postATask':
//         return <PostAtask/>
//       case 'hire': 
//       return <MyHires/>
//       case 'fulltime': 
//       return <DriverFulltimeSubscription/>
//       case 'driversOnDemand': 
//         return <HireOnDemandDrivers/>
//       case 'driversfulltime': 
//         return <ClientFulltimeHire/>
//       case 'subscribe': 
//       return <DriverHireOnDemandSubscription/>
//       // return <SubscribeHireOnDemand/>
//       case 'myhiredrivers': 
//       return <MyHiresClient/>
//       case 'your-rented-car': 
//       return <MyRentedCars/>
//       case 'drivershop': 
//       return <DriverShop/>
//       case 'rentcar': 
//       return <RentCar/>
//       case 'postcar':  
//         return <PostCar/>
//       case 'map':  
//         return <MapDistance/>
//       case 'mycar':  
//         return <MyCars/>
//       case 'earnings':
//         return <WalletDashboard walletData={user?.wallet}/>
//       case 'vehicleLicense':
//         return <ApplyVehicleLicense/>
//     case 'driverLicense':
//       return <ApplyDriverLicense />
//     case 'tasks':
//       return <AvailableTasks />
//     case 'message':
//       return <ProviderAnnouncements />
//       default:
//         return <Overview />;
//     }
//   };

//     const visibleLinks = sidebarLinks.filter(link => !link.role || link.role === userRole);

//   return (
//      <div className="flex h-screen bg-gray-50 overflow-hidden">
//       {/* Desktop Sidebar */}

// <aside className="hidden md:flex md:flex-col md:w-64 md:bg-white md:shadow-xl md:h-screen md:fixed md:inset-y-0 md:left-0 md:z-10">
//   <div className="flex flex-col h-full">
//     {/* Fixed Header */}
//     <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
//       <h1 className="text-xl font-bold text-gray-900">edrivers</h1>
//     </div>

//     {/* Scrollable Navigation */}
//     <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
//       {visibleLinks.map((link) => (
//         <button
//           key={link.view}
//           onClick={() => setCurrentView(link.view)}
//           className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
//             currentView === link.view
//               ? 'bg-primary-500 text-white shadow-md'
//               : 'text-gray-700 hover:bg-gray-100 hover:text-primary-500'
//           }`}
//           style={{
//             backgroundColor: currentView === link.view ? PRIMARY_500 : 'transparent',
//           }}
//         >
//           <link.icon className="h-5 w-5" />
//           <span>{link.label}</span>
//         </button>
//       ))}
//     </nav>

//     {/* Fixed Footer (Logout) */}
//     <div className="p-4 border-t border-gray-200 bg-white">
//       <button 
//              onClick={handleLogout}
//       className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//         <LogOut className="h-5 w-5" />
//         <Link to='/login'>
//            <span>Logout</span>
//         </Link>
     
//       </button>
//     </div>
//   </div>
// </aside>
//     {/* Mobile Sidebar */}
// <motion.aside
//   initial={false}
//   animate={{ x: isSidebarOpen ? 0 : -280 }}
//   transition={{ duration: 0.3, ease: 'easeInOut' }}
//   className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl md:hidden flex flex-col"
//   style={{ background: `linear-gradient(to bottom, white, #f8fafc)` }}
// >
//   {/* Fixed Header */}
//   <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
//     <h1 className="text-2xl font-bold text-gray-900">edrivers</h1>
//     <button 
//       onClick={() => setIsSidebarOpen(false)} 
//       className="p-2 rounded-full hover:bg-gray-100 transition"
//     >
//       <X className="h-6 w-6 text-gray-600" />
//     </button>
//   </div>

//   {/* Scrollable Navigation Links */}
//   <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
//     {visibleLinks.map((link) => (
//       <button
//         key={link.view}
//         onClick={() => {
//           setCurrentView(link.view);
//           setIsSidebarOpen(false); // Close after selection
//         }}
//         className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 text-left font-medium ${
//           currentView === link.view
//             ? 'bg-primary-500 text-white shadow-lg'
//             : 'text-gray-700 hover:bg-gray-100 hover:text-primary-500'
//         }`}
//         style={{
//           backgroundColor: currentView === link.view ? PRIMARY_500 : 'transparent',
//         }}
//       >
//         <link.icon className="h-6 w-6 flex-shrink-0" />
//         <span className="text-lg">{link.label}</span>
//       </button>
//     ))}
//   </nav>

//   {/* Fixed Logout at Bottom */}
//   <div className="p-5 border-t border-gray-200 bg-white">
//     <button 
//       onClick={() => {
//         // Your logout logic
//         toast.info('Logging out...');
//       }}
//       className="w-full flex items-center justify-center space-x-4 px-5 py-4 text-left text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
//     >
//       <LogOut className="h-6 w-6" />
//       <span className="text-lg">Logout</span>
//     </button>
//   </div>
// </motion.aside>

// {/* Overlay */}
// {isSidebarOpen && (
//   <motion.div
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     exit={{ opacity: 0 }}
//     onClick={() => setIsSidebarOpen(false)}
//     className="fixed inset-0 bg-black/60 z-40 md:hidden"
//   />
// )}

// {/* Hamburger Button */}
// <button
//   onClick={() => setIsSidebarOpen(true)}
//   className="fixed top-4 left-4 z-60 p-3 bg-white rounded-full shadow-xl md:hidden"
// >
//   <Menu className="h-7 w-7 text-gray-800" />
// </button>
//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
//         <main className="flex-1 overflow-y-auto p-6">
//           {renderMainContent()}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;





/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WalletDashboard from './WalletDashboard';
import { Menu, X, Home, User, MapPin, CreditCard, Car, Settings, LogOut, Gauge, MessageCircleCode } from 'lucide-react';
import Overview from './Overview';
import ProfileUpdate from './ProfileUpdate';
import DriverProfileUpdate from './DriverProfileUpdate';
import { useSelector } from 'react-redux';
import { MdDashboard, MdDriveFileMove, MdHideSource, MdMoney } from 'react-icons/md';
import DriversList from './DriverList';
import MyHires from './MyHires';
import MyHiresClient from './MyHiredDrivers';
import SubscribeHireOnDemand from './SubscribeHireOnDemand';
import DriverHireOnDemandSubscription from './DriverHireOnDemandSubscription';
import HireOnDemandDrivers from './HireOnDemandDrivers';
import ClientFulltimeHire from './ClientFulltimeHire';
import PostAtask from "./PostAtask"
import DriverFulltimeSubscription from './DriverFulltimeSubscription';
import AvailableTasks from './AvailableTasks';
import DriverShop from './DriverShop';
import RentCar from './RentACar';
import {toast} from "sonner"
import PostCar from './Postcar';
import ApplyDriverLicense from './ApplyDriverLicense';
import ApplyVehicleLicense from './ApplyVehicleLicense';
import UserTasks from './UserTasks';
import { logout } from '../../store/slices/userSlice';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {  useDispatch } from 'react-redux';
import MyCars from './MyCars';
import ChatBox from './ChatBox';
import MapDistance from './MapDistance';
import ProfileDisplay from './ProfileDisplay';
import MyRentedCars from './MyRentedCar';
import ProviderAnnouncements from './DriverAnnouncement';
import VehicleManagement from './VehicleManagement';
import TaskManagement from './TaskManagement';
// Import other components as needed: import Trips from './Trips'; etc.

const PRIMARY_500 = '#3B82F6';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState(searchParams.get('tab') || 'overview');  // Default to Overview
const [view, setView] = useState('overview'); 
const [selectedHireForChat, setSelectedHireForChat] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(null)
    const { user } = useSelector((state) => state.user);
  const userRole = user?.role || 'client'; 
const currentTab = searchParams.get('tab') || 'your-rented-car';

useEffect(() => {
    if (currentTab === 'postcar') {
      setActiveTab('postcar');   // ← Change this to your actual state name
    } else if (currentTab === 'your-rented-car') {
      setActiveTab('your-rented-car');
    }
    // Add more tabs as needed
  }, [currentTab]);
  // Updates both local state and the ?tab= query param in the URL
  const handleViewChange = (nextView) => {
    setCurrentView(nextView);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('tab', nextView);
      return params;
    });
  };

  
    const handleLogout = () => {
      dispatch(logout());
      persistor.purge();
      setIsOpen(false);
      navigate('/login');
    };

  const sidebarLinks = [
    { view: 'overview', label: 'Overview', icon: Home },
   { view: 'drivers', label: 'Hire a Driver', icon: MdDriveFileMove, role: 'client' },
   { view: 'myhiredrivers', label: 'Hired-Drivers', icon: MdDriveFileMove, role: 'client' },
   { view: 'driversOnDemand', label: 'Hire on-demand driver', icon: MdDriveFileMove, role: 'client' },
  // { view: 'map', label: 'check on map', icon: MdDriveFileMove, role: 'client' },
   { view: 'task-management', label: 'Task Management', icon: MdDriveFileMove, role: 'client' },
   { view: 'wallet', label: 'Wallet', icon: MdDriveFileMove, role: 'client' },
  //  { view: 'drivershop', label: 'Driver shop', icon: MdDashboard, role: 'client' },
  //  { view: 'userTasks', label: 'Users Tasks', icon: MdDashboard, role: 'client' },
 
  //  { view: 'driversfulltime', label: 'Hire full-time driver', icon: MdDriveFileMove, role: 'client' },
 
   { view: 'hire', label: 'My Hire', icon: MdHideSource, role: 'driver' },
   { view: 'tasks', label: 'Urgent vacancy needs', icon: MdHideSource, role: 'driver' },
     { view: 'subscribe', label: 'Subscribe to hire on demand', icon: MapPin, role: 'driver' },
     { view: 'fulltime', label: 'Subscribe to full time driving', icon: MapPin, role: 'driver' },
        { view: 'wallet', label: 'Wallet', icon: MdDriveFileMove, role: 'driver' },
    { view: 'profile', label: 'Profile', icon: User },
    { view: 'driver-settings', label: 'Driver Profile', icon: Gauge, role: 'driver' },
    { view: 'vehicle-management', label: 'Vehicle Management', icon: Car },
    
  
    
    // { view: 'chat', label: 'Have a chat', icon: MessageCircleCode },
    // { view: 'mycar', label: 'My Cars', icon: Car },
   
    { view: 'vehicleLicense', label: 'Vehicle-license', icon: Car, role: 'driver' },
    { view: 'driverLicense', label: 'Driver-license', icon: Settings },
    { view: 'message', label: 'Announcements', icon: MessageCircleCode },
   
  ];



  const renderMainContent = () => {
    switch (currentView) {
      case 'overview':
        return <Overview />;
      case 'profile':
        return <ProfileUpdate />;
       case 'driver-settings':
        return <DriverProfileUpdate />;
      case 'drivers':
        return <DriversList/>
      case 'chat':
       return <ChatBox 
      initialSelectedHire={selectedHireForChat}   // ← new prop
      onBack={() => {
        handleViewChange('dashboard');              // or your home view
        setSelectedHireForChat(null);             // clear after back
      }}
    />
      
      case 'task-management':
        return <TaskManagement/>

      // case 'postATask':
      //   return <PostAtask/>
      case 'hire': 
      return <MyHires/>
      case 'fulltime': 
      return <DriverFulltimeSubscription/>
      case 'wallet': 
      return <WalletDashboard/>
      case 'driversOnDemand': 
        return <HireOnDemandDrivers/>
      case 'driversfulltime': 
        return <ClientFulltimeHire/>
      case 'subscribe': 
      return <DriverHireOnDemandSubscription/>
      // return <SubscribeHireOnDemand/>
      case 'myhiredrivers': 
      return <MyHiresClient/>
   
      case 'drivershop': 
      return <DriverShop/>

      case 'vehicle-management':  
        return <VehicleManagement/>
      case 'map':  
        return <MapDistance/>
      case 'mycar':  
        return <MyCars/>
      case 'earnings':
        return <WalletDashboard walletData={user?.wallet}/>
      case 'vehicleLicense':
        return <ApplyVehicleLicense/>
    case 'driverLicense':
      return <ApplyDriverLicense />
    case 'tasks':
      return <AvailableTasks />
    case 'message':
      return <ProviderAnnouncements />
      default:
        return <Overview />;
    }
  };

    const visibleLinks = sidebarLinks.filter(link => !link.role || link.role === userRole);

  return (
     <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}

<aside className="hidden md:flex md:flex-col md:w-64 md:bg-white md:shadow-xl md:h-screen md:fixed md:inset-y-0 md:left-0 md:z-10">
  <div className="flex flex-col h-full">
    {/* Fixed Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <h1 className="text-xl font-bold text-gray-900">edrivers</h1>
    </div>

    {/* Scrollable Navigation */}
    <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
      {visibleLinks.map((link) => (
        <button
          key={link.view}
          onClick={() => handleViewChange(link.view)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
            currentView === link.view
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100 hover:text-primary-500'
          }`}
          style={{
            backgroundColor: currentView === link.view ? PRIMARY_500 : 'transparent',
          }}
        >
          <link.icon className="h-5 w-5" />
          <span>{link.label}</span>
        </button>
      ))}
    </nav>

    {/* Fixed Footer (Logout) */}
    <div className="p-4 border-t border-gray-200 bg-white">
      <button 
             onClick={handleLogout}
      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
        <LogOut className="h-5 w-5" />
        <Link to='/login'>
           <span>Logout</span>
        </Link>
     
      </button>
    </div>
  </div>
</aside>
    {/* Mobile Sidebar */}
<motion.aside
  initial={false}
  animate={{ x: isSidebarOpen ? 0 : -280 }}
  transition={{ duration: 0.3, ease: 'easeInOut' }}
  className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl md:hidden flex flex-col"
  style={{ background: `linear-gradient(to bottom, white, #f8fafc)` }}
>
  {/* Fixed Header */}
  <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
    <h1 className="text-2xl font-bold text-gray-900">edrivers</h1>
    <button 
      onClick={() => setIsSidebarOpen(false)} 
      className="p-2 rounded-full hover:bg-gray-100 transition"
    >
      <X className="h-6 w-6 text-gray-600" />
    </button>
  </div>

  {/* Scrollable Navigation Links */}
  <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
    {visibleLinks.map((link) => (
      <button
        key={link.view}
        onClick={() => {
          handleViewChange(link.view);
          setIsSidebarOpen(false); // Close after selection
        }}
        className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 text-left font-medium ${
          currentView === link.view
            ? 'bg-primary-500 text-white shadow-lg'
            : 'text-gray-700 hover:bg-gray-100 hover:text-primary-500'
        }`}
        style={{
          backgroundColor: currentView === link.view ? PRIMARY_500 : 'transparent',
        }}
      >
        <link.icon className="h-6 w-6 flex-shrink-0" />
        <span className="text-lg">{link.label}</span>
      </button>
    ))}
  </nav>

  {/* Fixed Logout at Bottom */}
  <div className="p-5 border-t border-gray-200 bg-white">
    <button 
      onClick={() => {
        // Your logout logic
        toast.info('Logging out...');
      }}
      className="w-full flex items-center justify-center space-x-4 px-5 py-4 text-left text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
    >
      <LogOut className="h-6 w-6" />
      <span className="text-lg">Logout</span>
    </button>
  </div>
</motion.aside>

{/* Overlay */}
{isSidebarOpen && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setIsSidebarOpen(false)}
    className="fixed inset-0 bg-black/60 z-40 md:hidden"
  />
)}

{/* Hamburger Button */}
<button
  onClick={() => setIsSidebarOpen(true)}
  className="fixed top-4 left-4 z-60 p-3 bg-white rounded-full shadow-xl md:hidden"
>
  <Menu className="h-7 w-7 text-gray-800" />
</button>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <main className="flex-1 overflow-y-auto p-6">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;





























