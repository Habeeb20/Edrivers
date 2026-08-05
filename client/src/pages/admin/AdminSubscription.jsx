// /* eslint-disable no-unused-vars */
// // src/pages/Admin/AdminSubscriptions.jsx
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Shield, CheckCircle, XCircle, Eye, AlertTriangle, Car, Users } from 'lucide-react';
// import axios from 'axios';
// import { toast } from 'sonner';

// const AdminSubscriptions = () => {
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [declineReason, setDeclineReason] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchSubscriptions();
//   }, []);

//   const fetchSubscriptions = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/subscriptions`);
//       setSubscriptions(res.data.pendingSubscriptions || []);
//     } catch (err) {
//       toast.error('Failed to load subscriptions');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAction = async (driverId, action) => {
//     try {
//       await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/subscription/${driverId}`, {
//         action,
//         reason: action === 'decline' ? declineReason : undefined,
//       });
//       toast.success(`Subscription ${action}d successfully`);
//       fetchSubscriptions();
//       setShowModal(false);
//       setDeclineReason('');
//     } catch (err) {
//       toast.error('Action failed');
//     }
//   };

//   const openModal = (driver, action) => {
//     setSelectedDriver(driver);
//     setShowModal(action);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="p-8 max-w-7xl mx-auto"
//     >
//       <h1 className="text-3xl font-bold text-center mb-12 text-gray-900 flex items-center justify-center gap-4">
//         <Shield className="h-10 w-10 text-purple-600" />
//         Hire on Demand Subscriptions
//       </h1>

//       <p className="text-center text-gray-600 mb-8">Review and approve/decline driver subscriptions</p>

//       {loading ? (
//         <p className="text-center text-xl text-gray-600 py-20">Loading...</p>
//       ) : subscriptions.length === 0 ? (
//         <p className="text-center text-xl text-gray-600 py-20">No pending subscriptions</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {subscriptions.map(driver => (
//             <motion.div
//               key={driver._id}
//               whileHover={{ y: -5 }}
//               className="bg-white rounded-2xl shadow-xl p-6"
//             >
//               <div className="flex items-center gap-4 mb-4">
//                 <img
//                   src={driver.avatar || '/default-avatar.jpg'}
//                   alt=""
//                   className="w-16 h-16 rounded-full border-2 border-purple-200"
//                 />
//                 <div>
//                   <h3 className="text-xl font-bold">{driver.firstName} {driver.lastName}</h3>
//                   <p className="text-gray-600">Driver</p>
//                 </div>
//               </div>

//               <div className="space-y-3 text-gray-700">
//                 <p className="flex items-center gap-2">
//                   <Car className="h-5 w-5 text-blue-600" />
//                   Plan: {driver.hireOnDemand.plan}
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <Users className="h-5 w-5 text-green-600" />
//                   Service: {driver.hireOnDemand.serviceLevel}
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <DollarSign className="h-5 w-5 text-green-600" />
//                   Paid: ₦2,000
//                 </p>
//               </div>

//               <div className="flex gap-4 mt-6">
//                 <button
//                   onClick={() => handleAction(driver._id, 'approve')}
//                   className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition"
//                 >
//                   <CheckCircle className="inline mr-2 h-5 w-5" /> Approve
//                 </button>
//                 <button
//                   onClick={() => openModal(driver, 'decline')}
//                   className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition"
//                 >
//                   <XCircle className="inline mr-2 h-5 w-5" /> Decline
//                 </button>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       )}

//       {/* Decline Modal */}
//       {showModal === 'decline' && selectedDriver && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <motion.div className="bg-white p-8 rounded-2xl max-w-md w-full">
//             <h3 className="text-2xl font-bold mb-4">Decline {selectedDriver.firstName}'s Subscription?</h3>
//             <textarea
//               value={declineReason}
//               onChange={(e) => setDeclineReason(e.target.value)}
//               placeholder="Reason for decline (optional)"
//               className="w-full p-4 border rounded-xl mb-6"
//               rows="4"
//             />
//             <div className="flex gap-4">
//               <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-200 rounded-xl">
//                 Cancel
//               </button>
//               <button 
//                 onClick={() => handleAction(selectedDriver._id, 'decline')} 
//                 className="flex-1 py-3 bg-red-600 text-white rounded-xl"
//               >
//                 Confirm Decline
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default AdminSubscriptions;





// src/pages/Admin/AdminSubscriptions.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, AlertTriangle, Car, Users, DollarSign } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Get admin token from Redux (or fallback to localStorage)
  const { token: adminToken } = useSelector((state) => state.admin);
  const token = adminToken || localStorage.getItem('adminToken');

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    if (!token) {
      toast.error('Admin authentication required');
      return;
    }
    fetchSubscriptions();
  }, [token]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/subscriptions`,
        axiosConfig
      );
      setSubscriptions(res.data.pendingSubscriptions || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (driverId, action) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/hire-on-demand/subscription/${driverId}`,
        {
          action,
          reason: action === 'decline' ? declineReason : undefined,
        },
        axiosConfig
      );
      toast.success(`Subscription ${action}d successfully`);
      fetchSubscriptions();
      setShowModal(false);
      setDeclineReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const openModal = (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-center mb-12 text-gray-900 flex items-center justify-center gap-4">
        <Shield className="h-10 w-10 text-purple-600" />
        Hire on Demand Subscriptions
      </h1>

      <p className="text-center text-gray-600 mb-8">Review and approve/decline driver subscriptions</p>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-xl text-gray-600">Loading subscriptions...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-600">No pending subscriptions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subscriptions.map((driver) => (
            <motion.div
              key={driver._id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={driver.avatar || '/default-avatar.jpg'}
                  alt={driver.firstName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                />
                <div>
                  <h3 className="text-xl font-bold">{driver.firstName} {driver.lastName}</h3>
                  <p className="text-gray-600">Driver</p>
                </div>
              </div>

              <div className="space-y-3 text-gray-700">
                <p className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-blue-600" />
                  Plan: <strong>{driver.hireOnDemand.plan?.replace('-', ' ')}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Service: <strong>{driver.hireOnDemand.serviceLevel}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Amount Paid: <strong>₦2,000</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Applied: {new Date(driver.hireOnDemand.subscribedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleAction(driver._id, 'approve')}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Approve
                </button>
                <button
                  onClick={() => openModal(driver)}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <XCircle className="h-5 w-5" />
                  Decline
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Decline Modal */}
      {showModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">
              Decline Subscription?
            </h3>
            <p className="text-center text-gray-700 mb-6">
              Declining {selectedDriver.firstName} {selectedDriver.lastName}'s Hire on Demand subscription
            </p>

            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining (optional)"
              className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-red-500"
              rows="4"
            />

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setDeclineReason('');
                }}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(selectedDriver._id, 'decline')}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition"
              >
                Confirm Decline
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminSubscriptions;