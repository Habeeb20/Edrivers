// src/pages/Client/VettedDriversList.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star, MapPin, Car, ShieldCheck, Users, Briefcase, Languages,
  AlertCircle, Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const VettedDriversList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    fetchVettedDrivers();
  }, []);

  const fetchVettedDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/vetted-drivers`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (res.data.success) {
        setDrivers(res.data.data || []);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load vetted drivers';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchVettedDrivers}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <ShieldCheck className="h-10 w-10 text-indigo-600" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Vetted & Certified Drivers
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional, verified, and background-checked drivers — exclusively for DriverShop members
          </p>
        </motion.div>

        {drivers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <ShieldCheck className="h-20 w-20 text-indigo-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No certified drivers available yet
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our vetted driver pool is growing daily. Check back soon!
            </p>
            <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-lg font-medium">
              Refresh List
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {drivers.map((driver) => (
              <motion.div
                key={driver._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:border-indigo-200 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedDriver(driver)}
              >
                {/* Header with avatar & badge */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-600 to-purple-600">
                  <img
                    src={driver.avatar || '/default-driver.jpg'}
                    alt={`${driver.firstName} ${driver.lastName}`}
                    className="w-32 h-32 rounded-full border-4 border-white absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 object-cover shadow-2xl"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-700 flex items-center gap-1 shadow">
                    <ShieldCheck size={14} /> Certified
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-20 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {driver.firstName} {driver.lastName}
                  </h3>

                  <div className="flex justify-center items-center gap-1 text-yellow-500 mb-4">
                    <Star className="fill-current" size={20} />
                    <span className="font-semibold text-lg">{driver.rating?.toFixed(1) || '5.0'}</span>
                    <span className="text-gray-500 text-sm">({driver.totalTrips || 0} trips)</span>
                  </div>

                  <div className="space-y-3 text-gray-700 mb-6">
                    <p className="flex items-center justify-center gap-2">
                      <MapPin size={18} className="text-indigo-600" />
                      {driver.location?.city || 'Lagos'}
                    </p>

                    {driver.vehicle && (
                      <p className="flex items-center justify-center gap-2">
                        <Car size={18} className="text-indigo-600" />
                        {driver.vehicle.make} {driver.vehicle.model} • {driver.vehicle.year}
                      </p>
                    )}

                    {driver.driverProfile?.categories?.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {driver.driverProfile.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat}
                            className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                          >
                            {cat.replace(/-/g, ' ')}
                          </span>
                        ))}
                        {driver.driverProfile.categories.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{driver.driverProfile.categories.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:brightness-105 transition">
                    View Profile & Hire
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Driver Details Modal (optional – can expand later) */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-4 right-4 p-3 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-10">
              <img
                src={selectedDriver.avatar || '/default-driver.jpg'}
                alt=""
                className="w-32 h-32 rounded-full mx-auto border-4 border-indigo-100 shadow-xl"
              />
              <h2 className="text-3xl font-bold mt-6">
                {selectedDriver.firstName} {selectedDriver.lastName}
              </h2>
              <div className="flex justify-center items-center gap-2 mt-2">
                <ShieldCheck className="text-green-600" size={20} />
                <span className="text-green-600 font-medium">Certified Driver</span>
              </div>
            </div>

            {/* Add more detailed profile view here later */}
          </div>
        </div>
      )}
    </div>
  );
};

export default VettedDriversList;