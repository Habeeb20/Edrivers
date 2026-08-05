/* eslint-disable no-unused-vars */
// src/pages/Admin/AdminTasks.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data.tasks || []);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (taskId, action) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/tasks/manage/${taskId}`,
        { action, reason: action === 'decline' ? declineReason : undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Task ${action}d`);
      fetchTasks();
      setShowDeclineModal(false);
      setDeclineReason('');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  // return (
  //   <div className="p-8">
  //     <h1 className="text-4xl font-bold text-center mb-12">Pending Task Posts</h1>

  //     {loading ? (
  //       <p className="text-center py-20 text-xl">Loading...</p>
  //     ) : tasks.length === 0 ? (
  //       <p className="text-center py-20 text-2xl text-gray-600">No pending tasks</p>
  //     ) : (
  //       <div className="space-y-8">
  //         {tasks.map(task => (
  //           <motion.div
  //             key={task._id}
  //             whileHover={{ scale: 1.02 }}
  //             className="bg-white rounded-3xl shadow-xl p-8"
  //           >
  //             <div className="flex justify-between items-start mb-6">
  //               <div className="flex items-center gap-4">
  //                 <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
  //                   <Users className="h-10 w-10 text-purple-600" />
  //                 </div>
  //                 <div>
  //                   <h3 className="text-2xl font-bold">{task.client.firstName} {task.client.lastName}</h3>
  //                   <p className="text-gray-600">Visibility: <strong className="capitalize">{task.visibility}</strong></p>
  //                 </div>
  //               </div>
  //               <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto">
  //                 <button
  //                   onClick={() => handleAction(task._id, 'approve')}
  //                   className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
  //                 >
  //                   <CheckCircle className="h-6 w-6" />
  //                   Approve
  //                 </button>
  //                 <button
  //                   onClick={() => {
  //                     setSelectedTask(task);
  //                     setShowDeclineModal(true);
  //                   }}
  //                   className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2"
  //                 >
  //                   <XCircle className="h-6 w-6" />
  //                   Decline
  //                 </button>
  //               </div>
  //             </div>

  //             <div className="bg-gray-50 p-6 rounded-2xl">
  //               <p className="text-lg text-gray-800 leading-relaxed">{task.description}</p>
  //               <p className="text-sm text-gray-500 mt-4">
  //                 Posted: {new Date(task.postedAt).toLocaleDateString()}
  //               </p>
  //             </div>
  //           </motion.div>
  //         ))}
  //       </div>
  //     )}

  //     {/* Decline Modal */}
  //     {showDeclineModal && selectedTask && (
  //       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  //         <motion.div className="bg-white rounded-3xl p-8 max-w-md w-full">
  //           <h3 className="text-2xl font-bold mb-4">Decline Task?</h3>
  //           <textarea
  //             value={declineReason}
  //             onChange={(e) => setDeclineReason(e.target.value)}
  //             placeholder="Reason (optional)"
  //             className="w-full p-4 border rounded-xl mb-6"
  //             rows="4"
  //           />
  //           <div className="flex gap-4">
  //             <button onClick={() => setShowDeclineModal(false)} className="flex-1 py-3 bg-gray-200 rounded-xl">
  //               Cancel
  //             </button>
  //             <button
  //               onClick={() => handleAction(selectedTask._id, 'decline')}
  //               className="flex-1 py-3 bg-red-600 text-white rounded-xl"
  //             >
  //               Confirm Decline
  //             </button>
  //           </div>
  //         </motion.div>
  //       </div>
  //     )}
  //   </div>
  // );

return (
  <div className="p-4 sm:p-8">
    <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">Pending Task Posts</h1>

    {loading ? (
      <p className="text-center py-20 text-lg sm:text-xl">Loading...</p>
    ) : tasks.length === 0 ? (
      <p className="text-center py-20 text-xl sm:text-2xl text-gray-600">No pending tasks</p>
    ) : (
      <div className="space-y-6 sm:space-y-8">
        {tasks.map(task => (
          <motion.div
            key={task._id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 sm:mb-6">
              {/* Client Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    {task.client.firstName} {task.client.lastName}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Visibility: <strong className="capitalize">{task.visibility}</strong>
                  </p>
                </div>
              </div>

              {/* Buttons - Stack on mobile, side-by-side on desktop */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto mt-4 sm:mt-0">
                <button
                  onClick={() => handleAction(task._id, 'approve')}
                  className="flex-1 sm:flex-none px-6 py-3.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow transition-all flex items-center justify-center gap-2 text-base sm:text-base active:scale-95"
                >
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowDeclineModal(true);
                  }}
                  className="flex-1 sm:flex-none px-6 py-3.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow transition-all flex items-center justify-center gap-2 text-base sm:text-base active:scale-95"
                >
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  Decline
                </button>
              </div>
            </div>

            {/* Task Description */}
            <div className="bg-gray-50 p-5 sm:p-6 rounded-xl sm:rounded-2xl mt-5 sm:mt-0">
              <p className="text-base sm:text-lg text-gray-800 leading-relaxed">{task.description}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-4">
                Posted: {new Date(task.postedAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    )}

    {/* Decline Modal - unchanged but made responsive */}
    {showDeclineModal && selectedTask && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full"
        >
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Decline Task?</h3>
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Reason (optional)"
            className="w-full p-4 border rounded-xl mb-6 text-sm sm:text-base"
            rows="4"
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowDeclineModal(false)}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition text-base sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAction(selectedTask._id, 'decline')}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition text-base sm:text-base"
            >
              Confirm Decline
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </div>
);
};

export default AdminTasks;