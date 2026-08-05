// src/pages/Client/ClientFulltimeHire.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Star, MapPin, Clock, Home, Shield, DollarSign, Users, Calendar, Gauge, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const PACKAGE_AMOUNTS = {
  premium: 1000000, // ₦10,000 in kobo
  gold: 1500000,
  classic: 800000,
  chauffeur: 1200000,
};

const ClientFulltimeHire = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    carMaker: '',
    carModel: '',
    carTransmission: 'automatic',
    officeAddress: '',
    homeAddress: '',
    startTime: '',
    closeTime: '',
    insurancePolicy: 'comprehensive',
    hirePurpose: 'personal',
    accommodation: false,
    numberOfDrivers: 1,
    location: '',
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/fulltime-hire/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(res.data.drivers || []);
    } catch (err) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleHire = async () => {
    const required = ['carMaker', 'carModel', 'officeAddress', 'homeAddress', 'startTime', 'closeTime', 'location'];
    if (required.some(f => !form[f])) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const amount = PACKAGE_AMOUNTS[selectedDriver.fulltimeHire.package];
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/fulltime-hire/hire`,
        {
          driverId: selectedDriver._id,
          ...form,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.location.href = res.data.authorization_url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start hire');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Hire a Fulltime Driver
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Get a dedicated professional driver for daily or monthly use
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : drivers.length === 0 ? (
          <p className="text-center text-2xl text-gray-600 py-20">No fulltime drivers available yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {drivers.map(driver => (
              <motion.div
                key={driver._id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-600 relative">
                  <img
                    src={driver.avatar || '/default-avatar.jpg'}
                    alt=""
                    className="w-32 h-32 rounded-full border-8 border-white absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 object-cover"
                  />
                </div>
                <div className="pt-20 px-6 pb-8 text-center">
                  <h3 className="text-2xl font-bold">{driver.firstName} {driver.lastName}</h3>
                  <p className="text-purple-600 font-semibold mt-2 capitalize">
                    {driver.fulltimeHire.package} Package
                  </p>
                  <p className="text-3xl font-bold mt-4">
                    ₦{(PACKAGE_AMOUNTS[driver.fulltimeHire.package] / 100).toLocaleString()}
                    {/* ₦{(PACKAGE_AMOUNTS[driver.fulltimeHire.package] / 100000).toLocaleString()} */}
                  </p>
                  <p className="text-gray-600">Monthly</p>

                  <button
                    onClick={() => {
                      setSelectedDriver(driver);
                      setShowModal(true);
                    }}
                    className="mt-8 w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition"
                  >
                    Hire This Driver
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Hire Modal */}
      {showModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">
                Hire {selectedDriver.firstName} ({selectedDriver.fulltimeHire.package.toUpperCase()})
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="h-8 w-8 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Car Details */}
              <div>
                <label className="block text-lg font-semibold mb-2">Car Maker</label>
                <input
                  type="text"
                  value={form.carMaker}
                  onChange={e => setForm({ ...form, carMaker: e.target.value })}
                  className="w-full p-4 border rounded-xl"
                  placeholder="Toyota"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2">Car Model</label>
                <input
                  type="text"
                  value={form.carModel}
                  onChange={e => setForm({ ...form, carModel: e.target.value })}
                  className="w-full p-4 border rounded-xl"
                  placeholder="Camry"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2">Transmission</label>
                <select
                  value={form.carTransmission}
                  onChange={e => setForm({ ...form, carTransmission: e.target.value })}
                  className="w-full p-4 border rounded-xl"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="both">Both</option>
                </select>
              </div>

              {/* Addresses */}
              <div className="md:col-span-2">
                <label className="block text-lg font-semibold mb-2">Office Address</label>
                <input
                  type="text"
                  value={form.officeAddress}
                  onChange={e => setForm({ ...form, officeAddress: e.target.value })}
                  className="w-full p-4 border rounded-xl"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-lg font-semibold mb-2">Home Address</label>
                <input
                  type="text"
                  value={form.homeAddress}
                  onChange={e => setForm({ ...form, homeAddress: e.target.value })}
                  className="w-full p-4 border rounded-xl"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-lg font-semibold mb-2">Start Time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  className="w-full p-4 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2">Close Time</label>
                <input
                  type="time"
                  value={form.closeTime}
                  onChange={e => setForm({ ...form, closeTime: e.target.value })}
                  className="w-full p-4 border rounded-xl"
                />
              </div>

              {/* Insurance & Purpose */}
              <div>
                <label className="block text-lg font-semibold mb-2">Insurance Policy</label>
                <select
                  value={form.insurancePolicy}
                  onChange={e => setForm({ ...form, insurancePolicy: e.target.value })}
                  className="w-full p-4 border rounded-xl"
                >
                  <option value="comprehensive">Comprehensive</option>
                  <option value="third-party">Third Party</option>
                </select>
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2">Hire Purpose</label>
                <select
                  value={form.hirePurpose}
                  onChange={e => setForm({ ...form, hirePurpose: e.target.value })}
                  className="w-full p-4 border rounded-xl"
                >
                  <option value="personal">Personal</option>
                  <option value="commercial">Commercial</option>
                  <option value="interstate">Interstate</option>
                  <option value="school-bus">School Bus</option>
                </select>
              </div>

              {/* Accommodation & Number */}
              <div>
                <label className="block text-lg font-semibold mb-2">Accommodation</label>
                <select
                  value={form.accommodation}
                  onChange={e => setForm({ ...form, accommodation: e.target.value === 'true' })}
                  className="w-full p-4 border rounded-xl"
                >
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2">Number of Drivers</label>
                <input
                  type="number"
                  min="1"
                  value={form.numberOfDrivers}
                  onChange={e => setForm({ ...form, numberOfDrivers: parseInt(e.target.value) || 1 })}
                  className="w-full p-4 border rounded-xl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-lg font-semibold mb-2">Location (City/State)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full p-4 border rounded-xl"
                  placeholder="Lagos, Nigeria"
                />
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-3xl font-bold mb-4">
                Total: ₦{(PACKAGE_AMOUNTS[selectedDriver.fulltimeHire.package] / 100).toLocaleString()}
              </p>
              <button
                onClick={handleHire}
                className="px-16 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition"
              >
                Pay & Hire Driver
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClientFulltimeHire;