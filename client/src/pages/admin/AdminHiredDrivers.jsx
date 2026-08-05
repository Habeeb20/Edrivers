// /* eslint-disable no-unused-vars */
// // src/pages/Admin/AdminHiredDrivers.jsx
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Users, Car, DollarSign, Clock } from 'lucide-react';
// import axios from 'axios';
// import { toast } from 'sonner';

// const AdminHiredDrivers = () => {
//   const [hires, setHires] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const token = localStorage.getItem('adminToken');

//   useEffect(() => {
//     fetchHires();
//   }, []);

//   const fetchHires = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/hires`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setHires(res.data.hiredDrivers || []);
//       console.log(res.data.hiredDrivers);
//     } catch (err) {
//       toast.error('Failed to load hires');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
//       <h1 className="text-4xl font-bold mb-8">All Hired Drivers</h1>

//       {loading ? (
//         <p className="text-center py-20">Loading...</p>
//       ) : hires.length === 0 ? (
//         <p className="text-center py-20 text-2xl text-gray-600">No hires yet</p>
//       ) : (
//         <div className="grid gap-8">
//           {hires.map(hire => (
//             <div className="bg-white rounded-2xl shadow-lg p-8">
//               <div className="flex justify-between">
//                 <div>
//                   <h3 className="text-2xl font-bold">Driver: {hire.driver.firstName} {hire.driver.lastName}</h3>
//                   <p className="text-gray-600">Hired by: {hire.activeHires.client} {hire.client}</p>
//                 </div>
//                 <p className="text-gray-600">Status: {hire.status}</p>
//               </div>
//               <div className="mt-4 space-y-2">
//                 <p><DollarSign className="inline mr-2" />Amount: ₦{hire.amountOffered}</p>
//                 <p><Clock className="inline mr-2" />Duration: {hire.durationHours} hours</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default AdminHiredDrivers;







/* eslint-disable no-unused-vars */
// src/pages/Admin/AdminHiredDrivers.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, User, Mail, Phone, Car, DollarSign, Clock, UserCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminHiredDrivers = () => {
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('adminToken'); // or your admin token key

  useEffect(() => {
    fetchHires();
  }, []);

  const fetchHires = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/hires`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHires(res.data.hiredDrivers || []);
      console.log('Loaded hired drivers:', res.data.hiredDrivers);
    } catch (err) {
      console.error('Failed to load hires:', err);
      toast.error('Failed to load hired drivers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 bg-gray-50 min-h-screen"
    >
      <h1 className="text-4xl font-bold mb-10 text-gray-900 flex items-center gap-4">
        <Users className="h-10 w-10 text-indigo-600" />
        All Hired Drivers
      </h1>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Loading all active hires...</p>
        </div>
      ) : hires.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-lg p-12">
          <Users className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <p className="text-3xl font-medium text-gray-700">No drivers currently hired</p>
          <p className="text-lg text-gray-500 mt-3">Active driver hires will appear here</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {hires.map((hireGroup) => (
            <motion.div
              key={hireGroup.driver._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow"
            >
              {/* Driver Header */}
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                    {hireGroup.driver.name?.slice(0, 2) || '?'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{hireGroup.driver.name}</h3>
                    <p className="text-indigo-100 text-sm">Driver</p>
                  </div>
                </div>
              </div>

              {/* Hire Details */}
              <div className="p-6 space-y-6">
                {hireGroup.activeHires.map((hire, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-indigo-700">{hire.type}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Status: <span className="font-medium text-green-600">{hire.status}</span>
                        </p>
                      </div>
                      <span className="px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        {hire.type === 'Short-term Hire' ? 'Classic' : hire.type}
                      </span>
                    </div>

                    {/* Client Info */}
                    <div className="space-y-3 text-gray-700">
                      <p className="flex items-center gap-3">
                        <User className="h-5 w-5 text-indigo-600" />
                        <span className="font-medium">Client:</span> {hire.client.name || 'Client (name missing)'}
                      </p>
                      <p className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-indigo-600" />
                        <span className="font-medium">Email:</span> {hire.client.email || 'N/A'}
                      </p>
                      <p className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-indigo-600" />
                        <span className="font-medium">Phone:</span> {hire.client.phone || 'N/A'}
                      </p>
                    </div>

                    {/* Hire Details */}
                    <div className="mt-5 pt-5 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                      {hire.durationHours && (
                        <div>
                          <p className="text-gray-500">Duration</p>
                          <p className="font-medium">{hire.durationHours} hours</p>
                        </div>
                      )}
                      {hire.amountOffered && (
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-medium">₦{hire.amountOffered.toLocaleString()}</p>
                        </div>
                      )}
                      {hire.amountPaid && (
                        <div>
                          <p className="text-gray-500">Paid</p>
                          <p className="font-medium">₦{hire.amountPaid.toLocaleString()}</p>
                        </div>
                      )}
                      {hire.startedAt && (
                        <div>
                          <p className="text-gray-500">Started</p>
                          <p className="font-medium">
                            {new Date(hire.startedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AdminHiredDrivers;