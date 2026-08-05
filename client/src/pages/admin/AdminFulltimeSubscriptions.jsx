// src/pages/Admin/AdminFulltimeSubscriptions.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminFulltimeSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    subscriptionId: null,
    driverName: '',
    action: '' // 'approve' or 'decline'
  });

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/fulltime-hire/subscriptions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setSubscriptions(res.data.pendingSubscriptions || []);
      } else {
        toast.error(res.data.message || 'Failed to load subscriptions');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load full-time subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (subscriptionId, action, driverName) => {
    setConfirmModal({
      open: true,
      subscriptionId,
      driverName,
      action
    });
  };

  const confirmAction = async () => {
    const { subscriptionId, action } = confirmModal;
    if (!subscriptionId || !action) return;

    setActionLoading(prev => ({ ...prev, [subscriptionId]: true }));

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/fulltime-hire/manage/${subscriptionId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Subscription ${action}d successfully`);
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} subscription`);
    } finally {
      setActionLoading(prev => ({ ...prev, [subscriptionId]: false }));
      setConfirmModal({ open: false, subscriptionId: null, driverName: '', action: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Full-Time Hire Subscriptions
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Manage pending driver subscriptions for full-time hire plans
            </p>
          </div>

          <button
            onClick={fetchSubscriptions}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No pending subscriptions
            </h2>
            <p className="text-lg text-gray-600">
              When drivers subscribe to full-time hire plans, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subscriptions.map((sub) => {
              const driver = sub.user || {};
              const isPending = sub.subscriptionStatus === 'pending';

              return (
                <motion.div
                  key={sub._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center gap-4">
                      <img
                        src={driver.avatar || '/default-avatar.jpg'}
                        alt=""
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <div>
                        <h3 className="text-xl font-bold">
                          {driver.firstName} {driver.lastName}
                        </h3>
                        <p className="text-indigo-100 text-sm mt-1 capitalize">
                          {sub.package} Package
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium break-all">{driver.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{driver.phone || '—'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500">Address</p>
                      <p className="font-medium flex items-start gap-2">
                        <MapPin size={16} className="mt-1 text-indigo-600 flex-shrink-0" />
                        {driver.address || '—'}, {driver.state || ''} {driver.lga ? `(${driver.lga})` : ''}, {driver.country}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-bold text-green-700">
                          ₦{sub.subscriptionAmount?.toLocaleString() || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Applied</p>
                        <p className="font-medium">
                          {new Date(sub.subscribedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-4 py-1.5 mt-2 rounded-full text-sm font-medium ${
                        isPending
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {sub.subscriptionStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isPending && (
                    <div className="flex gap-4 p-6 pt-0">
                      <button
                        onClick={() => handleAction(sub._id, 'approve', `${driver.firstName} ${driver.lastName}`)}
                        disabled={actionLoading[sub._id]}
                        className="flex-1 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {actionLoading[sub._id] ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle size={20} />
                            Approve
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleAction(sub._id, 'decline', `${driver.firstName} ${driver.lastName}`)}
                        disabled={actionLoading[sub._id]}
                        className="flex-1 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {actionLoading[sub._id] ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <XCircle size={20} />
                            Decline
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              {confirmModal.action === 'approve' ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
              {confirmModal.action === 'approve' ? 'Approve' : 'Decline'} Subscription
            </h3>

            <p className="text-gray-700 mb-8">
              Are you sure you want to <strong>{confirmModal.action}</strong> the full-time hire subscription for
              <br />
              <span className="font-semibold text-gray-900 mt-2 block">
                {confirmModal.driverName}?
              </span>
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal({ open: false, subscriptionId: null, driverName: '', action: '' })}
                className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>

              <button
                onClick={confirmAction}
                disabled={actionLoading[confirmModal.subscriptionId]}
                className={`flex-1 py-4 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${
                  confirmModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {actionLoading[confirmModal.subscriptionId] ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : confirmModal.action === 'approve' ? (
                  'Approve Subscription'
                ) : (
                  'Decline Subscription'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminFulltimeSubscriptions;