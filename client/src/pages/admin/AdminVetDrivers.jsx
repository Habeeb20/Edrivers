// src/pages/Admin/AdminCertifiedDrivers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ShieldCheck, ShieldOff, Loader2, RefreshCw, Star, Eye,
  User, Phone, Mail, MapPin, Car, Award, X
} from 'lucide-react';
import { Briefcase } from 'lucide-react';
const AdminCertifiedDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [viewModal, setViewModal] = useState({ open: false, driver: null });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/vetted-drivers/full-details`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        }
      );
      setDrivers(res.data.drivers || []);
      console.log(res.data.drivers)
    } catch (err) {
      toast.error('Failed to load drivers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCertification = async (driverId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'certify' : 'uncertify';

    if (!window.confirm(`Are you sure you want to ${action} this driver?`)) return;

    setActionLoading((prev) => ({ ...prev, [driverId]: true }));

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/vetted-drivers/${driverId}/certification`,
        { isCertified: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );

      toast.success(`successfully done`);
      // toast.success(`Driver ${action}ied successfully`);
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [driverId]: false }));
    }
  };

  const openDetails = (driver) => {
    setViewModal({ open: true, driver });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading certified drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Certified Drivers Management
          </h1>
          <button
            onClick={fetchDrivers}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
          >
            <RefreshCw size={18} /> Refresh List
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Vehicle
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Rating / Trips
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certified
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={driver.avatar || '/default-avatar.jpg'}
                          alt=""
                          className="h-12 w-12 rounded-full object-cover mr-4 border-2 border-gray-200 shadow-sm"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {driver.firstName} {driver.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Joined {new Date(driver.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                      {driver.phone || '—'}<br />
                      {driver.email}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                      {driver.vehicle ? (
                        <>
                          {driver.vehicle.make} {driver.vehicle.model}<br />
                          <span className="text-xs">{driver.vehicle.licensePlate}</span>
                        </>
                      ) : (
                        'No vehicle'
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        {driver.rating?.toFixed(1) || '—'} ({driver.totalTrips || 0} trips)
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      {driver.isCertified ? (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
                          <ShieldCheck size={16} className="mr-1.5" /> Certified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 shadow-sm">
                          Not Certified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openDetails(driver)}
                          className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => toggleCertification(driver._id, driver.isCertified)}
                          disabled={actionLoading[driver._id]}
                          className={`px-5 py-2 rounded-lg text-white font-medium transition flex items-center gap-2 min-w-[110px] justify-center ${
                            driver.isCertified
                              ? 'bg-green-600 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-700'
                          } disabled:opacity-70`}
                        >
                          {actionLoading[driver._id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : driver.isCertified ? (
                            <>
                              <ShieldCheck size={16} /> Certified
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={16} /> Certify
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {viewModal.open && viewModal.driver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => setViewModal({ open: false, driver: null })}
              className="absolute top-5 right-5 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition z-10"
            >
              <X size={24} className="text-gray-700" />
            </button>

            <div className="p-6 sm:p-10">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
                <img
                  src={viewModal.driver.avatar || '/default-avatar.jpg'}
                  alt=""
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-indigo-100 shadow-xl"
                />
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    {viewModal.driver.firstName} {viewModal.driver.lastName}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      <ShieldCheck size={16} className="mr-1.5" /> Certified Driver
                    </div>
                    <div className="inline-flex items-center gap-1 text-yellow-600">
                      <Star className="fill-current" size={18} />
                      <span className="font-semibold">{viewModal.driver.rating?.toFixed(1) || '5.0'}</span>
                      <span className="text-gray-500">({viewModal.driver.totalTrips || 0} trips)</span>
                    </div>
                  </div>
                  <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                    <MapPin size={18} /> {viewModal.driver.location?.city || 'Location not specified'}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Personal Info */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User className="h-6 w-6 text-indigo-600" /> Personal Info
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Phone:</strong> {viewModal.driver.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {viewModal.driver.email}</p>
                    <p><strong>Joined:</strong> {new Date(viewModal.driver.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Car className="h-6 w-6 text-blue-600" /> Vehicle
                  </h3>
                  {viewModal.driver.vehicle ? (
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Make/Model:</strong> {viewModal.driver.vehicle.make} {viewModal.driver.vehicle.model}</p>
                      <p><strong>Year:</strong> {viewModal.driver.vehicle.year}</p>
                      <p><strong>Color:</strong> {viewModal.driver.vehicle.color}</p>
                      <p><strong>Plate:</strong> {viewModal.driver.vehicle.licensePlate}</p>
                      <p><strong>Capacity:</strong> {viewModal.driver.vehicle.capacity} passengers</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No vehicle information</p>
                  )}
                </div>

                {/* Certification & Stats */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="h-6 w-6 text-green-600" /> Certification
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 font-semibold ${viewModal.driver.isCertified ? 'text-green-600' : 'text-gray-600'}`}>
                        {viewModal.driver.isCertified ? 'Certified' : 'Not Certified'}
                      </span>
                    </p>
                    <p><strong>Trips Completed:</strong> {viewModal.driver.totalTrips || 0}</p>
                    <p><strong>Rating:</strong> {viewModal.driver.rating?.toFixed(1) || 'N/A'}</p>
                  </div>
                </div>

                {/* Driver Profile (if exists) */}
                {viewModal.driver.driverProfile && (
                  <div className="md:col-span-2 lg:col-span-3 bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Briefcase className="h-6 w-6 text-purple-600" /> Driver Profile
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
                      <div>
                        <p><strong>Experience:</strong> {viewModal.driver.driverProfile.yearsOfExperience} years</p>
                        <p><strong>Availability:</strong> {viewModal.driver.driverProfile.isAvailable ? 'Available' : 'Unavailable'}</p>
                        {viewModal.driver.driverProfile.categories?.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium">Categories:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {viewModal.driver.driverProfile.categories.map((cat) => (
                                <span
                                  key={cat}
                                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                                >
                                  {cat.replace(/-/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        {viewModal.driver.driverProfile.languagesSpoken?.length > 0 && (
                          <p><strong>Languages:</strong> {viewModal.driver.driverProfile.languagesSpoken.join(', ')}</p>
                        )}
                        <p><strong>Transmission:</strong> {viewModal.driver.driverProfile.transmission?.join(', ') || 'N/A'}</p>
                      </div>
                    </div>
                    {viewModal.driver.driverProfile.bio && (
                      <div className="mt-6">
                        <p className="font-medium">Bio:</p>
                        <p className="text-gray-600 mt-2 whitespace-pre-line">{viewModal.driver.driverProfile.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertifiedDrivers;