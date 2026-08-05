// // src/components/admin/DriverActivation.jsx
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   CheckCircle, 
//   XCircle, 
//   UserCheck, 
//   UserX, 
//   RefreshCw, 
//   AlertTriangle,
//   ShieldCheck,
//   Loader2
// } from 'lucide-react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast'; // or your toast library

// const DriverActivation = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState({});
//   const [error, setError] = useState(null);

//   // Fetch all drivers
//   const fetchDrivers = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const res = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('adminToken')}`, // adjust token key
//           },
//         }
//       );

//       // Filter only drivers
//       const driverList = res.data.users.filter(u => u.role === 'driver');
//       setDrivers(driverList);
//     } catch (err) {
//       console.error('Failed to fetch drivers:', err);
//       setError('Failed to load drivers. Please try again.');
//       toast.error('Could not load driver list');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDrivers();
//   }, []);

//   // Toggle driver status (activate / deactivate)
//   const toggleDriverStatus = async (driverId, currentStatus) => {
//     const newStatus = currentStatus === 'active' ? 'pending' : 'active';
//     const action = newStatus === 'active' ? 'activate' : 'deactivate';

//     if (!window.confirm(`Are you sure you want to ${action} this driver?`)) {
//       return;
//     }

//     try {
//       setActionLoading(prev => ({ ...prev, [driverId]: true }));

//       await axios.put(
//         `${import.meta.env.VITE_BACKEND_URL}/api/admin/drivers/${driverId}/${action}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
//           },
//         }
//       );

//       // Update local state
//       setDrivers(prev =>
//         prev.map(d =>
//           d._id === driverId ? { ...d, status: newStatus } : d
//         )
//       );

//       toast.success(`Driver ${action}d successfully`);
//     } catch (err) {
//       console.error(`Failed to ${action} driver:`, err);
//       toast.error(`Failed to ${action} driver`);
//     } finally {
//       setActionLoading(prev => ({ ...prev, [driverId]: false }));
//     }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
//           <p className="text-gray-600 font-medium">Loading drivers...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
//         <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//         <h3 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h3>
//         <p className="text-red-600 mb-6">{error}</p>
//         <button
//           onClick={fetchDrivers}
//           className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//         >
//           <RefreshCw size={18} />
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
//             Driver Activation Management
//           </h2>
//           <p className="text-gray-600 mt-1">
//             Activate or deactivate drivers to control who can receive hire requests.
//           </p>
//         </div>

//         <button
//           onClick={fetchDrivers}
//           className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
//         >
//           <RefreshCw size={18} />
//           Refresh List
//         </button>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Driver
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Email
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Phone
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Verification
//                 </th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {drivers.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
//                     No drivers found in the system.
//                   </td>
//                 </tr>
//               ) : (
//                 drivers.map((driver) => {
//                   const isActive = driver.status === 'active';
//                   const isLoading = actionLoading[driver._id];

//                   return (
//                     <motion.tr
//                       key={driver._id}
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="hover:bg-gray-50 transition-colors"
//                     >
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-10 w-10">
//                             <img
//                               className="h-10 w-10 rounded-full object-cover"
//                               src={driver.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(driver.firstName + ' ' + driver.lastName)}
//                               alt=""
//                             />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">
//                               {driver.firstName} {driver.lastName}
//                             </div>
//                             <div className="text-sm text-gray-500">
//                               ID: {driver.userId?.slice(0, 8)}...
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {driver.email}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {driver.phone || '—'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           driver.verificationStatus === 'verified'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {driver.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                           isActive
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-red-100 text-red-800'
//                         }`}>
//                           {isActive ? (
//                             <>
//                               <CheckCircle size={14} className="mr-1.5" />
//                               Active
//                             </>
//                           ) : (
//                             <>
//                               <XCircle size={14} className="mr-1.5" />
//                               Inactive
//                             </>
//                           )}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <button
//                           onClick={() => toggleDriverStatus(driver._id, driver.status)}
//                           disabled={isLoading}
//                           className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
//                             isActive
//                               ? 'bg-red-50 text-red-700 hover:bg-red-100'
//                               : 'bg-green-50 text-green-700 hover:bg-green-100'
//                           } disabled:opacity-50 disabled:cursor-not-allowed`}
//                         >
//                           {isLoading ? (
//                             <Loader2 size={16} className="animate-spin" />
//                           ) : isActive ? (
//                             <UserX size={16} />
//                           ) : (
//                             <UserCheck size={16} />
//                           )}
//                           {isLoading ? 'Processing...' : isActive ? 'Deactivate' : 'Activate'}
//                         </button>
//                       </td>
//                     </motion.tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Footer summary */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div className="text-gray-700">
//             Showing <strong>{drivers.length}</strong> drivers
//           </div>
//           <button
//             onClick={fetchDrivers}
//             className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
//           >
//             <RefreshCw size={18} />
//             Refresh Drivers
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DriverActivation;









// src/components/admin/DriverActivation.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Star,
  Car,
  Calendar,
  BadgeCheck
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DriverActivation = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null); // for details modal

  // Fetch all drivers
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      const driverList = res.data.users.filter(u => u.role === 'driver');
      setDrivers(driverList);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
      setError('Failed to load drivers. Please try again.');
      toast.error('Could not load driver list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Toggle driver status (activate / deactivate)
  const toggleDriverStatus = async (driverId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'pending' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${action} this driver?`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [driverId]: true }));

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/drivers/${driverId}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      setDrivers(prev =>
        prev.map(d =>
          d._id === driverId ? { ...d, status: newStatus } : d
        )
      );

      toast.success(`Driver ${action}d successfully`);
    } catch (err) {
      console.error(`Failed to ${action} driver:`, err);
      toast.error(`Failed to ${action} driver`);
    } finally {
      setActionLoading(prev => ({ ...prev, [driverId]: false }));
    }
  };

  // Open driver details modal
  const openDriverDetails = (driver) => {
    setSelectedDriver(driver);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading drivers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={fetchDrivers}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Driver Activation Management
          </h2>
          <p className="text-gray-600 mt-1">
            Activate or deactivate drivers to control who can receive hire requests.
          </p>
        </div>

        <button
          onClick={fetchDrivers}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
        >
          <RefreshCw size={18} />
          Refresh List
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    No drivers found in the system.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => {
                  const isActive = driver.status === 'active';
                  const isLoading = actionLoading[driver._id];

                  return (
                    <motion.tr
                      key={driver._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={driver.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(driver.firstName + ' ' + driver.lastName)}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {driver.firstName} {driver.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {driver.userId?.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {driver.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {driver.phone || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          driver.verificationStatus === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {driver.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isActive ? (
                            <>
                              <CheckCircle size={14} className="mr-1.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="mr-1.5" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          {/* View Details Button */}
                          <button
                            onClick={() => openDriverDetails(driver)}
                            className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>

                          {/* Activate/Deactivate Button */}
                          <button
                            onClick={() => toggleDriverStatus(driver._id, driver.status)}
                            disabled={isLoading}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              isActive
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isLoading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : isActive ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                            {isLoading ? 'Processing...' : isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Details Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-4 right-4 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <XCircle size={24} className="text-gray-600" />
            </button>

            <div className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                <img
                  src={selectedDriver.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedDriver.firstName + ' ' + selectedDriver.lastName)}
                  alt=""
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 shadow-xl"
                />
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {selectedDriver.firstName} {selectedDriver.lastName}
                  </h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                      selectedDriver.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDriver.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                      selectedDriver.verificationStatus === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedDriver.verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'}
                    </span>
                    {selectedDriver.isCertified && (
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        <ShieldCheck size={16} className="mr-1" /> Certified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact & Personal */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <UserCheck className="h-6 w-6 text-indigo-600" /> Contact Information
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p className="flex items-center gap-3">
                        <Mail size={18} /> {selectedDriver.email}
                      </p>
                      <p className="flex items-center gap-3">
                        <Phone size={18} /> {selectedDriver.phone || 'Not provided'}
                      </p>
                      <p className="flex items-center gap-3">
                        <Calendar size={18} /> Joined: {new Date(selectedDriver.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-green-600" /> Location
                    </h3>
                    <div className="text-gray-700">
                      <p>{selectedDriver.address || 'Address not provided'}</p>
                      {selectedDriver.state && <p>{selectedDriver.state}, {selectedDriver.lga}</p>}
                      <p>{selectedDriver.country}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle & Stats */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Car className="h-6 w-6 text-blue-600" /> Vehicle Information
                    </h3>
                    {selectedDriver.vehicle ? (
                      <div className="space-y-2 text-gray-700">
                        <p><strong>Make/Model:</strong> {selectedDriver.vehicle.make} {selectedDriver.vehicle.model}</p>
                        <p><strong>Year:</strong> {selectedDriver.vehicle.year}</p>
                        <p><strong>Color:</strong> {selectedDriver.vehicle.color}</p>
                        <p><strong>Plate:</strong> {selectedDriver.vehicle.licensePlate}</p>
                        <p><strong>Capacity:</strong> {selectedDriver.vehicle.capacity} passengers</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No vehicle registered</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Star className="h-6 w-6 text-yellow-500 fill-current" /> Performance Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-gray-700">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold">{selectedDriver.rating?.toFixed(1) || '—'}</p>
                        <p className="text-sm text-gray-600">Rating</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold">{selectedDriver.totalTrips || 0}</p>
                        <p className="text-sm text-gray-600">Total Trips</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="px-8 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-medium"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-gray-700">
            Showing <strong>{drivers.length}</strong> drivers
          </div>
          <button
            onClick={fetchDrivers}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <RefreshCw size={18} />
            Refresh Drivers
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverActivation;