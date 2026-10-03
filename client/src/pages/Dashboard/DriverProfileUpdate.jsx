



// /* eslint-disable no-unused-vars */
// // src/pages/Dashboard/DriverProfileUpdate.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { useForm } from 'react-hook-form';
// import { useSelector, useDispatch } from 'react-redux';
// import { toast } from 'sonner';
// import { motion } from 'framer-motion';
// import {
//   Car, DollarSign, Globe, Languages, Gauge, Calendar, CheckCircle, CheckCircle2, Circle,
// } from 'lucide-react';
// import axios from 'axios';

// const PRIMARY_500 = '#3B82F6';
// const PRIMARY_600 = '#2563EB';
// const PRIMARY_700 = '#1D4ED8';

// const DRIVER_CATEGORIES = [
//   'full-time', 'part-time', 'weekend', 'short-time', 'airport-pickup',
//   'outstation-travel', 'night-out-designated', 'executive-chauffeur',
//   'family-child-friendly', 'school-bus', 'tanker-hazmat', 'retained-monthly',
//   'pet-friendly', 'truck-driver', 'interstate-driver', 'long-haul-driver',
//   'delivery-driver', 'disabled-assistance-driver', 'bike-courier',
//   'medical-transport-driver', 'chauffeur-driver', 'personal-driver', 'corporate-driver',
// ];

// const TRANSMISSIONS = ['automatic', 'manual', 'both'];
// const LANGUAGES = ['English', 'Spanish', 'French', 'Hindi', 'Arabic', 'Mandarin', 'Yoruba', 'Igbo', 'Hausa', 'Portuguese'];

// const SectionCard = ({ icon: Icon, iconColor = 'text-blue-600', title, children }) => (
//   <section className="bg-white rounded-2xl sm:rounded-3xl shadow-sm sm:shadow-lg border border-gray-100 p-5 sm:p-8">
//     <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6 flex items-center gap-2.5 sm:gap-3">
//       <Icon className={`h-5 w-5 sm:h-7 sm:w-7 shrink-0 ${iconColor}`} />
//       {title}
//     </h2>
//     {children}
//   </section>
// );

// const inputClass =
//   'w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-sm sm:text-base';

// const DriverProfileUpdate = () => {
//   const token = localStorage.getItem('token');
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.user);
//   const [loading, setLoading] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(true);
//   const [profile, setProfile] = useState(null);
// const [isAvailable, setIsAvailable] = useState(false);
// const [availabilityUpdating, setAvailabilityUpdating] = useState(false);
//   const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

//   // ─── Fetch driver profile on mount and prefill ────────────────────────
//   useEffect(() => {
//     const fetchProfile = async () => {
//       setLoadingProfile(true);
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver/profile`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const profileData = res.data?.profile || {};
//         setProfile(profileData);

  
// setIsAvailable(!!(profileData.isAvailable ?? user?.isAvailable));
//         setValue('categories', Array.isArray(profileData.categories) ? profileData.categories : []);
//         setValue('expectedEarnings.min', profileData.expectedEarnings?.min ?? '');
//         setValue('expectedEarnings.max', profileData.expectedEarnings?.max ?? '');
//         setValue('yearsOfExperience', profileData.yearsOfExperience ?? '');
//         setValue('transmission', Array.isArray(profileData.transmission) ? profileData.transmission : []);
//         setValue('languagesSpoken', Array.isArray(profileData.languagesSpoken) ? profileData.languagesSpoken : []);
//         setValue('travelCapabilities.interstate', profileData.travelCapabilities?.interstate || false);
//         setValue('travelCapabilities.international', profileData.travelCapabilities?.international || false);
//         setValue('bio', profileData.bio || '');
//       } catch (err) {
//         console.error(err);
//         // No existing profile yet is expected for first-time setup — stay quiet.
//       } finally {
//         setLoadingProfile(false);
//       }
//     };
//     fetchProfile();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [setValue]);

//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
//       await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/driver/profile`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success('Driver profile updated successfully! 🎉');
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || 'Update failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleAvailability = async () => {
//   if (availabilityUpdating) return;

//   const nextValue = !isAvailable;
//   setAvailabilityUpdating(true);
//   setIsAvailable(nextValue); // optimistic flip

//   try {
//     await axios.patch(
//       `${import.meta.env.VITE_BACKEND_URL}/api/users/availability`,
//       { isAvailable: nextValue },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     toast.success(nextValue ? "You're now available for hire" : "You're now marked unavailable");
//   } catch (err) {
//     console.error(err);
//     setIsAvailable(!nextValue); // roll back on failure
//     toast.error(err.response?.data?.message || 'Could not update availability');
//   } finally {
//     setAvailabilityUpdating(false);
//   }
// };

//   const toggleSelection = (field, value) => {
//     const current = watch(field) || [];
//     if (current.includes(value)) {
//       setValue(field, current.filter((v) => v !== value));
//     } else {
//       setValue(field, [...current, value]);
//     }
//   };

//   // ─── Live completeness meter, based on this schema's required fields ──
//   const watched = watch();
//   const completion = useMemo(() => {
//     const checks = [
//       (watched.categories || []).length > 0,
//       !!watched.expectedEarnings?.min,
//       !!watched.expectedEarnings?.max,
//       watched.yearsOfExperience !== '' && watched.yearsOfExperience !== undefined,
//       (watched.transmission || []).length > 0,
//       (watched.languagesSpoken || []).length > 0,
//       !!watched.bio,
//     ];
//     const done = checks.filter(Boolean).length;
//     return Math.round((done / checks.length) * 100);
//   }, [watched]);

//   if (loadingProfile) {
//     return (
//       <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4">
//         <div className="w-9 h-9 rounded-full border-[3px] border-blue-200 border-t-blue-600 animate-spin" />
//         <p className="text-gray-500 text-sm">Loading your driver profile…</p>
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28"
//     >
//       {/* ── Hero ─────────────────────────────────────────────────────── */}
//       <div
//         className="rounded-3xl p-5 sm:p-8 mb-6 sm:mb-10 text-white relative overflow-hidden"
//         style={{ background: `linear-gradient(135deg, ${PRIMARY_600}, ${PRIMARY_700})` }}
//       >
//         <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
//         <div className="absolute -bottom-14 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

//         <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
//           <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
//             <Car className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
//           </div>

//           <div className="flex-1 text-center sm:text-left min-w-0">
//             <p className="text-xs font-semibold tracking-widest uppercase text-blue-100">
//               Driver professional profile
//             </p>
//             <h1 className="text-xl sm:text-3xl font-bold truncate">
//               {user?.firstName ? `${user.firstName}'s specialties` : 'Your specialties'}
//             </h1>
//             <p className="text-blue-100 text-sm mt-1">Update these to get better matching job offers.</p>

//             <div className="mt-4 max-w-sm mx-auto sm:mx-0">
//               <div className="flex items-center justify-between text-xs text-blue-100 mb-1.5">
//                 <span>Profile completeness</span>
//                 <span className="font-semibold text-white">{completion}%</span>
//               </div>
//               <div className="h-2 rounded-full bg-white/20 overflow-hidden">
//                 <div
//                   className="h-full rounded-full bg-white transition-all duration-500"
//                   style={{ width: `${completion}%` }}
//                 />
//               </div>
//             </div>

//             {/* Availability switch */}
// <div className="mt-5 flex items-center justify-center sm:justify-start gap-3">
//   <button
//     type="button"
//     onClick={handleToggleAvailability}
//     disabled={availabilityUpdating}
//     role="switch"
//     aria-checked={isAvailable}
//     className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
//       isAvailable ? 'bg-emerald-400' : 'bg-white/25'
//     }`}
//   >
//     <span
//       className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
//         isAvailable ? 'translate-x-7' : 'translate-x-1'
//       }`}
//     />
//   </button>
//   <span className="text-sm font-semibold text-white flex items-center gap-1.5">
//     {availabilityUpdating ? (
//       <span className="h-3.5 w-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
//     ) : (
//       <span
//         className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-emerald-300' : 'bg-white/40'}`}
//       />
//     )}
//     {isAvailable ? 'Available for hire' : 'Currently unavailable'}
//   </span>
// </div>
//           </div>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-10">
//         {/* Driver Categories */}
//         <SectionCard icon={Gauge} title="Driver Specialties">
//           <p className="text-sm text-gray-500 -mt-3 mb-5">Select every service you're able to offer.</p>
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
//             {DRIVER_CATEGORIES.map((cat) => {
//               const isSelected = watch('categories')?.includes(cat);
//               return (
//                 <label
//                   key={cat}
//                   className={`flex items-center gap-2 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all text-sm sm:text-base ${
//                     isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   <input
//                     type="checkbox"
//                     className="hidden"
//                     value={cat}
//                     checked={!!isSelected}
//                     onChange={() => toggleSelection('categories', cat)}
//                   />
//                   <span className="capitalize flex-1 truncate">{cat.replace(/-/g, ' ')}</span>
//                   {isSelected && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />}
//                 </label>
//               );
//             })}
//           </div>
//         </SectionCard>

//         {/* Expected Earnings */}
//         <SectionCard icon={DollarSign} iconColor="text-green-600" title="Expected Earnings (Monthly)">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-2xl">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
//               <input
//                 {...register('expectedEarnings.min', { required: true })}
//                 type="number"
//                 className={inputClass}
//                 placeholder="50000"
//               />
//               {errors.expectedEarnings?.min && <p className="mt-2 text-sm text-red-600">Minimum is required</p>}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
//               <input
//                 {...register('expectedEarnings.max', { required: true })}
//                 type="number"
//                 className={inputClass}
//                 placeholder="100000"
//               />
//               {errors.expectedEarnings?.max && <p className="mt-2 text-sm text-red-600">Maximum is required</p>}
//             </div>
//           </div>
//         </SectionCard>

//         {/* Experience & Transmission */}
//         <SectionCard icon={Calendar} iconColor="text-purple-600" title="Experience & Transmission">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
//               <input
//                 {...register('yearsOfExperience', { required: true, min: 0 })}
//                 type="number"
//                 className={`max-w-xs ${inputClass}`}
//                 placeholder="8"
//               />
//               {errors.yearsOfExperience && <p className="mt-2 text-sm text-red-600">Years of experience is required</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Car className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
//                 Transmission Comfortable With
//               </label>
//               <div className="flex flex-wrap gap-3 sm:gap-4">
//                 {TRANSMISSIONS.map((trans) => {
//                   const isSelected = watch('transmission')?.includes(trans);
//                   return (
//                     <label
//                       key={trans}
//                       className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm ${
//                         isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                     >
//                       <input
//                         type="checkbox"
//                         value={trans}
//                         checked={!!isSelected}
//                         onChange={() => toggleSelection('transmission', trans)}
//                         className="hidden"
//                       />
//                       <span className="capitalize">{trans}</span>
//                       {isSelected && <CheckCircle className="h-4 w-4 text-blue-600" />}
//                     </label>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </SectionCard>

//         {/* Languages & Travel */}
//         <SectionCard icon={Languages} iconColor="text-teal-600" title="Languages & Travel">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
//             <div>
//               <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Languages className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
//                 Languages Spoken
//               </p>
//               <div className="grid grid-cols-2 gap-2 sm:gap-3">
//                 {LANGUAGES.map((lang) => {
//                   const isSelected = watch('languagesSpoken')?.includes(lang);
//                   return (
//                     <label
//                       key={lang}
//                       className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
//                         isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                     >
//                       <input
//                         type="checkbox"
//                         value={lang}
//                         checked={!!isSelected}
//                         onChange={() => toggleSelection('languagesSpoken', lang)}
//                         className="hidden"
//                       />
//                       {isSelected ? (
//                         <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
//                       ) : (
//                         <Circle className="h-4 w-4 text-gray-300 shrink-0" />
//                       )}
//                       <span className="truncate">{lang}</span>
//                     </label>
//                   );
//                 })}
//               </div>
//             </div>

//             <div>
//               <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                 <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
//                 Travel Availability
//               </p>
//               <div className="space-y-3">
//                 <label className="flex items-start gap-3 cursor-pointer p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-300">
//                   <input
//                     type="checkbox"
//                     {...register('travelCapabilities.interstate')}
//                     className="w-5 h-5 mt-0.5 text-blue-600 rounded shrink-0"
//                   />
//                   <div>
//                     <p className="font-semibold text-sm sm:text-base text-gray-900">Interstate Travel</p>
//                     <p className="text-xs sm:text-sm text-gray-500">Willing to drive between states/provinces</p>
//                   </div>
//                 </label>

//                 <label className="flex items-start gap-3 cursor-pointer p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-300">
//                   <input
//                     type="checkbox"
//                     {...register('travelCapabilities.international')}
//                     className="w-5 h-5 mt-0.5 text-blue-600 rounded shrink-0"
//                   />
//                   <div>
//                     <p className="font-semibold text-sm sm:text-base text-gray-900">International Travel</p>
//                     <p className="text-xs sm:text-sm text-gray-500">Can cross international borders</p>
//                   </div>
//                 </label>
//               </div>
//             </div>
//           </div>
//         </SectionCard>

//         {/* Bio */}
//         <SectionCard icon={Gauge} iconColor="text-gray-400" title="Professional Bio (Optional)">
//           <textarea
//             {...register('bio')}
//             rows={5}
//             maxLength={500}
//             className={`${inputClass} resize-none`}
//             placeholder="Tell clients about your experience, punctuality, or special skills..."
//           />
//           <p className="text-xs text-gray-400 mt-2 text-right">{(watch('bio') || '').length}/500</p>
//         </SectionCard>
//       </form>

//       {/* ── Sticky save bar ─────────────────────────────────────────── */}
//       <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 sm:py-4">
//         <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
//           <p className="hidden sm:block text-sm text-gray-500">{completion}% complete</p>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             type="button"
//             onClick={handleSubmit(onSubmit)}
//             disabled={loading}
//             className="w-full sm:w-auto px-8 sm:px-14 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-white rounded-2xl shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all"
//             style={{
//               background: `linear-gradient(135deg, ${PRIMARY_500}, ${PRIMARY_700})`,
//               boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
//             }}
//           >
//             {loading ? 'Saving...' : 'Save Driver Profile'}
//           </motion.button>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default DriverProfileUpdate;














/* eslint-disable no-unused-vars */
// src/pages/Dashboard/DriverProfileUpdate.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Car, DollarSign, Globe, Languages, Gauge, Calendar, CheckCircle, CheckCircle2, Circle,
  User, GraduationCap, MapPin, Truck, Users, ShieldCheck, Wine, Plus, Trash2, X,
} from 'lucide-react';
import axios from 'axios';

const PRIMARY_500 = '#3B82F6';
const PRIMARY_600 = '#2563EB';
const PRIMARY_700 = '#1D4ED8';

const DRIVER_CATEGORIES = [
  'full-time', 'part-time', 'weekend', 'short-time', 'airport-pickup',
  'outstation-travel', 'night-out-designated', 'executive-chauffeur',
  'family-child-friendly', 'school-bus', 'tanker-hazmat', 'retained-monthly',
  'pet-friendly', 'truck-driver', 'interstate-driver', 'long-haul-driver',
  'delivery-driver', 'disabled-assistance-driver', 'bike-courier',
  'medical-transport-driver', 'chauffeur-driver', 'personal-driver', 'corporate-driver',
];

const TRANSMISSIONS = ['automatic', 'manual', 'both'];
const LANGUAGES = ['English', 'Spanish', 'French', 'Hindi', 'Arabic', 'Mandarin', 'Yoruba', 'Igbo', 'Hausa', 'Portuguese'];

// ─── New option lists (must match the backend enums) ───────────────────
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const MARITAL_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'widowed', label: 'Widowed' },
];

const RELIGIONS = [
  { value: 'christianity', label: 'Christianity' },
  { value: 'islam', label: 'Islam' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const EDUCATION_LEVELS = [
  { value: 'none', label: 'No formal education' },
  { value: 'primary', label: 'Primary school' },
  { value: 'secondary', label: 'Secondary school (SSCE/WAEC/NECO)' },
  { value: 'vocational', label: 'Vocational / Trade certificate' },
  { value: 'ond', label: 'OND' },
  { value: 'hnd', label: 'HND' },
  { value: 'bachelors', label: "Bachelor's degree" },
  { value: 'masters', label: "Master's degree" },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' },
];

const VEHICLE_TYPES = [
  { value: 'car', label: 'Car' },
  { value: 'suv', label: 'SUV' },
  { value: 'jeep', label: 'Jeep' },
  { value: 'van', label: 'Van' },
  { value: 'minibus', label: 'Minibus' },
  { value: 'bus', label: 'Bus' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'truck', label: 'Truck' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'tricycle', label: 'Tricycle' },
  { value: 'other', label: 'Other (specify)' },
];

const LEVELS = [
  { value: 'light', label: 'Light' },
  { value: 'normal', label: 'Normal' },
  { value: 'heavy', label: 'Heavy' },
];

const MAX_REFERENCES = 5;
const emptyReference = { name: '', contact: '', occupation: '', address: '', relationship: '' };

// ─── Shared UI ─────────────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, iconColor = 'text-blue-600', title, children }) => (
  <section className="bg-white rounded-2xl sm:rounded-3xl shadow-sm sm:shadow-lg border border-gray-100 p-5 sm:p-8">
    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6 flex items-center gap-2.5 sm:gap-3">
      <Icon className={`h-5 w-5 sm:h-7 sm:w-7 shrink-0 ${iconColor}`} />
      {title}
    </h2>
    {children}
  </section>
);

const inputClass =
  'w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-sm sm:text-base';

const Label = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700 mb-2">{children}</label>
);

const Chip = ({ selected, onClick, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={selected}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors text-left disabled:opacity-50 ${
      selected ? 'border-blue-400 bg-blue-50 text-gray-900' : 'border-gray-200 hover:border-gray-300 text-gray-700'
    }`}
  >
    {selected ? (
      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
    ) : (
      <Circle className="h-4 w-4 text-gray-300 shrink-0" />
    )}
    <span className="truncate">{children}</span>
  </button>
);

const LevelPicker = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2 mt-3">
    {LEVELS.map((l) => (
      <button
        key={l.value}
        type="button"
        onClick={() => onChange(l.value)}
        aria-pressed={value === l.value}
        className={`px-4 py-2 rounded-xl border-2 text-sm transition-all ${
          value === l.value ? 'border-blue-500 bg-blue-50 font-semibold' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {l.label}
      </button>
    ))}
  </div>
);

const DriverProfileUpdate = () => {
  const token = localStorage.getItem('token');
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);
  const [otherVehicleInput, setOtherVehicleInput] = useState('');

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      habits: { smokes: false, drinksAlcohol: false },
      isExConvict: false,
      references: [],
    },
  });

  const { fields: referenceFields, append, remove, replace } = useFieldArray({
    control,
    name: 'references',
  });

  // ─── Fetch driver profile on mount and prefill ────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const p = res.data?.profile || {};
        setProfile(p);

        setIsAvailable(!!(p.isAvailable ?? user?.isAvailable));
        setValue('categories', Array.isArray(p.categories) ? p.categories : []);
        setValue('expectedEarnings.min', p.expectedEarnings?.min ?? '');
        setValue('expectedEarnings.max', p.expectedEarnings?.max ?? '');
        setValue('yearsOfExperience', p.yearsOfExperience ?? '');
        setValue('transmission', Array.isArray(p.transmission) ? p.transmission : []);
        setValue('languagesSpoken', Array.isArray(p.languagesSpoken) ? p.languagesSpoken : []);
        setValue('travelCapabilities.interstate', p.travelCapabilities?.interstate || false);
        setValue('travelCapabilities.international', p.travelCapabilities?.international || false);
        setValue('bio', p.bio || '');

        // New fields
        setValue('statesDrivenTo', Array.isArray(p.statesDrivenTo) ? p.statesDrivenTo : []);
        setValue('statesFamiliarWith', Array.isArray(p.statesFamiliarWith) ? p.statesFamiliarWith : []);
        setValue('maritalStatus', p.maritalStatus || '');
        setValue('religion', p.religion || '');

        setValue('education.highestLevel', p.education?.highestLevel || '');
        setValue('education.degree', p.education?.degree || '');
        setValue('education.institution', p.education?.institution || '');
        setValue('education.graduationYear', p.education?.graduationYear ?? '');
        setValue('education.additionalInfo', p.education?.additionalInfo || '');

        setValue('habits.smokes', !!p.habits?.smokes);
        setValue('habits.smokingLevel', p.habits?.smokingLevel || '');
        setValue('habits.drinksAlcohol', !!p.habits?.drinksAlcohol);
        setValue('habits.drinkingLevel', p.habits?.drinkingLevel || '');

        setValue('vehicleTypes', Array.isArray(p.vehicleTypes) ? p.vehicleTypes : []);
        setValue('otherVehicleTypes', Array.isArray(p.otherVehicleTypes) ? p.otherVehicleTypes : []);

        replace(
          Array.isArray(p.references)
            ? p.references.map((r) => ({
                name: r.name || '',
                contact: r.contact || '',
                occupation: r.occupation || '',
                address: r.address || '',
                relationship: r.relationship || '',
              }))
            : []
        );

        setValue('isExConvict', !!p.isExConvict);
        setValue('convictionDetails', p.convictionDetails || '');
      } catch (err) {
        console.error(err);
        // No existing profile yet is expected for first-time setup — stay quiet.
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]);

  const onSubmit = async (data) => {
    // Conditional validation for fields that aren't native inputs
    if (data.habits?.smokes && !data.habits?.smokingLevel) {
      toast.error('Please select how much you smoke');
      return;
    }
    if (data.habits?.drinksAlcohol && !data.habits?.drinkingLevel) {
      toast.error('Please select how much you drink');
      return;
    }
    if ((data.vehicleTypes || []).includes('other') && !(data.otherVehicleTypes || []).length) {
      toast.error('Please specify the other vehicle type(s) you can drive');
      return;
    }

    const payload = {
      ...data,
      maritalStatus: data.maritalStatus || undefined,
      religion: data.religion || undefined,
      education: {
        ...data.education,
        highestLevel: data.education?.highestLevel || undefined,
        graduationYear: data.education?.graduationYear ? Number(data.education.graduationYear) : undefined,
      },
      habits: {
        smokes: !!data.habits?.smokes,
        smokingLevel: data.habits?.smokes ? data.habits.smokingLevel : undefined,
        drinksAlcohol: !!data.habits?.drinksAlcohol,
        drinkingLevel: data.habits?.drinksAlcohol ? data.habits.drinkingLevel : undefined,
      },
      otherVehicleTypes: (data.vehicleTypes || []).includes('other') ? data.otherVehicleTypes || [] : [],
      isExConvict: !!data.isExConvict,
      convictionDetails: data.isExConvict ? data.convictionDetails || '' : '',
    };

    setLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/driver/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Driver profile updated successfully! 🎉');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (availabilityUpdating) return;

    const nextValue = !isAvailable;
    setAvailabilityUpdating(true);
    setIsAvailable(nextValue); // optimistic flip

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/availability`,
        { isAvailable: nextValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(nextValue ? "You're now available for hire" : "You're now marked unavailable");
    } catch (err) {
      console.error(err);
      setIsAvailable(!nextValue); // roll back on failure
      toast.error(err.response?.data?.message || 'Could not update availability');
    } finally {
      setAvailabilityUpdating(false);
    }
  };

  const toggleSelection = (field, value) => {
    const current = watch(field) || [];
    if (current.includes(value)) {
      setValue(field, current.filter((v) => v !== value));
    } else {
      setValue(field, [...current, value]);
    }
  };

  const addOtherVehicle = () => {
    const value = otherVehicleInput.trim();
    if (!value) return;
    const current = watch('otherVehicleTypes') || [];
    if (!current.some((v) => v.toLowerCase() === value.toLowerCase())) {
      setValue('otherVehicleTypes', [...current, value]);
    }
    setOtherVehicleInput('');
  };

  const removeOtherVehicle = (value) => {
    setValue('otherVehicleTypes', (watch('otherVehicleTypes') || []).filter((v) => v !== value));
  };

  // ─── Live completeness meter ──────────────────────────────────────────
  const watched = watch();
  const completion = useMemo(() => {
    const checks = [
      (watched.categories || []).length > 0,
      !!watched.expectedEarnings?.min,
      !!watched.expectedEarnings?.max,
      watched.yearsOfExperience !== '' && watched.yearsOfExperience !== undefined,
      (watched.transmission || []).length > 0,
      (watched.languagesSpoken || []).length > 0,
      !!watched.bio,
      // New sections
      (watched.vehicleTypes || []).length > 0,
      (watched.statesFamiliarWith || []).length > 0,
      !!watched.maritalStatus,
      !!watched.education?.highestLevel,
      (watched.references || []).length > 0,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [watched]);

  if (loadingProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4">
        <div className="w-9 h-9 rounded-full border-[3px] border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-gray-500 text-sm">Loading your driver profile…</p>
      </div>
    );
  }

  const smokes = watch('habits.smokes');
  const drinks = watch('habits.drinksAlcohol');
  const selectedVehicles = watch('vehicleTypes') || [];
  const otherVehicles = watch('otherVehicleTypes') || [];
  const isExConvict = watch('isExConvict');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28"
    >
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-5 sm:p-8 mb-6 sm:mb-10 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${PRIMARY_600}, ${PRIMARY_700})` }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-14 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
            <Car className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-100">
              Driver professional profile
            </p>
            <h1 className="text-xl sm:text-3xl font-bold truncate">
              {user?.firstName ? `${user.firstName}'s specialties` : 'Your specialties'}
            </h1>
            <p className="text-blue-100 text-sm mt-1">Update these to get better matching job offers.</p>

            <div className="mt-4 max-w-sm mx-auto sm:mx-0">
              <div className="flex items-center justify-between text-xs text-blue-100 mb-1.5">
                <span>Profile completeness</span>
                <span className="font-semibold text-white">{completion}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            {/* Availability switch */}
            <div className="mt-5 flex items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={availabilityUpdating}
                role="switch"
                aria-checked={isAvailable}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
                  isAvailable ? 'bg-emerald-400' : 'bg-white/25'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    isAvailable ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                {availabilityUpdating ? (
                  <span className="h-3.5 w-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-emerald-300' : 'bg-white/40'}`} />
                )}
                {isAvailable ? 'Available for hire' : 'Currently unavailable'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-10">
        {/* Driver Categories */}
        <SectionCard icon={Gauge} title="Driver Specialties">
          <p className="text-sm text-gray-500 -mt-3 mb-5">Select every service you're able to offer.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {DRIVER_CATEGORIES.map((cat) => {
              const isSelected = watch('categories')?.includes(cat);
              return (
                <label
                  key={cat}
                  className={`flex items-center gap-2 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all text-sm sm:text-base ${
                    isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    value={cat}
                    checked={!!isSelected}
                    onChange={() => toggleSelection('categories', cat)}
                  />
                  <span className="capitalize flex-1 truncate">{cat.replace(/-/g, ' ')}</span>
                  {isSelected && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />}
                </label>
              );
            })}
          </div>
        </SectionCard>

        {/* Expected Earnings */}
        <SectionCard icon={DollarSign} iconColor="text-green-600" title="Expected Earnings (Monthly)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-2xl">
            <div>
              <Label>Minimum</Label>
              <input
                {...register('expectedEarnings.min', { required: true })}
                type="number"
                className={inputClass}
                placeholder="50000"
              />
              {errors.expectedEarnings?.min && <p className="mt-2 text-sm text-red-600">Minimum is required</p>}
            </div>
            <div>
              <Label>Maximum</Label>
              <input
                {...register('expectedEarnings.max', { required: true })}
                type="number"
                className={inputClass}
                placeholder="100000"
              />
              {errors.expectedEarnings?.max && <p className="mt-2 text-sm text-red-600">Maximum is required</p>}
            </div>
          </div>
        </SectionCard>

        {/* Experience & Transmission */}
        <SectionCard icon={Calendar} iconColor="text-purple-600" title="Experience & Transmission">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
              <input
                {...register('yearsOfExperience', { required: true, min: 0 })}
                type="number"
                className={`max-w-xs ${inputClass}`}
                placeholder="8"
              />
              {errors.yearsOfExperience && <p className="mt-2 text-sm text-red-600">Years of experience is required</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Car className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                Transmission Comfortable With
              </label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {TRANSMISSIONS.map((trans) => {
                  const isSelected = watch('transmission')?.includes(trans);
                  return (
                    <label
                      key={trans}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={trans}
                        checked={!!isSelected}
                        onChange={() => toggleSelection('transmission', trans)}
                        className="hidden"
                      />
                      <span className="capitalize">{trans}</span>
                      {isSelected && <CheckCircle className="h-4 w-4 text-blue-600" />}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Vehicles */}
        <SectionCard icon={Truck} iconColor="text-orange-600" title="Vehicles You Can Drive">
          <p className="text-sm text-gray-500 -mt-3 mb-5">Select every type of vehicle you're able to drive.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {VEHICLE_TYPES.map((v) => (
              <Chip
                key={v.value}
                selected={selectedVehicles.includes(v.value)}
                onClick={() => toggleSelection('vehicleTypes', v.value)}
              >
                {v.label}
              </Chip>
            ))}
          </div>

          {selectedVehicles.includes('other') && (
            <div className="mt-5 max-w-xl">
              <Label>Other vehicle types</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otherVehicleInput}
                  onChange={(e) => setOtherVehicleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addOtherVehicle();
                    }
                  }}
                  className={inputClass}
                  placeholder="e.g. Crane, Forklift, Bulldozer"
                />
                <button
                  type="button"
                  onClick={addOtherVehicle}
                  className="shrink-0 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                  aria-label="Add vehicle type"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {otherVehicles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {otherVehicles.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-sm"
                    >
                      {v}
                      <button
                        type="button"
                        onClick={() => removeOtherVehicle(v)}
                        aria-label={`Remove ${v}`}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Languages & Travel */}
        <SectionCard icon={Languages} iconColor="text-teal-600" title="Languages & Travel">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Languages className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                Languages Spoken
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {LANGUAGES.map((lang) => (
                  <Chip
                    key={lang}
                    selected={!!watch('languagesSpoken')?.includes(lang)}
                    onClick={() => toggleSelection('languagesSpoken', lang)}
                  >
                    {lang}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                Travel Availability
              </p>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-300">
                  <input
                    type="checkbox"
                    {...register('travelCapabilities.interstate')}
                    className="w-5 h-5 mt-0.5 text-blue-600 rounded shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">Interstate Travel</p>
                    <p className="text-xs sm:text-sm text-gray-500">Willing to drive between states/provinces</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-300">
                  <input
                    type="checkbox"
                    {...register('travelCapabilities.international')}
                    className="w-5 h-5 mt-0.5 text-blue-600 rounded shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">International Travel</p>
                    <p className="text-xs sm:text-sm text-gray-500">Can cross international borders</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* States coverage */}
        <SectionCard icon={MapPin} iconColor="text-rose-600" title="States You Know">
          {[
            { field: 'statesDrivenTo', title: 'States you have driven to' },
            { field: 'statesFamiliarWith', title: 'States you are familiar with' },
          ].map(({ field, title }) => {
            const selected = watch(field) || [];
            return (
              <div key={field} className="mb-8 last:mb-0">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <p className="text-sm font-semibold text-gray-700">
                    {title}
                    <span className="ml-2 text-xs font-normal text-gray-400">{selected.length} selected</span>
                  </p>
                  <div className="flex gap-3 text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={() => setValue(field, [...NIGERIAN_STATES])}
                      className="text-blue-600 hover:underline"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue(field, [])}
                      className="text-gray-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {NIGERIAN_STATES.map((s) => (
                    <Chip key={s} selected={selected.includes(s)} onClick={() => toggleSelection(field, s)}>
                      {s}
                    </Chip>
                  ))}
                </div>
              </div>
            );
          })}
        </SectionCard>

        {/* Personal info */}
        <SectionCard icon={User} iconColor="text-sky-600" title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-2xl">
            <div>
              <Label>Marital status</Label>
              <select {...register('maritalStatus')} className={inputClass}>
                <option value="">Select…</option>
                {MARITAL_STATUSES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Religion (optional)</Label>
              <select {...register('religion')} className={inputClass}>
                <option value="">Select…</option>
                {RELIGIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Education */}
        <SectionCard icon={GraduationCap} iconColor="text-amber-600" title="Education">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <Label>Highest qualification</Label>
              <select {...register('education.highestLevel')} className={inputClass}>
                <option value="">Select…</option>
                {EDUCATION_LEVELS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Degree / Course of study</Label>
              <input
                {...register('education.degree')}
                maxLength={150}
                className={inputClass}
                placeholder="e.g. B.Sc Mechanical Engineering"
              />
            </div>
            <div>
              <Label>Institution</Label>
              <input
                {...register('education.institution')}
                maxLength={150}
                className={inputClass}
                placeholder="e.g. University of Ibadan"
              />
            </div>
            <div>
              <Label>Graduation year</Label>
              <input
                {...register('education.graduationYear', {
                  min: { value: 1950, message: 'Year looks too early' },
                  max: { value: new Date().getFullYear() + 1, message: 'Year cannot be in the future' },
                })}
                type="number"
                className={inputClass}
                placeholder="2015"
              />
              {errors.education?.graduationYear && (
                <p className="mt-2 text-sm text-red-600">{errors.education.graduationYear.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label>Other certificates or training (optional)</Label>
              <textarea
                {...register('education.additionalInfo')}
                rows={3}
                maxLength={500}
                className={`${inputClass} resize-none`}
                placeholder="e.g. Defensive driving course, FRSC certificate, first aid training"
              />
            </div>
          </div>
        </SectionCard>

        {/* Lifestyle */}
        <SectionCard icon={Wine} iconColor="text-purple-600" title="Lifestyle">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            <div>
              <label className="flex items-start gap-3 cursor-pointer p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-300">
                <input
                  type="checkbox"
                  {...register('habits.smokes')}
                  className="w-5 h-5 mt-0.5 text-blue-600 rounded shrink-0"
                />
                <div>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">I smoke</p>
                  <p className="text-xs sm:text-sm text-gray-500">Cigarettes, shisha or any other form</p>
                </div>
              </label>
              {smokes && (
                <>
                  <LevelPicker
                    value={watch('habits.smokingLevel')}
                    onChange={(v) => setValue('habits.smokingLevel', v, { shouldDirty: true })}
                  />
                </>
              )}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-300">
                <input
                  type="checkbox"
                  {...register('habits.drinksAlcohol')}
                  className="w-5 h-5 mt-0.5 text-blue-600 rounded shrink-0"
                />
                <div>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">I drink alcohol</p>
                  <p className="text-xs sm:text-sm text-gray-500">Tell us how often you drink</p>
                </div>
              </label>
              {drinks && (
                <LevelPicker
                  value={watch('habits.drinkingLevel')}
                  onChange={(v) => setValue('habits.drinkingLevel', v, { shouldDirty: true })}
                />
              )}
            </div>
          </div>
        </SectionCard>

        {/* References */}
        <SectionCard icon={Users} iconColor="text-emerald-600" title="References">
          <p className="text-sm text-gray-500 -mt-3 mb-5">
            Add people who can vouch for you (up to {MAX_REFERENCES}).
          </p>

          {referenceFields.length === 0 && (
            <p className="text-sm text-gray-400 mb-4">No references added yet.</p>
          )}

          <div className="space-y-5">
            {referenceFields.map((field, index) => (
              <div key={field.id} className="rounded-2xl border border-gray-200 p-4 sm:p-5 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-gray-800 text-sm sm:text-base">Reference {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Full name</Label>
                    <input
                      {...register(`references.${index}.name`, { required: 'Name is required' })}
                      className={inputClass}
                      placeholder="Full name"
                    />
                    {errors.references?.[index]?.name && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.references[index].name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Phone number</Label>
                    <input
                      {...register(`references.${index}.contact`, { required: 'Contact is required' })}
                      type="tel"
                      className={inputClass}
                      placeholder="08012345678"
                    />
                    {errors.references?.[index]?.contact && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.references[index].contact.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Occupation</Label>
                    <input
                      {...register(`references.${index}.occupation`, { required: 'Occupation is required' })}
                      className={inputClass}
                      placeholder="e.g. Civil servant"
                    />
                    {errors.references?.[index]?.occupation && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.references[index].occupation.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Relationship (optional)</Label>
                    <input
                      {...register(`references.${index}.relationship`)}
                      className={inputClass}
                      placeholder="e.g. Former employer"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Address</Label>
                    <input
                      {...register(`references.${index}.address`, { required: 'Address is required' })}
                      className={inputClass}
                      placeholder="Home or office address"
                    />
                    {errors.references?.[index]?.address && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.references[index].address.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {referenceFields.length < MAX_REFERENCES && (
            <button
              type="button"
              onClick={() => append({ ...emptyReference })}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 transition text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add reference
            </button>
          )}
        </SectionCard>

        {/* Background */}
        <SectionCard icon={ShieldCheck} iconColor="text-slate-600" title="Background Declaration">
          <p className="text-sm text-gray-500 -mt-3 mb-5">
            Used for verification. Please answer honestly.
          </p>
          <label className="flex items-start gap-3 cursor-pointer p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-300 max-w-xl">
            <input
              type="checkbox"
              {...register('isExConvict')}
              className="w-5 h-5 mt-0.5 text-blue-600 rounded shrink-0"
            />
            <div>
              <p className="font-semibold text-sm sm:text-base text-gray-900">I am an ex-convict</p>
              <p className="text-xs sm:text-sm text-gray-500">I have previously been convicted and served a sentence</p>
            </div>
          </label>

          {isExConvict && (
            <div className="mt-4 max-w-xl">
              <Label>Details (optional)</Label>
              <textarea
                {...register('convictionDetails')}
                rows={3}
                maxLength={500}
                className={`${inputClass} resize-none`}
                placeholder="Briefly describe the circumstances"
              />
              <p className="text-xs text-gray-400 mt-2 text-right">{(watch('convictionDetails') || '').length}/500</p>
            </div>
          )}
        </SectionCard>

        {/* Bio */}
        <SectionCard icon={Gauge} iconColor="text-gray-400" title="Professional Bio (Optional)">
          <textarea
            {...register('bio')}
            rows={5}
            maxLength={500}
            className={`${inputClass} resize-none`}
            placeholder="Tell clients about your experience, punctuality, or special skills..."
          />
          <p className="text-xs text-gray-400 mt-2 text-right">{(watch('bio') || '').length}/500</p>
        </SectionCard>
      </form>

      {/* ── Sticky save bar ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <p className="hidden sm:block text-sm text-gray-500">{completion}% complete</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="w-full sm:w-auto px-8 sm:px-14 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-white rounded-2xl shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY_500}, ${PRIMARY_700})`,
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
            }}
          >
            {loading ? 'Saving...' : 'Save Driver Profile'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default DriverProfileUpdate;