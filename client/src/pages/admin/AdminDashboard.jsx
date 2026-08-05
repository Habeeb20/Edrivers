

/* eslint-disable no-unused-vars */
// src/pages/Admin/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Users, 
  Car, 
  DollarSign, 
  Activity, 
  Shield, 
  Settings, 
  LogOut, 
  TrendingUp, 
  AlertCircle, 
  Video
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { getAdminDashboardAsync, logoutAdmin } from '../../store/slices/adminSlice';
import { useNavigate } from 'react-router-dom';
import UsersManagement from './UserManagement';
import AdminSubscriptions from './AdminSubscription';
import AdminHireOnDemandRequests from './AdminHireOnDemand';
import AdminFulltimeSubscriptions from './AdminFulltimeSubscriptions';
import AdminTasks from './AdminTasks';
import AdminHiredDrivers from './AdminHiredDrivers';
import AdminVetDrivers from './AdminVetDrivers';
import AdminCar from './AdminCars';
import AdminPaidRentals from './AdminPaidRentals';
import AdminVehicleLicenses from './AdminVehicleLicense';
import AdminLicenseApplications from './AdminLicense';
import PendingHireApprovals from "./PendingHireApproval";
import PricingManagement from './PricingManagement';
import { MdDriveFileMove, MdDriveFileMoveRtl } from 'react-icons/md';
import DriverAnalytics from './DriverAnalytics';
import DriverDetails from './DriverDetails';
import DriverActivation from './DriverActivation';
import PricingDistancePage from './DistancePricing';
import SubscriptionPlansAdmin from './AdminSubscriptionPlan';
import AdminTrainingRegistrations from './AdminTraining';
import AdminDriverDetails from './DownloadDriverDetails';
import AnnouncementManager from './AdminAnnouncement';
import PostVideoForm from './VideoUpload';

const PRIMARY = '#9333EA';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('overview');

  const { stats, loading, error } = useSelector((state) => state.admin);

  const adminLinks = [
    { view: 'overview', label: 'Overview', icon: Activity },
    { view: 'users', label: 'Users', icon: Users },
    { view: 'activate-drivers', label: 'Activate Drivers', icon: Users },
    { view: 'downloads', label: 'Download Drivers details', icon: Users },
    { view: 'driverAnalytics', label: 'Driver Analytics', icon: MdDriveFileMoveRtl },
    { view: 'subscribe', label: 'Subscription', icon: Users },
    { view: 'trainees', label: 'Training', icon: Users },
    // { view: 'pendingHire', label: 'Pending Hire', icon: Users },
    { view: 'pricingCategories', label: 'Pricing Categories', icon: Users },
    { view: 'hireOnDemand', label: 'Hire on demand request', icon: Users },
    { view: 'full-time-drivers', label: 'Full time drivers', icon: Users },
    { view: 'tasks', label: 'Task Requests', icon: Car },
    { view: 'hiredDrivers', label: 'Hired-Drivers', icon: DollarSign },
    { view: 'vetDrivers', label: 'Vet Drivers', icon: TrendingUp },
    { view: 'approvecars', label: 'Approve cars', icon: Car },
    { view: 'paidcars', label: 'Cars to be rented', icon: Car },
    { view: 'vehiclelicense', label: 'Vehicle license', icon: Car },
    { view: 'driverlicense', label: 'Driver license', icon: Car },
    { view: 'video', label: 'Video Upload', icon: Video },
    { view: 'message', label: 'Message', icon: Video },
    { view: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    dispatch(getAdminDashboardAsync());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-600">Error: {error}</p>
          <button
            onClick={() => dispatch(getAdminDashboardAsync())}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Admin Overview</h2>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats && Object.entries(stats).map(([key, value], i) => {
                const statConfig = {
                  totalClients: { label: 'Total Clients', icon: Users, change: '+12%' },
                  totalDrivers: { label: 'Total Drivers', icon: Car, change: '+8%' },
                  activeDrivers: { label: 'Active Drivers', icon: Car, change: '+15%' },
                  pendingVerifications: { label: 'Pending Verifications', icon: AlertCircle, change: 'urgent' },
                  totalRevenue: { label: 'Total Revenue', icon: DollarSign, change: '+23%' },
                }[key];

                if (!statConfig) return null;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <statConfig.icon className="h-10 w-10 text-purple-600" />
                      <span className={`text-sm font-semibold ${
                        statConfig.change.includes('+') ? 'text-green-600' : 
                        statConfig.change === 'urgent' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {statConfig.change}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {key === 'totalRevenue' ? `₦${Number(value).toLocaleString()}` : value}
                    </p>
                    <p className="text-gray-600 mt-1">{statConfig.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Placeholder for charts/activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-semibold mb-6">Revenue Trend</h3>
                <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                  Chart coming soon...
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  <p className="text-gray-500">Activity log will appear here...</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'users':
        return <UsersManagement />;
      case 'activate-drivers':
        return <DriverActivation />;
      case 'downloads':
        return <AdminDriverDetails />;
      case 'pricingCategories':
        return <PricingManagement />;
      case 'subscribe':
        return <SubscriptionPlansAdmin />;
      case 'hireOnDemand':
        return <AdminHireOnDemandRequests />;
      case 'full-time-drivers':
        return <AdminFulltimeSubscriptions />;
      case 'tasks':
        return <AdminTasks />;
      case 'trainees':
        return <AdminTrainingRegistrations />;
      case 'pendingHire':
        return <PendingHireApprovals />;
      case 'hiredDrivers':
        return <AdminHiredDrivers />;
      case 'vetDrivers':
        return <AdminVetDrivers />;
      case 'approvecars':
        return <AdminCar />;
      case 'paidcars':
        return <AdminPaidRentals />;
      case 'vehiclelicense':
        return <AdminVehicleLicenses />;
      case 'driverlicense':
        return <AdminLicenseApplications />;
      case 'driverAnalytics':
        return <DriverAnalytics />;
      case 'message':
        return <AnnouncementManager />;
      case 'video':
        return <PostVideoForm />;
      case 'driversDetails':
        return <DriverDetails />;
      default:
        return (
          <div className="text-center py-20">
            <div className="text-6xl text-gray-300 mb-4">🚧</div>
            <h3 className="text-2xl font-semibold text-gray-700">Under Construction</h3>
            <p className="text-gray-600 mt-2">The {currentView} section is coming soon!</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar – FIXED, non-scrolling */}
      <aside 
        className="hidden md:flex md:flex-col md:w-64 bg-gradient-to-b from-purple-700 to-indigo-800 text-white flex-shrink-0"
      >
        <div className="p-6 border-b border-purple-600">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {adminLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => setCurrentView(link.view)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                currentView === link.view
                  ? 'bg-white text-purple-700 shadow-lg font-semibold'
                  : 'hover:bg-purple-700/50'
              }`}
            >
              <link.icon className="h-6 w-6" />
              <span className="font-medium">{link.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-purple-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-purple-700/50 transition-all duration-200"
          >
            <LogOut className="h-6 w-6" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar – Slide-in, scrollable */}
      <motion.aside
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-700 to-indigo-800 text-white md:hidden overflow-y-auto"
      >
        <div className="p-6 border-b border-purple-600 flex justify-between items-center sticky top-0 bg-gradient-to-b from-purple-700 to-indigo-800 z-10">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Admin
          </h1>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {adminLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => {
                setCurrentView(link.view);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                currentView === link.view
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'hover:bg-purple-700/50'
              }`}
            >
              <link.icon className="h-6 w-6" />
              <span className="font-medium">{link.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-purple-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-purple-700/50 transition"
          >
            <LogOut className="h-6 w-6" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-60 p-3 bg-white rounded-xl shadow-lg md:hidden"
      >
        <Menu className="h-6 w-6 text-purple-700" />
      </button>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content – Scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-6 flex items-center justify-between border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 capitalize">
            {adminLinks.find((l) => l.view === currentView)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Super Admin</span>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;