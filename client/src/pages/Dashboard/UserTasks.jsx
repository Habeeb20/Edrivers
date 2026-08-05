import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const UserTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const [allRes, approvedRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/my-tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/approved-tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
console.log(allRes.data);
      setAllTasks(allRes.data.tasks || []);
      setApprovedTasks(approvedRes.data.tasks || []);
    } catch (err) {
      toast.error('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle size={16}/> Approved</span>;
      case 'pending':
        return <span className="flex items-center gap-1 text-yellow-600 font-semibold"><Clock size={16}/> Pending</span>;
      case 'declined':
        return <span className="flex items-center gap-1 text-red-600 font-semibold"><XCircle size={16}/> Declined</span>;
      default:
        return null;
    }
  };

  if (loading) return <p className="text-center py-20 text-xl">Loading tasks...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto p-8">
    
      {/* Approved Tasks */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Approved Tasks</h2>
        {approvedTasks.length === 0 ? (
          <p className="text-gray-500">No approved tasks yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedTasks.map(task => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-lg">{statusBadge(task.status)}</span>
                  <span className="text-gray-400 text-sm">{new Date(task.postedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 mb-2">{task.description}</p>
                <div className="text-sm text-gray-500">
                  <p><span className="font-semibold">Visibility:</span> {task.visibility}</p>
                  <p><span className="font-semibold">Amount Paid:</span> ₦{task.amountPaid.toLocaleString()}</p>
                  {task.approvedAt && <p><span className="font-semibold">Approved At:</span> {new Date(task.approvedAt).toLocaleString()}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* All Tasks */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-blue-600">All My Tasks</h2>
        {allTasks.length === 0 ? (
          <p className="text-gray-500">You have not posted any tasks yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allTasks.map(task => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white p-6 rounded-2xl shadow-lg border-l-4 ${
                  task.status === 'approved' ? 'border-green-500' :
                  task.status === 'pending' ? 'border-yellow-500' :
                  'border-red-500'
                }`}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-lg">{statusBadge(task.status)}</span>
                  <span className="text-gray-400 text-sm">{new Date(task.postedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 mb-2">{task.description}</p>
                <div className="text-sm text-gray-500">
                  <p><span className="font-semibold">Visibility:</span> {task.visibility}</p>
                  <p><span className="font-semibold">Amount Paid:</span> ₦{task.amountPaid.toLocaleString()}</p>
                  {task.status === 'approved' && task.approvedAt && (
                    <p><span className="font-semibold">Approved At:</span> {new Date(task.approvedAt).toLocaleString()}</p>
                  )}
                  {task.status === 'declined' && task.declineReason && (
                    <p><span className="font-semibold">Reason:</span> {task.declineReason}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default UserTasks;
