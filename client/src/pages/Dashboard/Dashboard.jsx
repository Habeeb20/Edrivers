
















/* eslint-disable no-unused-vars */
import {
  Home,
  UserPlus,
  Users,
  Zap,
  ClipboardList,
  Wallet,
  Briefcase,
  AlertTriangle,
  MapPin,
  Calendar,
  Gauge,
  FileText,
  User,
  Car,
  IdCard,
  Bell,
  ChevronDown,
  ShieldCheck,
  Award,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import WalletDashboard from './WalletDashboard';
import { Menu, X, CreditCard, Settings, LogOut, MessageCircleCode } from 'lucide-react';
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
import { toast } from "sonner"
import PostCar from './Postcar';
import ApplyDriverLicense from './ApplyDriverLicense';
import ApplyVehicleLicense from './ApplyVehicleLicense';
import UserTasks from './UserTasks';
import { logout } from '../../store/slices/userSlice';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import MyCars from './MyCars';
import ChatBox from './ChatBox';
import MapDistance from './MapDistance';
import ProfileDisplay from './ProfileDisplay';
import MyRentedCars from './MyRentedCar';
import ProviderAnnouncements from './DriverAnnouncement';
import VehicleManagement from './VehicleManagement';
import TaskManagement from './TaskManagement';
import ReferralPointsCard from '../ReferralPointsCard';
// Import other components as needed: import Trips from './Trips'; etc.

const PRIMARY_500 = '#3B82F6';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState(searchParams.get('tab') || 'overview');  // Default to Overview
  const [view, setView] = useState('overview');
  const [selectedHireForChat, setSelectedHireForChat] = useState(null);
  const [isHireMenuOpen, setIsHireMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
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

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-expand the Hire submenu whenever the active view lives inside it
  useEffect(() => {
    if (['drivers', 'myhiredrivers', 'driversOnDemand'].includes(currentView)) {
      setIsHireMenuOpen(true);
    }
  }, [currentView]);

  // Updates both local state and the ?tab= query param in the URL
  const handleViewChange = (nextView) => {
    setCurrentView(nextView);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('tab', nextView);
      return params;
    });
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());

    setIsSidebarOpen(false);
    navigate('/login');
  };

  // Top-level sidebar links (the client hire options now live in the "Hire" dropdown below)
  const sidebarLinks = [
    // Common
    { view: 'overview', label: 'Overview', icon: Home },

    // Client links
    { view: 'task-management', label: 'Task Management', icon: ClipboardList, role: 'client' },

    // Driver links
    { view: 'hire', label: 'My Hire', icon: Briefcase, role: 'driver' },
    { view: 'tasks', label: 'Urgent vacancy', icon: AlertTriangle, role: 'driver' },

    // Shared
    { view: 'vehicle-management', label: 'Vehicle Management', icon: Car },
    { view: 'vehicleLicense', label: 'Vehicle-license', icon: FileText, role: 'driver' },
    { view: 'driverLicense', label: 'Driver-license', icon: IdCard },
    { view: 'message', label: 'Announcements', icon: Bell },
  ];

  // Sub-links nested under the "Hire" dropdown (client only)
  const hireSubLinks = [
    { view: 'drivers', label: 'Hire a Driver', icon: UserPlus },
    { view: 'myhiredrivers', label: 'Hired-Drivers', icon: Users },
    { view: 'driversOnDemand', label: 'Hire on-demand driver', icon: Zap },
  ];

  // Links that live in the top-right user icon dropdown
  const userMenuLinks = [
    { view: 'profile', label: 'Profile', icon: User },
    // { view: 'verification', label: 'Verification', icon: ShieldCheck },
    { view: 'loyalties', label: 'Loyalties', icon: Award },
    { view: 'wallet', label: 'Wallet', icon: Wallet },
    { view: 'subscribe', label: 'Subscribe to hire on demand', icon: MapPin, role: 'driver' },
    { view: 'fulltime', label: 'Subscribe to full time driving', icon: Calendar, role: 'driver' },
    { view: 'driver-settings', label: 'Driver Profile', icon: Gauge, role: 'driver' },
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
        return <DriversList />
      case 'chat':
        return <ChatBox
          initialSelectedHire={selectedHireForChat}   // ← new prop
          onBack={() => {
            handleViewChange('dashboard');              // or your home view
            setSelectedHireForChat(null);             // clear after back
          }}
        />

      case 'task-management':
        return <TaskManagement />

      // case 'postATask':
      //   return <PostAtask/>
      case 'hire':
        return <MyHires />
      case 'fulltime':
        return <DriverFulltimeSubscription />
      case 'wallet':
        return <WalletDashboard />
      case 'driversOnDemand':
        return <HireOnDemandDrivers />
      case 'driversfulltime':
        return <ClientFulltimeHire />
      case 'subscribe':
        return <DriverHireOnDemandSubscription />
      // return <SubscribeHireOnDemand/>
      case 'myhiredrivers':
        return <MyHiresClient />

      case 'drivershop':
        return <DriverShop />

      case 'vehicle-management':
        return <VehicleManagement />
      case 'map':
        return <MapDistance />
      case 'mycar':
        return <MyCars />
      case 'earnings':
        return <WalletDashboard walletData={user?.wallet} />
      case 'vehicleLicense':
        return <ApplyVehicleLicense />
      case 'driverLicense':
        return <ApplyDriverLicense />
      case 'tasks':
        return <AvailableTasks />
      case 'message':
        return <ProviderAnnouncements />
      case 'verification':
        return (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            Verification page coming soon.
          </div>
        );
      case 'loyalties':
        return (
        <ReferralPointsCard />
        );
      default:
        return <Overview />;
    }
  };

  const visibleLinks = sidebarLinks.filter(link => !link.role || link.role === userRole);
  const visibleUserMenuLinks = userMenuLinks.filter(link => !link.role || link.role === userRole);
  const isHireViewActive = ['drivers', 'myhiredrivers', 'driversOnDemand'].includes(currentView);

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
            {/* Overview always first */}
            {visibleLinks
              .filter((link) => link.view === 'overview')
              .map((link) => (
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

            {/* Hire dropdown (client only) */}
            {userRole === 'client' && (
              <div>
                <button
                  onClick={() => setIsHireMenuOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    isHireViewActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary-500'
                  }`}
                  style={{
                    backgroundColor: isHireViewActive ? PRIMARY_500 : 'transparent',
                  }}
                >
                  <span className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5" />
                    <span>Hire</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isHireMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: isHireMenuOpen ? 'auto' : 0,
                    opacity: isHireMenuOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-100 ml-5">
                    {hireSubLinks.map((sub) => (
                      <button
                        key={sub.view}
                        onClick={() => handleViewChange(sub.view)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left text-sm ${
                          currentView === sub.view
                            ? 'bg-primary-50 text-primary-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-primary-500'
                        }`}
                        style={{
                          color: currentView === sub.view ? PRIMARY_500 : undefined,
                        }}
                      >
                        <sub.icon className="h-4 w-4" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Remaining links */}
            {visibleLinks
              .filter((link) => link.view !== 'overview')
              .map((link) => (
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
              <span>Logout</span>
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
          {visibleLinks
            .filter((link) => link.view === 'overview')
            .map((link) => (
              <button
                key={link.view}
                onClick={() => {
                  handleViewChange(link.view);
                  setIsSidebarOpen(false);
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

          {/* Hire dropdown (client only) */}
          {userRole === 'client' && (
            <div>
              <button
                onClick={() => setIsHireMenuOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 text-left font-medium ${
                  isHireViewActive
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-500'
                }`}
                style={{
                  backgroundColor: isHireViewActive ? PRIMARY_500 : 'transparent',
                }}
              >
                <span className="flex items-center space-x-4">
                  <Briefcase className="h-6 w-6 flex-shrink-0" />
                  <span className="text-lg">Hire</span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isHireMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: isHireMenuOpen ? 'auto' : 0,
                  opacity: isHireMenuOpen ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pl-5 mt-1 space-y-1 border-l-2 border-gray-100 ml-6">
                  {hireSubLinks.map((sub) => (
                    <button
                      key={sub.view}
                      onClick={() => {
                        handleViewChange(sub.view);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                        currentView === sub.view
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-primary-500'
                      }`}
                      style={{
                        color: currentView === sub.view ? PRIMARY_500 : undefined,
                      }}
                    >
                      <sub.icon className="h-5 w-5" />
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Remaining links */}
          {visibleLinks
            .filter((link) => link.view !== 'overview')
            .map((link) => (
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
              handleLogout();
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
        className="fixed top-4 left-4 z-60 p-3  mt-10 bg-white rounded-full shadow-xl md:hidden"
      >
        <Menu className="h-7 w-7 text-gray-800" />
      </button>

      {/* Top-right User Icon Dropdown */}
      <div ref={userMenuRef} className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          className="flex items-center space-x-1.5 pl-1 pr-2.5 h-11 rounded-full bg-white shadow-xl border border-gray-100 hover:shadow-2xl transition"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="User"
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100">
              <User className="h-5 w-5 text-gray-700" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isUserMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <motion.div
          initial={false}
          animate={{
            opacity: isUserMenuOpen ? 1 : 0,
            y: isUserMenuOpen ? 0 : -8,
            pointerEvents: isUserMenuOpen ? 'auto' : 'none',
          }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || user?.fullName || 'My Account'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <div className="py-2">
            {visibleUserMenuLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => handleViewChange(link.view)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  currentView === link.view
                    ? 'text-primary-600 bg-primary-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={{
                  color: currentView === link.view ? PRIMARY_500 : undefined,
                }}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>
      </div>

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