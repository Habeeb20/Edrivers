// src/pages/Client/MyVehicleLicenses.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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

const MyVehicleLicenses = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/vehicle-license/my-applications`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setApplications(res.data.applications || []);
      } catch (err) {
        toast.error('Failed to load your applications');
      } finally {
        setLoading(false);
      }
    };

    fetchMyApplications();
  }, []);

  if (loading) return <div className="text-center py-20">Loading your applications...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">My Vehicle License Applications</h1>

        {applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow">
            <AlertTriangle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">You have no vehicle license applications yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const StatusIcon = statusIcons[app.status] || Clock;

              return (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        {app.vehicleMake} {app.vehicleModel} ({app.vehicleYear})
                      </h3>
                      <p className="text-gray-600">{app.plateNumber} • {app.vehicleType}</p>
                    </div>

                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${statusColors[app.status]}`}>
                      <StatusIcon className="h-5 w-5" />
                      <span className="font-medium capitalize">{app.status.replace('-', ' ')}</span>
                    </div>
                  </div>

                  {app.status === 'rejected' && app.rejectionReason && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-800">Reason for rejection:</p>
                      <p className="text-red-700 mt-1">{app.rejectionReason}</p>
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Submitted:</strong> {new Date(app.submittedAt).toLocaleDateString()}</p>
                      {app.confirmedAt && (
                        <p><strong>Confirmed:</strong> {new Date(app.confirmedAt).toLocaleDateString()}</p>
                      )}
                      {app.processedAt && (
                        <p><strong>Processed:</strong> {new Date(app.processedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div>
                      <p><strong>Amount Paid:</strong> ₦{app.amountPaid?.toLocaleString() || '—'}</p>
                      {app.paymentRef && (
                        <p className="text-xs text-gray-500 break-all">Ref: {app.paymentRef}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVehicleLicenses;