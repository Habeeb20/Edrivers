// src/pages/Admin/AdminVehicleLicenses.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  CheckCircle, XCircle, Clock, FileText, Filter, Eye,
  User, Car, CreditCard, Calendar, AlertTriangle, Image, X
} from 'lucide-react';

const statusColors = {
  'payment-pending': 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusIcons = {
  'payment-pending': Clock,
  submitted: FileText,
  processing: Clock,
  ready: CheckCircle,
  rejected: XCircle,
};

const AdminVehicleLicenses = () => {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, appId: null, reason: '' });
  const [viewModal, setViewModal] = useState({ open: false, application: null });

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `${import.meta.env.VITE_BACKEND_URL}/api/vehicle-license/applications?status=${statusFilter}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/vehicle-license/applications`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, status, rejectionReason = '') => {
    try {
      const payload = { status };
      if (status === 'rejected') payload.rejectionReason = rejectionReason;

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/vehicle-license/status/${appId}`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );

      toast.success(`Application updated to ${status}`);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleReject = () => {
    if (!rejectModal.reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    updateStatus(rejectModal.appId, 'rejected', rejectModal.reason);
    setRejectModal({ open: false, appId: null, reason: '' });
  };

  const openDetails = (app) => {
    setViewModal({ open: true, application: app });
  };

  if (loading) return <div className="text-center py-20">Loading applications...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Vehicle License Applications</h1>

          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="payment-pending">Payment Pending</option>
              <option value="submitted">Submitted</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            No applications found
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">
                      {app.vehicleMake} {app.vehicleModel} ({app.vehicleYear})
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Plate: {app.plateNumber} • Owner: {app.user?.firstName} {app.user?.lastName}
                    </p>
                  </div>

                  <div
                    className={`px-5 py-2 rounded-full flex items-center gap-2 ${
                      statusColors[app.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {React.createElement(statusIcons[app.status] || Clock, {
                      className: 'h-5 w-5',
                    })}
                    <span className="font-medium capitalize">
                      {app.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => openDetails(app)}
                    className="flex-1 min-w-[140px] py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition flex items-center justify-center gap-2 font-medium"
                  >
                    <Eye size={18} /> View Details
                  </button>

                  {app.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => updateStatus(app._id, 'processing')}
                        className="flex-1 min-w-[140px] py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} /> Mark as processing
                      </button>
                      <button
                        onClick={() => setRejectModal({ open: true, appId: app._id, reason: '' })}
                        className="flex-1 min-w-[140px] py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} /> Reject
                      </button>
                    </>
                  )}
                  {app.status === 'processing' && (
                    <>
                      <button
                        onClick={() => updateStatus(app._id, 'ready')}
                        className="flex-1 min-w-[140px] py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} /> Mark Ready
                      </button>
                      <button
                        onClick={() => setRejectModal({ open: true, appId: app._id, reason: '' })}
                        className="flex-1 min-w-[140px] py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} /> Reject
                      </button>
                    </>
                  )}
                </div>

                {app.status === 'rejected' && app.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <p className="font-medium text-red-800">Rejection Reason:</p>
                    <p className="text-red-700 mt-1">{app.rejectionReason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6">Reject Application</h3>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Enter detailed reason for rejection..."
              className="w-full h-32 p-4 border rounded-lg mb-6 focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setRejectModal({ open: false, appId: null, reason: '' })}
                className="flex-1 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectModal.reason.trim()}
                className={`flex-1 py-3 rounded-lg text-white font-medium ${
                  rejectModal.reason.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400'
                }`}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModal.open && viewModal.application && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative">
            <button
              onClick={() => setViewModal({ open: false, application: null })}
              className="absolute top-4 right-4 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>

            <h2 className="text-3xl font-bold mb-8 text-center">
              Vehicle License Application Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Owner Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User className="h-6 w-6 text-blue-600" /> Owner Information
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Full Name:</strong> {viewModal.application.ownerFullName}</p>
                    <p><strong>Phone:</strong> {viewModal.application.ownerPhone}</p>
                    <p><strong>Email:</strong> {viewModal.application.ownerEmail}</p>
                  </div>
                </div>

                {/* Payment & Status */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-green-600" /> Payment & Status
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Status:</strong> <span className="capitalize">{viewModal.application.status.replace('-', ' ')}</span></p>
                    <p><strong>Amount Paid:</strong> ₦{viewModal.application.amountPaid?.toLocaleString() || 'N/A'}</p>
                    <p><strong>Payment Reference:</strong> {viewModal.application.paymentRef || 'N/A'}</p>
                    <p><strong>Submitted:</strong> {new Date(viewModal.application.submittedAt).toLocaleString()}</p>
                    {viewModal.application.confirmedAt && (
                      <p><strong>Confirmed:</strong> {new Date(viewModal.application.confirmedAt).toLocaleString()}</p>
                    )}
                    {viewModal.application.processedAt && (
                      <p><strong>Processed:</strong> {new Date(viewModal.application.processedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Car className="h-6 w-6 text-indigo-600" /> Vehicle Details
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Make/Model:</strong> {viewModal.application.vehicleMake} {viewModal.application.vehicleModel}</p>
                    <p><strong>Year:</strong> {viewModal.application.vehicleYear}</p>
                    <p><strong>Color:</strong> {viewModal.application.vehicleColor}</p>
                    <p><strong>Plate Number:</strong> {viewModal.application.plateNumber}</p>
                    <p><strong>Chassis Number:</strong> {viewModal.application.chassisNumber}</p>
                    <p><strong>Engine Number:</strong> {viewModal.application.engineNumber}</p>
                    <p><strong>Fuel Type:</strong> {viewModal.application.fuelType}</p>
                    <p><strong>Vehicle Type:</strong> {viewModal.application.vehicleType}</p>
                  </div>
                </div>

                {/* Renewal Info (if applicable) */}
                {viewModal.application.type === 'renewal' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-purple-600" /> Renewal Information
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p><strong>Current License:</strong> {viewModal.application.currentLicenseNumber || 'N/A'}</p>
                      <p><strong>Expiry Date:</strong> {viewModal.application.currentExpiryDate ? new Date(viewModal.application.currentExpiryDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Image className="h-6 w-6 text-teal-600" /> Uploaded Documents
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Vehicle Photo', url: viewModal.application.vehiclePhoto },
                    { label: 'Proof of Ownership', url: viewModal.application.proofOfOwnership },
                    { label: 'Insurance Certificate', url: viewModal.application.insuranceCertificate },
                    { label: 'Road Worthy Certificate', url: viewModal.application.roadWorthyCertificate },
                  ].map((doc, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-sm font-medium mb-2">{doc.label}</p>
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline block text-sm"
                        >
                          View Document
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Not uploaded</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {viewModal.application.status === 'rejected' && viewModal.application.rejectionReason && (
                <div className="md:col-span-2 mt-6 p-6 bg-red-50 rounded-xl border border-red-200">
                  <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" /> Rejection Reason
                  </h3>
                  <p className="text-red-700">{viewModal.application.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="mt-10 flex justify-end">
              <button
                onClick={() => setViewModal({ open: false, application: null })}
                className="px-8 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicleLicenses;