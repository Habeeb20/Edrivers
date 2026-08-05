// // src/pages/Admin/AdminHireOnDemandRequests.jsx
// // Beautiful admin component to view Hire on Demand requests with client + driver details

// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   Shield, 
//   Users, 
//   Car, 
//   DollarSign, 
//   Clock, 
//   MapPin, 
//   Globe, 
//   AlertTriangle, 
//   CheckCircle 
// } from 'lucide-react';
// import axios from 'axios';
// import { toast } from 'sonner';

// const AdminHireOnDemandRequests = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   const token = localStorage.getItem('adminToken');

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   const fetchRequests = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/requests`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setRequests(res.data.requests || []);
//       console.log(res)
//     } catch (err) {
//       toast.error('Failed to load requests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openDetails = (request) => {
//     setSelectedRequest(request);
//     setShowModal(true);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="p-8 max-w-7xl mx-auto"
//     >
//       <h1 className="text-3xl font-bold text-center mb-12 text-gray-900 flex items-center justify-center gap-4">
//         <Shield className="h-10 w-10 text-purple-600" />
//         Hire on Demand Requests
//       </h1>

//       <p className="text-center text-gray-600 mb-8">Monitor and view all client hire on demand requests</p>

//       {loading ? (
//         <p className="text-center text-xl text-gray-600 py-20">Loading requests...</p>
//       ) : requests.length === 0 ? (
//         <p className="text-center text-xl text-gray-600 py-20">No hire on demand requests yet</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {requests.map(request => (
//             <motion.div
//               key={request._id}
//               whileHover={{ y: -5 }}
//               className="bg-white rounded-2xl shadow-xl p-6"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={request.client.avatar || '/default-avatar.jpg'}
//                     alt=""
//                     className="w-12 h-12 rounded-full"
//                   />
//                   <div>
//                     <h3 className="font-bold">{request.client.firstName} {request.client.lastName}</h3>
//                     <p className="text-sm text-gray-600">Client</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => openDetails(request)}
//                   className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full"
//                 >
//                   <Eye className="h-5 w-5 text-blue-600" />
//                 </button>
//               </div>

//               <div className="space-y-2 text-gray-700">
//                 <p className="flex items-center gap-2">
//                   <Car className="h-4 w-4 text-blue-600" />
//                   Driver: {request.driver.firstName} {request.driver.lastName}
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <Globe className="h-4 w-4 text-green-600" />
//                   Travel: {request.travelType}
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <Users className="h-4 w-4 text-purple-600" />
//                   Service: {request.serviceLevel}
//                 </p>
//                 <p className="flex items-center gap-2">
//                   <DollarSign className="h-4 w-4 text-green-600" />
//                   Paid: ₦5,000
//                 </p>
//                 <p className="flex items-center gap-2 text-sm text-gray-500">
//                   <Clock className="h-4 w-4" />
//                   Requested: {new Date(request.requestedAt).toLocaleDateString()}
//                 </p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       )}

//       {/* Details Modal */}
//       {showModal && selectedRequest && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <motion.div className="bg-white p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between mb-6">
//               <h2 className="text-2xl font-bold">Hire Request Details</h2>
//               <button onClick={() => setShowModal(false)}>
//                 <X className="h-6 w-6" />
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* Client Details */}
//               <div>
//                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
//                   <Users className="h-6 w-6 text-blue-600" />
//                   Client Details
//                 </h3>
//                 <p>Name: {selectedRequest.client.firstName} {selectedRequest.client.lastName}</p>
//                 <p>Email: {selectedRequest.client.email}</p>
//                 <p>Phone: {selectedRequest.client.phone || 'N/A'}</p>
//                 <p>Address: {selectedRequest.client.address?.street || 'N/A'}</p>
//               </div>

//               {/* Driver Details */}
//               <div>
//                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
//                   <Car className="h-6 w-6 text-green-600" />
//                   Driver Details
//                 </h3>
//                 <p>Name: {selectedRequest.driver.firstName} {selectedRequest.driver.lastName}</p>
//                 <p>Plan: {selectedRequest.driver.hireOnDemand.plan}</p>
//                 <p>Service: {selectedRequest.driver.hireOnDemand.serviceLevel}</p>
//                 <p>Rating: {selectedRequest.driver.rating?.toFixed(1) || 'N/A'}</p>
//               </div>

//               {/* Request Details */}
//               <div className="md:col-span-2">
//                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
//                   <AlertTriangle className="h-6 w-6 text-orange-600" />
//                   Request Details
//                 </h3>
//                 <p>Travel Type: {selectedRequest.travelType}</p>
//                 <p>Service Level: {selectedRequest.serviceLevel}</p>
//                 <p>Payment: ₦5,000 (Ref: {selectedRequest.paymentRef})</p>
//                 <p>Status: {selectedRequest.status}</p>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default AdminHireOnDemandRequests;



// src/pages/Admin/AdminHireOnDemandSubscribers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Users, BadgeCheck, Loader2, RefreshCw, CheckCircle, XCircle,
  Phone, Mail, MapPin, Star, Car, AlertTriangle, Clock
} from 'lucide-react';

const AdminHireOnDemandSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    driverId: null,
    action: null, // 'approve' or 'decline'
    driverName: ''
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/hod-subscribers`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        }
      );
console.log(res.data)
      if (res.data.success) {
        setSubscribers(res.data.subscribers || []);
      } else {
        toast.error(res.data.message || 'Failed to load subscribers');
      }
    } catch (err) {
      console.log(err)
      toast.error('Failed to load Hire on Demand subscribers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (driverId, action, driverName) => {
    setConfirmModal({
      open: true,
      driverId,
      action,
      driverName
    });
  };

  const confirmAction = async () => {
    const { driverId, action } = confirmModal;
    if (!driverId || !action) return;

    setActionLoading(prev => ({ ...prev, [driverId]: true }));

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/subscriptions/${driverId}`,
        { action }, // 'approve' or 'decline'
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }
      );

      toast.success(`Subscription ${action}d successfully`);
      fetchSubscribers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} subscription`);
    } finally {
      setActionLoading(prev => ({ ...prev, [driverId]: false }));
      setConfirmModal({ open: false, driverId: null, action: null, driverName: '' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <BadgeCheck className="h-10 w-10 text-indigo-600" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Hire on Demand Subscribers
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Manage drivers who applied for priority on-demand access
              </p>
            </div>
          </div>

          <button
            onClick={fetchSubscribers}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        {subscribers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Users className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No pending or active subscribers yet
            </h2>
            <p className="text-lg text-gray-600">
              Drivers will appear here once they subscribe to Hire on Demand.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Contact
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Plan / Level
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subscribers.map((driver) => {
                    const sub = driver.hireOnDemandSubscription || {};
                    const isPending = sub.status === 'pending';
                    const isActive = sub.status === 'active';

                    return (
                      <tr key={driver._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={driver.avatar || '/default-avatar.jpg'}
                              alt=""
                              className="h-12 w-12 rounded-full object-cover mr-4 border-2 border-gray-200"
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
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                          {driver.phone || '—'}<br />
                          {driver.email}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm hidden lg:table-cell">
                          {sub.package || '—'} / {sub.serviceLevel || '—'}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          {isPending && (
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                              <Clock size={16} className="mr-1.5" /> Pending Approval
                            </span>
                          )}
                          {isActive && (
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <BadgeCheck size={16} className="mr-1.5" /> Active
                            </span>
                          )}
                          {!isPending && !isActive && (
                            <span className="text-gray-500 text-sm">Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          {isPending && (
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => handleAction(driver._id, 'approve', `${driver.firstName} ${driver.lastName}`)}
                                disabled={actionLoading[driver._id]}
                                className="p-2.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                title="Approve Subscription"
                              >
                                <CheckCircle size={20} />
                              </button>

                              <button
                                onClick={() => handleAction(driver._id, 'decline', `${driver.firstName} ${driver.lastName}`)}
                                disabled={actionLoading[driver._id]}
                                className="p-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                title="Decline Subscription"
                              >
                                <XCircle size={20} />
                              </button>
                            </div>
                          )}

                          {!isPending && (
                            <span className="text-gray-500 text-sm italic">
                              {isActive ? 'Approved' : 'Processed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              {confirmModal.action === 'approve' ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
              {confirmModal.action === 'approve' ? 'Approve' : 'Decline'} Subscription
            </h3>

            <p className="text-gray-700 mb-6">
              Are you sure you want to <strong>{confirmModal.action}</strong> the Hire on Demand subscription for
              <br />
              <span className="font-semibold text-gray-900">
                {confirmModal.driverName}?
              </span>
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal({ open: false, driverId: null, action: null, driverName: '' })}
                className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>

              <button
                onClick={confirmAction}
                disabled={actionLoading[confirmModal.driverId]}
                className={`flex-1 py-4 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${
                  confirmModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {actionLoading[confirmModal.driverId] ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : confirmModal.action === 'approve' ? (
                  'Approve Subscription'
                ) : (
                  'Decline Subscription'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHireOnDemandSubscribers;