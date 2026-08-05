/* eslint-disable no-unused-vars */


















// src/pages/Admin/UsersManagement.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, AlertTriangle, CheckCircle, Eye, Ban, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewType, setViewType] = useState('users'); // 'users' or 'drivers'
  const [loading, setLoading] = useState(false);

  // Get admin token from Redux or localStorage
  const { token } = useSelector((state) => state.admin);
  const adminToken = token || localStorage.getItem('token');

  // Axios config with token
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  };

  useEffect(() => {
    if (!adminToken) {
      toast.error('Authentication missing. Redirecting to login...');
      // Optionally redirect to /admin/login
      return;
    }
    fetchData();
  }, [viewType, adminToken]);

  const fetchData = async () => {
    if (!adminToken) return;

    setLoading(true);
    try {
      const endpoint = viewType === 'users' ? `${import.meta.env.VITE_BACKEND_URL}/api/admin/users` : `${import.meta.env.VITE_BACKEND_URL}/api/admin/drivers`;
      const res = await axios.get(endpoint, axiosConfig);
      if (viewType === 'users') setUsers(res.data.users || res.data.data);
      else setDrivers(res.data.drivers || res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, id) => {
    if (!adminToken) {
      toast.error('Not authenticated');
      return;
    }

    try {
      let endpoint;
      switch (action) {
        case 'blacklist':
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/admin/blacklist/${id}`;
          break;
        case 'unblacklist':
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/admin/unblacklist/${id}`;
          break;
        case 'verify':
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/admin/verify-driver/${id}`;
          break;
        case 'unverify':
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/admin/unverify-driver/${id}`;
          break;
        default:
          return;
      }

      await axios.put(endpoint, {}, axiosConfig);
      toast.success('Action completed successfully');
      fetchData(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const viewDetails = async (id, isDriver = false) => {
    if (!adminToken) return;

    try {
      const endpoint = isDriver ? `${import.meta.env.VITE_BACKEND_URL}/api/admin/drivers/${id}` : `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`;
      const res = await axios.get(endpoint, axiosConfig);
      setSelectedUser(res.data);
    } catch (err) {
      toast.error('Failed to load details');
    }
  };

  const closeDetails = () => setSelectedUser(null);

  const renderTable = (data, isDriver = false) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <tr>
              <th className="p-5 text-left">Name</th>
              <th className="p-5 text-left">Email</th>
              <th className="p-5 text-left">Role</th>
              <th className="p-5 text-left">Status</th>
              <th className="p-5 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition">
                <td className="p-5 font-medium">{`${item.firstName} ${item.lastName}`}</td>
                <td className="p-5">{item.email}</td>
                <td className="p-5">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                    {item.role}
                  </span>
                </td>
                <td className="p-5">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    item.isBlacklisted 
                      ? 'bg-red-100 text-red-700' 
                      : item.isVerified 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.isBlacklisted ? 'Blacklisted' : item.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex gap-3">
                    <button
                      onClick={() => viewDetails(item._id, isDriver)}
                      className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    {!item.isBlacklisted ? (
                      <button
                        onClick={() => handleAction('blacklist', item._id)}
                        className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-md"
                        title="Blacklist"
                      >
                        <Ban className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('unblacklist', item._id)}
                        className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-md"
                        title="Unblacklist"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                    )}

                    {isDriver && !item.isVerified && (
                      <button
                        onClick={() => handleAction('verify', item._id)}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
                        title="Verify Driver"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}

                    {isDriver && item.isVerified && (
                      <button
                        onClick={() => handleAction('unverify', item._id)}
                        className="p-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition shadow-md"
                        title="Unverify Driver"
                      >
                        <AlertTriangle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8 px-4"
    >
      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-4">
          <Users className="h-10 w-10 text-purple-600" />
          Manage {viewType === 'users' ? 'All Users' : 'Drivers'}
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setViewType('users')}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg ${
              viewType === 'users'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setViewType('drivers')}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg ${
              viewType === 'drivers'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Drivers Only
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-xl text-gray-600">Loading data...</p>
        </div>
      ) : (
        renderTable(viewType === 'users' ? users : drivers, viewType === 'drivers')
      )}

      {/* Details Modal */}
      {selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeDetails}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-bold mb-8 text-center text-purple-700">
              {selectedUser.driver?.role || selectedUser.user?.role} Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold mb-4">Basic Info</h4>
                <div className="space-y-3">
                  <p><strong>Name:</strong> {selectedUser.driver?.firstName || selectedUser.user?.firstName} {selectedUser.driver?.lastName || selectedUser.user?.lastName}</p>
                  <p><strong>Email:</strong> {selectedUser.driver?.email || selectedUser.user?.email}</p>
                  <p><strong>Phone:</strong> {selectedUser.driver?.phone || selectedUser.user?.phone || 'N/A'}</p>
                  <p><strong>Role:</strong> <span className="capitalize font-bold">{selectedUser.driver?.role || selectedUser.user?.role}</span></p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm ${selectedUser.driver?.isBlacklisted || selectedUser.user?.isBlacklisted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {selectedUser.driver?.isBlacklisted || selectedUser.user?.isBlacklisted ? 'Blacklisted' : 'Active'}
                    </span>
                  </p>
                  {selectedUser.driver?.isVerified !== undefined && (
                    <p><strong>Verification:</strong> 
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm ${selectedUser.driver.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {selectedUser.driver.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {selectedUser.profile && (
                <div>
                  <h4 className="text-xl font-semibold mb-4">Driver Professional Profile</h4>
                  <div className="space-y-3 text-sm">
                    <p><strong>Categories:</strong> {selectedUser.profile.categories.join(', ')}</p>
                    <p><strong>Expected Earnings:</strong> ${selectedUser.profile.expectedEarnings.min} – ${selectedUser.profile.expectedEarnings.max} ({selectedUser.profile.expectedEarnings.currency})</p>
                    <p><strong>Experience:</strong> {selectedUser.profile.yearsOfExperience} years</p>
                    <p><strong>Transmission:</strong> {selectedUser.profile.transmission.join(', ')}</p>
                    <p><strong>Languages:</strong> {selectedUser.profile.languagesSpoken.join(', ')}</p>
                    <p><strong>Interstate Travel:</strong> {selectedUser.profile.travelCapabilities.interstate ? 'Yes' : 'No'}</p>
                    <p><strong>International Travel:</strong> {selectedUser.profile.travelCapabilities.international ? 'Yes' : 'No'}</p>
                    {selectedUser.profile.bio && <p><strong>Bio:</strong> {selectedUser.profile.bio}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={closeDetails}
                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UsersManagement;