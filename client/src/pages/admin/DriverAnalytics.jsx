

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Users, DollarSign, BarChart3, PieChart, TrendingUp,
  Download, Settings, Search, Filter, Star, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DriverAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commission, setCommission] = useState(30);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverDetails, setShowDriverDetails] = useState(false);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/driver-history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(res.data);
      console.log(res.data)
      console.log('Analytics data loaded:', res.data);
    } catch (err) {
      toast.error('Failed to load driver analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };



// Fetch current saved value when component mounts
useEffect(() => {
  const fetchCommission = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/commission/settings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommission(res.data.settings.driverCommissionPercentage);
      console.log('Loaded commission from DB:', res.data.settings.driverCommissionPercentage);
    } catch (err) {
      console.error('Failed to load commission:', err);
      toast.error('Could not load commission settings');
      setCommission(30); // fallback
    }
  };

  fetchCommission();
}, []);

// Your update function remains almost the same
const updateCommission = async (newPercentage) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/commission/set`,
      { percentage: newPercentage },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setCommission(res.data.percentage); // update local state with DB-confirmed value
    toast.success(res.data.message);
    fetchAnalytics(); // refresh charts/table
  } catch (err) {
    toast.error('Failed to update commission');
    console.error('Commission update error:', err);
  }
};
  const filteredDrivers = analytics?.drivers?.filter(driver => {
    const name = `${driver.driver.firstName} ${driver.driver.lastName}`.toLowerCase();
    const email = driver.driver.email.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  }) || [];
console.log(filteredDrivers)
  // Chart Data
  const earningsChartData = {
    labels: filteredDrivers.slice(0, 10).map(d => `${d.driver.firstName} ${d.driver.lastName.slice(0,1)}.`), // Top 10
    datasets: [{
      label: 'Total Earnings (₦)',
      data: filteredDrivers.slice(0, 10).map(d => d.stats.totalEarnings),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
    }]
  };

  const revenueSplitData = {
    labels: ['Admin Commission', 'Driver Earnings'],
    datasets: [{
      data: [
        analytics?.drivers?.reduce((sum, d) => sum + d.stats.adminCommission, 0) || 0,
        analytics?.drivers?.reduce((sum, d) => sum + d.stats.driverEarnings, 0) || 0,
      ],
      backgroundColor: ['rgba(239, 68, 68, 0.7)', 'rgba(34, 197, 94, 0.7)'],
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, font: { size: 16 } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₦' + value.toLocaleString();
          }
        }
      }
    }
  };

  const openDriverDetails = (driverData) => {
    setSelectedDriver(driverData);
    setShowDriverDetails(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading driver analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Driver Hire Analytics</h1>
            <p className="text-gray-600 mt-2">Complete history of all driver hires and earnings</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCommissionModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
            >
              <Settings className="h-5 w-5" />
              Commission ({commission}%)
            </button>
            <button
              onClick={fetchAnalytics}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
            >
              Refresh Data
            </button>
          </div>
        </motion.div>

        {/* Global Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Drivers</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.summary?.totalDrivers || 0}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Hires</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.summary?.totalHires || 0}</p>
              </div>
              <BarChart3 className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₦{analytics?.summary?.totalEarnings?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="h-12 w-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Admin Commission</p>
                <p className="text-3xl font-bold text-gray-900">₦{analytics?.summary?.totalAdminCommission?.toLocaleString() || 0}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Top Driver Earnings</h3>
            <Bar data={earningsChartData} options={chartOptions} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Revenue Distribution ({commission}% Admin)</h3>
            <Doughnut data={revenueSplitData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8"
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search drivers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => {
                const dataStr = JSON.stringify(analytics, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `driver-analytics-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </motion.div>

        {/* Drivers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Driver Performance Overview</h2>
            <p className="text-gray-600 mt-1">Complete hire history and earnings details</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hires
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Hires
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earnings
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin Commission ({commission}%)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Share
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrivers.map((driverData, index) => (
                  <tr key={driverData.driver._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={driverData.driver.avatar || '/default-avatar.png'}
                          alt={`${driverData.driver.firstName} ${driverData.driver.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {driverData.driver.firstName} {driverData.driver.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {driverData.driver.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {driverData.driver.rating.toFixed(1)} / 5
                        </span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < driverData.driver.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {driverData.stats.totalHires}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {driverData.stats.paidHires}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      ₦{driverData.stats.totalEarnings.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">
                      ₦{driverData.stats?.adminCommission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      ₦{driverData.stats.driverEarnings.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        driverData.driver.currentHireStatus === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {driverData.driver.currentHireStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDriverDetails(driverData)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* No Data State */}
        {filteredDrivers.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Drivers Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No drivers match your search.' : 'No active drivers available.'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Commission Settings Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">Commission Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Commission Percentage
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter percentage (0-100)"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Current setting: {commission}% of driver earnings goes to admin
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Example Calculation:</h4>
                <p className="text-sm text-gray-600">
                  If driver earns ₦100,000:
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Admin Commission: ₦{Math.round(100000 * commission / 100).toLocaleString()}</li>
                  <li>• Driver Share: ₦{(100000 - Math.round(100000 * commission / 100)).toLocaleString()}</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowCommissionModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateCommission(commission);
                  setShowCommissionModal(false);
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Driver Details Modal */}
      {showDriverDetails && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <img
                  src={selectedDriver.driver.avatar || '/default-avatar.png'}
                  alt={`${selectedDriver.driver.firstName} ${selectedDriver.driver.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedDriver.driver.firstName} {selectedDriver.driver.lastName}
                  </h2>
                  <p className="text-gray-600">Complete Hire History</p>
                </div>
              </div>
              <button
                onClick={() => setShowDriverDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Driver Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Info</h3>
                  <p className="text-gray-600"><strong>Email:</strong> {selectedDriver.driver.email}</p>
                  <p className="text-gray-600"><strong>Phone:</strong> {selectedDriver.driver.phone}</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-green-600">{selectedDriver.driver.rating}</span>
                    <span className="text-sm text-gray-500">/ 5</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedDriver.driver.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mt-2">Total Trips: {selectedDriver.driver.totalTrips}</p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Earnings Summary</h3>
                  <p className="text-gray-600"><strong>Total:</strong> ₦{selectedDriver.stats.totalEarnings.toLocaleString()}</p>
                  <p className="text-red-600"><strong>Admin ({commission}%):</strong> ₦{selectedDriver.stats.adminCommission.toLocaleString()}</p>
                  <p className="text-green-600"><strong>Driver:</strong> ₦{selectedDriver.stats.driverEarnings.toLocaleString()}</p>
                </div>
              </div>

              {/* Hire History Table */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Hire History ({selectedDriver.hires.length} records)
                  </h3>
                  <button
                    onClick={() => {
                      const dataStr = JSON.stringify(selectedDriver.hires, null, 2);
                      const blob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `driver-${selectedDriver.driver._id}-hires.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Hires
                  </button>
                </div>
                <div className="overflow-x-auto bg-white rounded-xl shadow border">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount Offered
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          System Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Driver Approved
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin Approved
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Review
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedDriver.hires?.map((hire, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={hire.clientAvatar || '/default-avatar.png'}
                                alt={hire.clientName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {hire.clientName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {hire.clientEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {hire.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {hire.durationHours} hrs
                          </td>
                          <td className="px-6 py-4 text-sm text-green-600 font-medium">
                            ₦{hire.amountOffered?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                            ₦{hire?.systemAmount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              hire.status === 'active' ? 'bg-green-100 text-green-800' :
                              hire.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              hire.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {hire.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              hire.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              hire.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {hire.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              hire.driverApproved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {hire.driverApproved ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              hire.adminApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {hire.adminApproved ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {hire.rating ? `${hire.rating}/5` : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              {hire.review ? (
                                <div>
                                  <p className="font-medium text-sm">{hire.review}</p>
                                  {hire.comment && (
                                    <p className="text-gray-500 text-xs mt-1">{hire.comment}</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">No review</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedDriver.hires.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hire History</h3>
                  <p className="text-gray-500">This driver has no completed hires yet.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDriverDetails(false)}
                className="px-8 py-3 bg-gray-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DriverAnalytics;