// src/pages/Admin/PendingHireApprovals.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  AlertTriangle, CheckCircle, XCircle, Clock, DollarSign, 
  MapPin, User, Car, Phone, Mail, Send, MessageSquare 
} from 'lucide-react';
import { motion } from 'framer-motion';

const PendingHireApprovals = () => {
  const [pendingHires, setPendingHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHire, setSelectedHire] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem('adminToken'); // assuming admin token

  useEffect(() => {
    fetchPendingHires();
  }, []);

  const fetchPendingHires = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/pending-approval-hires`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingHires(res.data.pendingHires || []);
      console.log(res.data)
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hire) => {
    console.log(hire?._id)
    console.log('Approving hire - full hire object:', hire);
  console.log('Sending clientId:', hire.clientId || hire.client);
    if (!window.confirm(`Approve hire request from ${hire.clientName} to ${hire.driver?.firstName || 'Driver'}?`)) return;

    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/approve-hire-payment`,
        { 
        hireId: hire.hire?._id || hire._id,
          clientId: hire.clientId, 
          driverId: hire.driver?._id 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Hire request approved — client can now pay');
      fetchPendingHires(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      return toast.error('Please provide a reason for rejection');
    }

    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/reject-hire-payment`,
        { 
          hireId: selectedHire._id, 
          clientId: selectedHire.clientId, 
          driverId: selectedHire.driver?._id,
          rejectReason 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Hire request rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedHire(null);
      fetchPendingHires();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Pending Hire Approvals
          </h1>
          <button 
            onClick={fetchPendingHires}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : pendingHires.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Pending Approvals
            </h2>
            <p className="text-gray-500">
              All hire requests are either approved, rejected, or within acceptable offer range.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingHires.map((hire) => (
              <motion.div
                key={hire._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-yellow-200/50"
              >
                {/* Header */}
                <div className="bg-yellow-50 p-5 border-b border-yellow-200 flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  <h3 className="text-lg font-bold text-yellow-800">
                    Low Offer — Admin Review Required
                  </h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Client Info */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Client</h4>
                      <p className="text-gray-700">{hire.clientName}</p>
                      <p className="text-sm text-gray-500">{hire.clientEmail}</p>
                      <p className="text-sm text-gray-500">{hire.clientPhone}</p>
                    </div>

                    {/* Driver Info */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Driver</h4>
                      {hire.driver ? (
                        <>
                          <p className="text-gray-700">
                            {hire.driver.firstName} {hire.driver.lastName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Phone size={14} /> {hire.driver.phone || 'N/A'}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500">Driver info not available</p>
                      )}
                    </div>
                  </div>

                  {/* Hire Details */}
                  <div className="bg-gray-50 p-5 rounded-xl mb-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="font-medium">{hire.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">{hire.durationHours} hours</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Client Offer</p>
                        <p className="font-medium text-orange-600">
                          ₦{hire.amountOffered.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Required Amount</p>
                        <p className="font-medium text-green-600">
                          ₦{hire.systemAmount?.toLocaleString() || hire.amount?.toLocaleString()  }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mb-6">
                    <p className="text-gray-500 flex items-center gap-2 mb-1">
                      <MapPin size={16} /> Address
                    </p>
                    <p className="text-gray-700">{hire.address}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(hire)}
                      disabled={actionLoading}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                        actionLoading 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <CheckCircle size={18} />
                      Approve Payment
                    </button>

                    <button
                      onClick={() => {
                        setSelectedHire(hire);
                        setShowRejectModal(true);
                      }}
                      disabled={actionLoading}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                        actionLoading 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedHire && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
          >
            <h3 className="text-2xl font-bold mb-4 text-center text-red-700">
              Reject Hire Request?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Client offered ₦{selectedHire.amountOffered.toLocaleString()} 
              (below required ₦{selectedHire.systemAmount?.toLocaleString() || selectedHire.amount?.toLocaleString()})
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (required)"
              className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-red-500 min-h-[120px]"
            />

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedHire(null);
                }}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className={`flex-1 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                  actionLoading || !rejectReason.trim()
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <XCircle size={18} />
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PendingHireApprovals;