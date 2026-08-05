// /* eslint-disable no-unused-vars */
// // src/pages/Driver/AvailableTasks.jsx
// import React, { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { FileText, Users, Clock } from 'lucide-react';
// import axios from 'axios';
// import { toast } from 'sonner';

// const AvailableTasks = () => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   const fetchTasks = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/available`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTasks(res.data.tasks || []);
//     } catch (err) {
//       toast.error('Failed to load tasks');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-8">
//       <h1 className="text-4xl font-bold mb-12 text-center">Available Tasks</h1>

//       {loading ? (
//         <p className="text-center py-20 text-xl">Loading tasks...</p>
//       ) : tasks.length === 0 ? (
//         <p className="text-center py-20 text-2xl text-gray-600">No tasks available</p>
//       ) : (
//         <div className="space-y-8">
//           {tasks.map(task => (
//             <motion.div
//               key={task._id}
//               whileHover={{ scale: 1.02 }}
//               className="bg-white rounded-3xl shadow-xl p-8"
//             >
//               <div className="flex items-center gap-4 mb-6">
//                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
//                   <Users className="h-10 w-10 text-blue-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-2xl font-bold">{task.client.firstName} {task.client.lastName}</h3>
//                   <p className="text-gray-600">Posted task</p>
//                 </div>
//               </div>

//               <div className="bg-gray-50 p-6 rounded-2xl">
//                 <p className="text-lg text-gray-800 leading-relaxed">{task.description}</p>
//                 <p className="text-sm text-gray-500 mt-4">
//                   Posted: {new Date(task.postedAt).toLocaleDateString()}
//                 </p>
//               </div>

//               <button className="mt-6 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
//                 Contact Client
//               </button>
//             </motion.div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AvailableTasks;



// src/pages/Driver/AvailableTasks.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Clock, Phone, Mail, MapPin, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const AvailableTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data.tasks || []);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const openClientDetails = (task) => {
    setSelectedTask(task);
    setShowClientModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-16 text-gray-900"
        >
          Available Tasks
        </motion.h1>

        {loading ? (
          <div className="text-center py-32">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-8 text-xl text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-6">📭</div>
            <p className="text-3xl text-gray-600">No tasks available right now</p>
            <p className="text-gray-500 mt-4">New tasks will appear here when clients post them</p>
          </div>
        ) : (
          <div className="space-y-12">
            {tasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100"
              >
                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                    <div className="flex items-center gap-6">
                      <img
                        src={task.client?.avatar || '/default-avatar.jpg'}
                        alt={task.client.firstName}
                        className="w-20 h-20 rounded-full object-cover border-4 border-purple-100 shadow-lg"
                      />
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {task.client.firstName} {task.client.lastName}
                        </h3>
                        <p className="text-lg text-gray-600 mt-1">Posted a new task</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500 flex items-center justify-end gap-2">
                        <Clock className="h-5 w-5" />
                        {new Date(task.postedAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl">
                    <div className="flex items-start gap-4 mb-4">
                      <FileText className="h-8 w-8 text-purple-600 flex-shrink-0 mt-1" />
                      <p className="text-lg text-gray-800 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-purple-700 font-medium">
                      <Users className="h-5 w-5" />
                      Visible to: <span className="capitalize font-bold">{task.visibility.replace('-', ' ')}</span>
                    </div>
                  </div>

                  <div className="mt-10 text-center">
                    <button
                      onClick={() => openClientDetails(task)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition transform hover:scale-105 flex items-center justify-center gap-4 mx-auto"
                    >
                      <Users className="h-4 w-4" />
                      Contact Client
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      {showClientModal && selectedTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-10 relative"
          >
            <button
              onClick={() => setShowClientModal(false)}
              className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>

            <div className="text-center mb-10">
              <img
                src={selectedTask.client.avatar || '/default-avatar.jpg'}
                alt={selectedTask.client.firstName}
                className="w-32 h-32 rounded-full mx-auto border-8 border-purple-100 shadow-2xl object-cover"
              />
              <h2 className="text-4xl font-bold mt-8 text-gray-900">
                {selectedTask.client.firstName} {selectedTask.client.lastName}
              </h2>
              <p className="text-xl text-purple-600 mt-3">Task Poster</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <p className="flex items-center gap-4 text-lg">
                    <Phone className="h-6 w-6 text-green-600" />
                    <span>{selectedTask.client.phone || 'Not provided'}</span>
                  </p>
                  <p className="flex items-center gap-4 text-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                    <span>{selectedTask.client.email}</span>
                  </p>
                  <p className="flex items-center gap-4 text-lg">
                    <MapPin className="h-6 w-6 text-red-600" />
                    <span>{selectedTask.client.address?.street || 'Address not shared'}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Task Summary</h3>
                <div className="bg-purple-50 p-6 rounded-2xl">
                  <p className="text-gray-800 leading-relaxed mb-4">
                    "{selectedTask.description}"
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <strong>Visible to:</strong> {selectedTask.visibility.replace('-', ' ')}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <strong>Posted:</strong> {new Date(selectedTask.postedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg text-gray-700 mb-6">
                Contact the client directly using the information above.
              </p>
              <button
                onClick={() => setShowClientModal(false)}
                className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AvailableTasks