// // src/pages/Client/HireOnDemandDrivers.jsx
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   Car, 
//   Star, 
//   MapPin, 
//   Clock, 
//   Calendar, 
//   DollarSign, 
//   Gauge,
//   X,
//   Users,
//   Globe
// } from 'lucide-react';
// import axios from 'axios';
// import { toast } from 'sonner';
// import { format } from 'date-fns';
// import { useSearchParams } from 'react-router-dom';
// const HireOnDemandDrivers = () => {
//     const searchParams = useSearchParams()
//   const [drivers, setDrivers] = useState([]);
//   const [filteredDrivers, setFilteredDrivers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [showHireModal, setShowHireModal] = useState(false);
//   const [activeTab, setActiveTab] = useState('all'); // 'all', 'within-state', 'interstate'

//   const token = localStorage.getItem('token');
//   const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

//   const [form, setForm] = useState({
//     durationHours: '',
//     transmission: 'automatic',
//     amountOffered: '',
//     pickupTime: '',
//     pickupLocation: '',
//     startDate: '',
//     endDate: '',
//   });

//   useEffect(() => {
//     fetchDrivers();
//   }, []);


//   const fetchDrivers = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/drivers`, axiosConfig);
//       const approvedDrivers = res.data.drivers || [];
//       setDrivers(approvedDrivers);
//       console.log(approvedDrivers)
//       filterDrivers('all', approvedDrivers);
//     } catch (err) {
//       toast.error('Failed to load drivers');
//     } finally {
//       setLoading(false);
//     }
//   };


//   const filterDrivers = (tab, allDrivers = drivers) => {
//     setActiveTab(tab);
//     if (tab === 'all') {
//       setFilteredDrivers(allDrivers);
//     } else {
//       setFilteredDrivers(allDrivers.filter(d => d.hireOnDemand.plan === tab));
//     }
//   };

//   const handleHire = async () => {
//     const required = ['durationHours', 'amountOffered', 'pickupTime', 'pickupLocation', 'startDate', 'endDate'];
//     if (required.some(field => !form[field])) {
//       toast.error('Please fill all required fields');
//       return;
//     }

//     try {
//       await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/request`,
//         {
//           driverId: selectedDriver._id,
//           ...form,
//           travelType: selectedDriver.hireOnDemand.plan,
//           serviceLevel: selectedDriver.hireOnDemand.serviceLevel,
//         },
//         axiosConfig
//       );
//       toast.success('Hire request sent! Awaiting driver response.');
//       setShowHireModal(false);
//       setForm({
//         durationHours: '',
//         transmission: 'automatic',
//         amountOffered: '',
//         pickupTime: '',
//         pickupLocation: '',
//         startDate: '',
//         endDate: '',
//       });
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to send request');
//     }

//      try {
//     const res = await axios.post(
//       `${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/hire/request`,
//       { driverId: selectedDriver._id },
//       axiosConfig
//     );

//     // Redirect to Paystack
//     window.location.href = res.data.authorization_url;
//   } catch (err) {
//     toast.error(err.response?.data?.message || 'Failed to start hire');
//   }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
//       <div className="max-w-7xl mx-auto">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center mb-12"
//         >
//           <h1 className="text-3xl font-bold text-gray-900 mb-4">
//             Hire a Premium Driver On Demand
//           </h1>
//           <p className="text-xl text-gray-600 max-w-4xl mx-auto">
//             Choose from our verified professional drivers for short or long trips
//           </p>
//         </motion.div>

//         {/* Tabs */}
//         <div className="flex justify-center mb-12">
//           <div className="inline-flex bg-white rounded-2xl shadow-lg p-2">
//             <button
//               onClick={() => filterDrivers('all')}
//               className={`px-8 py-4 rounded-xl font-semibold transition-all ${
//                 activeTab === 'all' 
//                   ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
//                   : 'text-gray-700 hover:bg-gray-100'
//               }`}
//             >
//               <Users className="inline h-5 w-5 mr-2" />
//               All Drivers
//             </button>
//             <button
//               onClick={() => filterDrivers('within-state')}
//               className={`px-8 py-4 rounded-xl font-semibold transition-all ${
//                 activeTab === 'within-state' 
//                   ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
//                   : 'text-gray-700 hover:bg-gray-100'
//               }`}
//             >
//               <MapPin className="inline h-5 w-5 mr-2" />
//               Within State
//             </button>
//             <button
//               onClick={() => filterDrivers('interstate')}
//               className={`px-8 py-4 rounded-xl font-semibold transition-all ${
//                 activeTab === 'interstate' 
//                   ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
//                   : 'text-gray-700 hover:bg-gray-100'
//               }`}
//             >
//               <Globe className="inline h-5 w-5 mr-2" />
//               Interstate
//             </button>
//           </div>
//         </div>

//         {loading ? (
//           <div className="text-center py-20">
//             <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
//             <p className="mt-6 text-xl text-gray-600">Loading premium drivers...</p>
//           </div>
//         ) : filteredDrivers.length === 0 ? (
//           <div className="text-center py-20">
//             <p className="text-2xl text-gray-600">No drivers available in this category yet</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//             {filteredDrivers.map((driver) => (
//               <motion.div
//                 key={driver._id}
//                 whileHover={{ y: -10, scale: 1.03 }}
//                 className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100"
//               >
//                 <div className="relative h-56 bg-gradient-to-br from-blue-500 to-purple-600">
//                   <div className="absolute inset-0 bg-black/20"></div>
//                   <img
//                     src={driver.avatar || '/default-avatar.jpg'}
//                     alt={driver.firstName}
//                     className="w-32 h-32 rounded-full border-8 border-white absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 object-cover shadow-2xl"
//                   />
//                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-purple-700">
//                     {driver.subscription.serviceLevel}
//                   </div>
//                 </div>

//                 <div className="pt-20 px-6 pb-8 text-center">
//                   <h3 className="text-2xl font-bold text-gray-900">
//                     {driver.firstName} {driver.lastName}
//                   </h3>
//                   <p className="text-lg text-purple-600 mt-1 flex items-center justify-center gap-2">
//                     <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
//                     {driver.rating?.toFixed(1) || '5.0'} ({driver.totalTrips || 0} trips)
//                   </p>

//                   <div className="mt-6 space-y-3 text-gray-700">
//                     <p className="flex items-center justify-center gap-2">
//                       <Car className="h-5 w-5" />
//                       {driver.vehicle?.make} {driver.vehicle?.model}
//                     </p>
//                     <p className="flex items-center justify-center gap-2">
//                       <MapPin className="h-5 w-5" />
//                       {driver.subscription.package.replace('-', ' ')}
//                     </p>
//                   </div>

//                   <button
//                     onClick={() => {
//                       setSelectedDriver(driver);
//                       setShowHireModal(true);
//                     }}
//                     className="mt-8 w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition"
//                   >
//                     Hire This Driver
//                   </button>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Hire Modal */}
//       {showHireModal && selectedDriver && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
//           >
//             <button
//               onClick={() => setShowHireModal(false)}
//               className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
//             >
//               <X className="h-6 w-6" />
//             </button>

//             <h2 className="text-3xl font-bold text-center mb-8">
//               Hire {selectedDriver.firstName} {selectedDriver.lastName}
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
//                   <Clock className="h-5 w-5 text-blue-600" />
//                   Duration (hours)
//                 </label>
//                 <input
//                   type="number"
//                   value={form.durationHours}
//                   onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
//                   className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//                   placeholder="e.g. 8"
//                 />
//               </div>

//               <div>
//                 <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
//                   <Gauge className="h-5 w-5 text-purple-600" />
//                   Gear Transmission
//                 </label>
//                 <select
//                   value={form.transmission}
//                   onChange={(e) => setForm({ ...form, transmission: e.target.value })}
//                   className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="automatic">Automatic</option>
//                   <option value="manual">Manual</option>
//                   <option value="both">Both</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
//                   <DollarSign className="h-5 w-5 text-green-600" />
//                   Amount Offered (₦)
//                 </label>
//                 <input
//                   type="number"
//                   value={form.amountOffered}
//                   onChange={(e) => setForm({ ...form, amountOffered: e.target.value })}
//                   className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//                   placeholder="e.g. 50000"
//                 />
//               </div>

//               <div>
//                 <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
//                   <Clock className="h-5 w-5 text-indigo-600" />
//                   Pickup Time
//                 </label>
//                 <input
//                   type="time"
//                   value={form.pickupTime}
//                   onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
//                   className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
//                   <MapPin className="h-5 w-5 text-red-600" />
//                   Pickup Location
//                 </label>
//                 <input
//                   type="text"
//                   value={form.pickupLocation}
//                   onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
//                   className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//                   placeholder="Full address"
//                 />
//               </div>

//               <div>
//                 <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
//                   <Calendar className="h-5 w-5 text-teal-600" />
//                   Start Date
//                 </label>
//                 <input
//                   type="date"
//                   value={form.startDate}
//                   onChange={(e) => setForm({ ...form, startDate: e.target.value })}
//                   className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
//                   <Calendar className="h-5 w-5 text-orange-600" />
//                   End Date
//                 </label>
//                 <input
//                   type="date"
//                   value={form.endDate}
//                   onChange={(e) => setForm({ ...form, endDate: e.target.value })}
//                   className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <button
//               onClick={handleHire}
//               className="mt-10 w-full py-6 bg-gradient-to-r from-green-600 to-teal-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition"
//             >
//               Send Hire Request
//             </button>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HireOnDemandDrivers;








// src/pages/Client/HireOnDemandDrivers.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Star,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Gauge,
  X,
  Users,
  Globe,
  Phone,
  BadgeCheck,
  ShieldCheck,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';

const MIDNIGHT = '#0B1220';
const EMERALD = '#1F8A5F';
const AMBER = '#C8890B';
const CORAL = '#C4491F';

const PLAN_TABS = [
  { value: 'all', label: 'All Drivers', icon: Users },
  { value: 'within-state', label: 'Within State', icon: MapPin },
  { value: 'interstate', label: 'Interstate', icon: Globe },
];

const HireOnDemandDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const [form, setForm] = useState({
    durationHours: '',
    transmission: 'automatic',
    amountOffered: '',
    pickupTime: '',
    pickupLocation: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/drivers`, axiosConfig);
      const approvedDrivers = res.data.drivers || [];
      setDrivers(approvedDrivers);
      console.log(approvedDrivers)
      applyFilter('all', approvedDrivers);
    } catch (err) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  // Matches the real shape returned by the backend: driver.subscription.package
  // (was previously reading a nonexistent driver.hireOnDemand.plan field)
  const applyFilter = (tab, allDrivers = drivers) => {
    setActiveTab(tab);
    if (tab === 'all') {
      setFilteredDrivers(allDrivers);
    } else {
      setFilteredDrivers(allDrivers.filter((d) => d.subscription?.package === tab));
    }
  };

  const openHireModal = (driver) => {
    if (!driver.isAvailable) {
      toast.error(`${driver.firstName} isn't taking new bookings right now.`);
      return;
    }
    setSelectedDriver(driver);
    setShowHireModal(true);
  };

  const handleHire = async () => {
    const required = ['durationHours', 'amountOffered', 'pickupTime', 'pickupLocation', 'startDate', 'endDate'];
    if (required.some((field) => !form[field])) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire-on-demand/request`,
        {
          driverId: selectedDriver._id,
          ...form,
          travelType: selectedDriver.subscription?.package,
          serviceLevel: selectedDriver.subscription?.serviceLevel,
        },
        axiosConfig
      );
      toast.success('Hire request sent! Awaiting driver response.');
      setShowHireModal(false);
      setForm({
        durationHours: '',
        transmission: 'automatic',
        amountOffered: '',
        pickupTime: '',
        pickupLocation: '',
        startDate: '',
        endDate: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return null;
    try {
      return format(new Date(value), 'MMM yyyy');
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F4F6F8' }}>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 sm:pt-14 sm:pb-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-2 text-amber-300"
          >
            On-Demand · Verified · Nigeria-wide
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white"
          >
            Hire a Premium Driver, On Demand
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm text-indigo-100 max-w-xl mx-auto mt-2.5"
          >
            Every driver below is verified, available now, and approved for on-demand hire.
          </motion.p>

          {/* Segmented plan filter */}
          <div className="mt-6 sm:mt-8 flex justify-center">
            <div className="inline-flex flex-wrap justify-center gap-1 bg-white/10 backdrop-blur rounded-2xl p-1.5 border border-white/10">
              {PLAN_TABS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => applyFilter(value)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === value ? 'text-indigo-700 bg-white shadow-lg' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-white border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto" />
                  <div className="h-24 bg-slate-100 rounded-xl mt-4" />
                  <div className="h-11 bg-slate-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-24">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: '#EAEFF3' }}
            >
              <Car className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-xl font-bold text-slate-900">No drivers on this plan yet</p>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              Try a different plan above, or check back shortly — new drivers are approved regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredDrivers.map((driver, idx) => {
              const memberSince = formatDate(driver.subscription?.approvedAt || driver.subscription?.subscribedAt);
              const expiresOn = formatDate(driver.subscription?.expiresAt);
              const activeRequests = driver.subscription?.onDemandDetails?.hireOnDemandRequests?.length || 0;
              const planLabel = (driver.subscription?.package || '').replace('-', ' ');
              const serviceLevel = driver.subscription?.serviceLevel;
              const planStatus = driver.subscription?.subscriptionStatus;

              return (
                <motion.div
                  key={driver._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                  whileHover={{ y: -6 }}
                  className="group rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  {/* Avatar / status header */}
                  <div className="relative pt-8 pb-14 flex flex-col items-center bg-gradient-to-b from-slate-50 to-white">
                    {serviceLevel && (
                      <span
                        className="absolute top-4 right-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                        style={{ background: MIDNIGHT }}
                      >
                        {serviceLevel}
                      </span>
                    )}

                    <div className="relative">
                      <div
                        className="absolute -inset-1 rounded-full"
                        style={{
                          boxShadow: `0 0 0 3px ${driver.isAvailable ? EMERALD : '#CBD5E1'}`,
                        }}
                      />
                      <img
                        src={driver.avatar || '/default-avatar.jpg'}
                        alt={`${driver.firstName} ${driver.lastName}`}
                        className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      />
                      {driver.isCertified && (
                        <span
                          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white"
                          style={{ background: AMBER }}
                          title="Certified driver"
                        >
                          <BadgeCheck className="h-4 w-4 text-white" />
                        </span>
                      )}
                    </div>

                    <span
                      className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        driver.isAvailable ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${driver.isAvailable ? 'animate-pulse' : ''}`}
                        style={{ background: driver.isAvailable ? EMERALD : '#94A3B8' }}
                      />
                      {driver.isAvailable ? 'Available now' : 'Currently unavailable'}
                    </span>
                  </div>

                  {/* Identity */}
                  <div className="px-6 text-center -mt-6">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                      {driver.firstName}
                    </h3>
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                      {driver.firstName} {driver.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {driver.lga} {driver.state}
                    </p>
                  </div>

                  {/* Stat strip */}
                  <div className="grid grid-cols-3 gap-2 px-6 mt-5">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 font-mono text-lg font-bold text-slate-900">
                        <Star className="h-4 w-4 fill-current" style={{ color: AMBER }} />
                        {(driver.rating || 0).toFixed(1)}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wide">Rating</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <div className="font-mono text-lg font-bold text-slate-900">
                        {driver.totalTrips > 0 ? driver.totalTrips : 'New'}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wide">
                        {driver.totalTrips > 0 ? 'Trips' : 'Driver'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="font-mono text-lg font-bold text-slate-900">{activeRequests}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wide">Requests</p>
                    </div>
                  </div>

                  {/* Vehicle — styled as a number plate */}
                  <div className="px-6 mt-5">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-700 text-sm font-medium mb-3">
                        <Car className="h-4 w-4" style={{ color: MIDNIGHT }} />
                        {driver.vehicle?.color} {driver.vehicle?.make} {driver.vehicle?.model}
                        {driver.vehicle?.year ? ` · ${driver.vehicle.year}` : ''}
                      </div>

                      {driver.vehicle?.licensePlate && (
                        <div className="flex items-stretch rounded-md overflow-hidden border-2 border-slate-900 bg-white w-fit mx-auto shadow-sm">
                          <div className="w-2" style={{ background: EMERALD }} />
                          <div className="px-3 py-1.5">
                            <span className="font-mono font-extrabold tracking-widest text-slate-900 text-sm">
                              {driver.vehicle.licensePlate.toUpperCase()}
                            </span>
                          </div>
                          <div className="w-2" style={{ background: EMERALD }} />
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-3">
                        {driver.vehicle?.capacity && <span>{driver.vehicle.capacity} seats</span>}
                        {planLabel && <span className="capitalize">{planLabel}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Membership caption */}
                  {(memberSince || planStatus) && (
                    <div className="text-center mt-4 px-6 space-y-1">
                      {memberSince && (
                        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                          <ShieldCheck className="h-3.5 w-3.5" style={{ color: EMERALD }} />
                          Verified driver since {memberSince}
                        </p>
                      )}
                      {planStatus && (
                        <p className="text-[11px] text-slate-400 capitalize">
                          {planStatus} plan{expiresOn ? ` · renews ${expiresOn}` : ''}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-6 pb-6 pt-5 mt-auto flex gap-2">
                    {driver.phone && (
                      <a
                        href={`tel:${driver.phone}`}
                        className="flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition shrink-0"
                        title={`Call ${driver.firstName}`}
                      >
                        <Phone className="h-5 w-5" />
                      </a>
                    )}
                    <button
                      onClick={() => openHireModal(driver)}
                      disabled={!driver.isAvailable}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm sm:text-base transition shadow-sm ${
                        driver.isAvailable
                          ? 'text-white hover:shadow-lg'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                      style={driver.isAvailable ? { background: MIDNIGHT } : undefined}
                    >
                      {driver.isAvailable ? 'Reserve Driver' : 'Unavailable'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Hire Modal ── */}
      <AnimatePresence>
        {showHireModal && selectedDriver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 relative my-6"
            >
              <button
                onClick={() => setShowHireModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <img
                  src={selectedDriver.avatar || '/default-avatar.jpg'}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                    Reserve {selectedDriver.firstName} {selectedDriver.lastName}
                  </h2>
                  <p className="text-sm text-slate-500 capitalize">
                    {selectedDriver.subscription?.package?.replace('-', ' ')} · {selectedDriver.subscription?.serviceLevel}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700">
                    <Clock className="h-4 w-4" style={{ color: MIDNIGHT }} />
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={form.durationHours}
                    onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
                    className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
                    placeholder="e.g. 8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700">
                    <Gauge className="h-4 w-4" style={{ color: MIDNIGHT }} />
                    Gear Transmission
                  </label>
                  <select
                    value={form.transmission}
                    onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                    className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition bg-white"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700">
                    <DollarSign className="h-4 w-4" style={{ color: EMERALD }} />
                    Amount Offered (₦)
                  </label>
                  <input
                    type="number"
                    value={form.amountOffered}
                    onChange={(e) => setForm({ ...form, amountOffered: e.target.value })}
                    className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
                    placeholder="e.g. 50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700">
                    <Clock className="h-4 w-4" style={{ color: MIDNIGHT }} />
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    value={form.pickupTime}
                    onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
                    className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700">
                    <MapPin className="h-4 w-4" style={{ color: CORAL }} />
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={form.pickupLocation}
                    onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                    className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
                    placeholder="Full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700">
                    <Calendar className="h-4 w-4" style={{ color: MIDNIGHT }} />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700">
                    <Calendar className="h-4 w-4" style={{ color: AMBER }} />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
                  />
                </div>
              </div>

              <button
                onClick={handleHire}
                disabled={submitting}
                className="mt-8 w-full py-4 sm:py-5 text-white text-base sm:text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: EMERALD }}
              >
                {submitting ? 'Sending Request…' : 'Send Hire Request'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HireOnDemandDrivers;