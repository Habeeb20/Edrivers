// Example: src/pages/Admin/PendingHODSubscriptions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PendingHODSubscriptions = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/subscriptions/pending`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPending(res.data.pendingSubscriptions || []);
    } catch (err) {
      toast.error('Failed to load pending subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (driverId, action, reason = '') => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/subscriptions/${driverId}`,
        { action, reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(`Subscription ${action}d`);
      fetchPending(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Pending Hire on Demand Subscriptions</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      ) : pending.length === 0 ? (
        <div className="text-center py-20 text-gray-600 text-xl">
          No pending subscriptions at the moment
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left">Driver</th>
                <th className="px-6 py-4 text-left">Plan</th>
                <th className="px-6 py-4 text-left">Service Level</th>
                <th className="px-6 py-4 text-left">Subscribed</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map(sub => (
                <tr key={sub.driverId} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.avatar || '/default-avatar.jpg'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{sub.name}</p>
                        <p className="text-sm text-gray-500">{sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{sub.plan}</td>
                  <td className="px-6 py-4 capitalize">{sub.serviceLevel}</td>
                  <td className="px-6 py-4">
                    {new Date(sub.subscribedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleAction(sub.driverId, 'approve')}
                        className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        title="Approve"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for decline?');
                          if (reason) handleAction(sub.driverId, 'decline', reason);
                        }}
                        className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        title="Decline"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingHODSubscriptions;