





// src/pages/Client/DriverShop.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Star, DollarSign, Users, Loader2, AlertTriangle, Car } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const DriverShop = () => {
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionAmount, setSubscriptionAmount] = useState(null);
  const [vettedDrivers, setVettedDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  useEffect(() => {
    if (subscribed) fetchVettedDrivers();
  }, [subscribed]);

  const checkSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver-shop/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubscribed(res.data.subscribed);
      setSubscriptionAmount(res.data.amount || 6000); // fallback if not returned
    } catch (err) {
      setError('Failed to check subscription status');
      toast.error('Could not verify your Driver Shop status');
    } finally {
      setLoading(false);
    }
  };

  const fetchVettedDrivers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver-shop/vetted-drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVettedDrivers(res.data.drivers || []);
    } catch (err) {
      console.log(err)
      toast.error('Failed to load vetted drivers');
    }
  };

  const handleSubscribe = async () => {
    if (subscribing) return;
    setSubscribing(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/driver-shop/subscribe`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start subscription');
    } finally {
      setSubscribing(false);
    }
  };

  const handleHireClick = (driver) => {
    setSelectedDriver(driver);
    setShowHireModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!subscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto py-12 px-6"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Unlock the Driver Shop
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Get exclusive access to our vetted, trusted, and professional drivers for a one-time fee of ₦{subscriptionAmount?.toLocaleString() || '6,000'}.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: Shield, color: 'blue', title: 'Verified Drivers', desc: 'Admin-approved professionals with proven records' },
            { icon: Star, color: 'yellow', title: 'Elite Selection', desc: 'Only top-rated drivers make it to the shop' },
            { icon: Users, color: 'green', title: 'Easy & Direct Hiring', desc: 'Contact and hire with one click' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <item.icon className={`h-12 w-12 text-${item.color}-600 mb-6 mx-auto`} />
              <h3 className="text-2xl font-bold text-center mb-4">{item.title}</h3>
              <p className="text-gray-600 text-center">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => setShowSubscribeModal(true)}
          className="w-full md:w-auto px-12 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all mx-auto block"
        >
          Subscribe Now – ₦{subscriptionAmount?.toLocaleString() || '6,000'}
        </button>

        {/* Subscribe Confirmation Modal */}
        {showSubscribeModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Confirm Subscription</h2>
              <p className="text-center text-gray-600 mb-8">
                Pay ₦{subscriptionAmount?.toLocaleString() || '6,000'} to unlock the Driver Shop and access vetted drivers.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className={`py-4 px-8 rounded-2xl text-white font-bold text-lg transition-all ${
                    subscribing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {subscribing ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Redirecting to Paystack...
                    </span>
                  ) : (
                    'Pay with Paystack'
                  )}
                </button>
                <button
                  onClick={() => setShowSubscribeModal(false)}
                  className="py-4 px-8 rounded-2xl bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  }

  // Subscribed View: Show vetted drivers
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto py-12 px-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Driver Shop</h1>
          <p className="text-xl text-gray-600 mt-3">
            Browse and hire from our exclusive list of vetted, trusted drivers
          </p>
        </div>
        <span className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full text-lg font-medium">
          <Shield className="h-5 w-5 mr-2" />
          Subscribed
        </span>
      </div>

      {vettedDrivers.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-10 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-yellow-800 mb-4">No Vetted Drivers Available</h3>
          <p className="text-lg text-yellow-700">
            Our team is currently vetting drivers. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {vettedDrivers.map((driver) => (
            <motion.div
              key={driver._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={driver.avatar || 'https://via.placeholder.com/400x300?text=Driver'}
                  alt={`${driver.firstName} ${driver.lastName}`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Vetted
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {driver.firstName} {driver.lastName}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-medium text-gray-700">
                    {driver.rating?.toFixed(1) || '5.0'} ({driver.totalTrips || 0} trips)
                  </span>
                </div>

                {driver.vehicle && (
                  <p className="text-gray-600 mb-2">
                    <Car className="inline h-4 w-4 mr-1" />
                    {driver.vehicle.make} {driver.vehicle.model}
                  </p>
                )}

                <button
                  onClick={() => handleHireClick(driver)}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  Hire Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hire Modal (your existing one) */}
    {showHireModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div className="bg-white p-6 rounded-2xl max-w-lg w-full overflow-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">Hire {selectedDriver.firstName}</h2>

            <div className="space-y-4">
              <div>
                <label>Hire Type</label>
                <select
                  value={hireData.hireType}
                  onChange={(e) => setHireData({ ...hireData, hireType: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>

              <div>
                <label>Duration</label>
                <input
                  type="number"
                  value={hireData.duration}
                  onChange={(e) => setHireData({ ...hireData, duration: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label>Start Date</label>
                <input
                  type="date"
                  value={hireData.startDate}
                  onChange={(e) => setHireData({ ...hireData, startDate: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label>Salary</label>
                <input
                  type="number"
                  value={hireData.salary}
                  onChange={(e) => setHireData({ ...hireData, salary: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label>Salary Per</label>
                <select
                  value={hireData.salaryPer}
                  onChange={(e) => setHireData({ ...hireData, salaryPer: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>

              <div>
                <label>Duties (comma separated)</label>
                <input
                  type="text"
                  value={hireData.duties}
                  onChange={(e) => setHireData({ ...hireData, duties: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label>Working Hours</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={hireData.workingHoursFrom}
                    onChange={(e) => setHireData({ ...hireData, workingHoursFrom: e.target.value })}
                    className="w-1/2 border p-2 rounded"
                  />
                  <input
                    type="time"
                    value={hireData.workingHoursTo}
                    onChange={(e) => setHireData({ ...hireData, workingHoursTo: e.target.value })}
                    className="w-1/2 border p-2 rounded"
                  />
                </div>
              </div>

              <div>
                <label>Days per week</label>
                <input
                  type="number"
                  value={hireData.daysPerWeek}
                  onChange={(e) => setHireData({ ...hireData, daysPerWeek: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label>Location</label>
                <input
                  type="text"
                  value={hireData.location}
                  onChange={(e) => setHireData({ ...hireData, location: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label>Additional Notes</label>
                <textarea
                  value={hireData.additionalNotes}
                  onChange={(e) => setHireData({ ...hireData, additionalNotes: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleHireSubmit}
                className="flex-1 bg-green-600 text-white py-2 rounded"
              >
                Submit Hire Request
              </button>
              <button
                onClick={() => setShowHireModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DriverShop;