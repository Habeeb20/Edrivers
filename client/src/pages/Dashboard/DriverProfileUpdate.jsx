// /* eslint-disable no-unused-vars */
// // src/pages/Dashboard/DriverProfileUpdate.jsx
// import React, { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { useSelector, useDispatch } from 'react-redux';
// import { toast } from 'sonner';
// import { motion } from 'framer-motion';
// import { Car, DollarSign, Globe, Languages, Gauge, Calendar, MapPin, CheckCircle } from 'lucide-react';
// import axios from 'axios';

// const PRIMARY_500 = '#3B82F6';

// const DRIVER_CATEGORIES = [
//   'full-time', 'part-time', 'weekend', 'short-time', 'airport-pickup',
//   'outstation-travel', 'night-out-designated', 'executive-chauffeur',
//   'family-child-friendly', 'school-bus', 'tanker-hazmat', 'retained-monthly', 'pet-friendly', 'truck-driver', 'interstate-driver', 'long-haul-driver', 'delivery-driver',
//   'disabled-assistance-driver', 'bike-courier', 'medical-transport-driver', ,
// 'chauffeur-driver', 'personal-driver', 'corporate-driver'
// ];

// const TRANSMISSIONS = ['automatic', 'manual', 'both'];
// const LANGUAGES = ['English', 'Spanish', 'French', 'Hindi', 'Arabic', 'Mandarin', 'Yoruba', 'Igbo', 'Hausa', 'Portuguese'];

// const DriverProfileUpdate = () => {

// const token = localStorage.getItem("token")
//   const dispatch = useDispatch();
//   const { user } = useSelector(state => state.user);
//   const [loading, setLoading] = useState(false);
//   const [profile, setProfile] = useState(null);

//   const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

//   // Fetch driver profile on mount
//   useEffect(() => {
//       const token = localStorage.getItem("token")
//     const fetchProfile = async () => {
//       try {
//         console.log(token)
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver/profile`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });
//         setProfile(res.data.profile);
//         console.log(res.data)
//         // Pre-fill form
//         setValue('categories', res.data.profile?.categories || []);
//         setValue('expectedEarnings.min', res.data.profile?.expectedEarnings?.min || '');
//         setValue('expectedEarnings.max', res.data.profile?.expectedEarnings?.max || '');
//         setValue('yearsOfExperience', res.data.profile?.yearsOfExperience || '');
// // In your fetchProfile function, inside try block:
// const profileData = res.data?.profile || {};

// // Safest way – guarantees array even if backend sends null/undefined/string
// setValue('transmission', Array.isArray(profileData.transmission) ? profileData.transmission : []);
// setValue('languagesSpoken', Array.isArray(profileData.languagesSpoken) ? profileData.languagesSpoken : []);
//         setValue('travelCapabilities.interstate', res.data.profile?.travelCapabilities?.interstate || false);
//         setValue('travelCapabilities.international', res.data.profile?.travelCapabilities?.international || false);
//         setValue('bio', res.data.profile?.bio || '');
//       } catch (err) {
//         console.log(err)
//         // toast.error('Failed to load driver profile');
//       }
//     };
//     fetchProfile();
//   }, [setValue]);

//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
  
//       await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/driver/profile`, data, {
//           headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//       });
//       toast.success('Driver profile updated successfully! 🎉');
//     } catch (err) {
//       console.log(err)
//       toast.error(err.response?.data?.message || 'Update failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleSelection = (field, value) => {
//     const current = watch(field) || [];
//     if (current.includes(value)) {
//       setValue(field, current.filter(v => v !== value));
//     } else {
//       setValue(field, [...current, value]);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="max-w-5xl mx-auto py-8 px-4"
//     >
//       <div className="text-center mb-12">
//         <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-4">
//           <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl">
//             <Car className="h-10 w-10 text-white" />
//           </div>
//           Driver Professional Profile
//         </h1>
//         <p className="text-gray-600 mt-3">Update your specialties to get better matching jobs</p>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
//         {/* Driver Categories */}
//         <section className="bg-white rounded-3xl shadow-lg p-8 border">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//             <Gauge className="h-7 w-7 text-blue-600" />
//             Driver Specialties
//           </h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {DRIVER_CATEGORIES.map(cat => (
//               <label
//                 key={cat}
//                 className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
//                   watch('categories')?.includes(cat)
//                     ? 'border-blue-500 bg-blue-50 shadow-md'
//                     : 'border-gray-200 hover:border-gray-300'
//                 }`}
//               >
//                 <input
//                   type="checkbox"
//                   className="hidden"
//                   value={cat}
//                   onChange={() => toggleSelection('categories', cat)}
//                 />
//                 <span className="capitalize flex-1">{cat.replace('-', ' ')}</span>
//                 {watch('categories')?.includes(cat) && <CheckCircle className="h-5 w-5 text-blue-600" />}
//               </label>
//             ))}
//           </div>
//         </section>

//         {/* Expected Earnings */}
//         <section className="bg-white rounded-3xl shadow-lg p-8 border">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//             <DollarSign className="h-7 w-7 text-green-600" />
//             Expected Earnings (Monthly)
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
//               <input
//                 {...register('expectedEarnings.min', { required: true })}
//                 type="number"
//                 className="w-full px-5 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100"
//                 placeholder="50000"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
//               <input
//                 {...register('expectedEarnings.max', { required: true })}
//                 type="number"
//                 className="w-full px-5 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100"
//                 placeholder="100000"
//               />
//             </div>
//           </div>
//         </section>

//         {/* Experience & Transmission */}
//         <section className="bg-white rounded-3xl shadow-lg p-8 border">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//             <div>
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//                 <Calendar className="h-7 w-7 text-purple-600" />
//                 Years of Experience
//               </h2>
//               <input
//                 {...register('yearsOfExperience', { required: true, min: 0 })}
//                 type="number"
//                 className="w-full max-w-xs px-5 py-4 border rounded-xl"
//                 placeholder="8"
//               />
//             </div>

//             <div>
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//                 <Car className="h-7 w-7 text-orange-600" />
//                 Transmission Comfortable With
//               </h2>
//               <div className="flex gap-6">
//                 {TRANSMISSIONS.map(trans => (
//                   <label key={trans} className="flex items-center gap-3 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       value={trans}
//                       onChange={() => toggleSelection('transmission', trans)}
//                       className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
//                     />
//                     <span className="capitalize">{trans}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Languages & Travel */}
//         <section className="bg-white rounded-3xl shadow-lg p-8 border">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//             <div>
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//                 <Languages className="h-7 w-7 text-teal-600" />
//                 Languages Spoken
//               </h2>
//               <div className="space-y-3">
//                 {LANGUAGES.map(lang => (
//                   <label key={lang} className="flex items-center gap-3 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       value={lang}
//                       onChange={() => toggleSelection('languagesSpoken', lang)}
//                       className="w-5 h-5 text-blue-600 rounded"
//                     />
//                     <span>{lang}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//                 <Globe className="h-7 w-7 text-indigo-600" />
//                 Travel Availability
//               </h2>
//               <div className="space-y-5">
//                 <label className="flex items-center gap-4 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     {...register('travelCapabilities.interstate')}
//                     className="w-6 h-6 text-blue-600 rounded"
//                   />
//                   <div>
//                     <p className="font-semibold">Interstate Travel</p>
//                     <p className="text-sm text-gray-600">Willing to drive between states/provinces</p>
//                   </div>
//                 </label>

//                 <label className="flex items-center gap-4 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     {...register('travelCapabilities.international')}
//                     className="w-6 h-6 text-blue-600 rounded"
//                   />
//                   <div>
//                     <p className="font-semibold">International Travel</p>
//                     <p className="text-sm text-gray-600">Can cross international borders</p>
//                   </div>
//                 </label>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Bio */}
//         <section className="bg-white rounded-3xl shadow-lg p-8 border">
//           <h2 className="text-2xl font-bold mb-6">Professional Bio (Optional)</h2>
//           <textarea
//             {...register('bio')}
//             rows="5"
//             className="w-full px-5 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100"
//             placeholder="Tell clients about your experience, punctuality, or special skills..."
//           />
//         </section>

//         {/* Submit */}
//         <div className="flex justify-center">
//           <motion.button
//             whileHover={{ scale: 1.03 }}
//             whileTap={{ scale: 0.98 }}
//             type="submit"
//             disabled={loading}
//             className="px-16 py-5 text-xl font-bold text-white rounded-2xl shadow-2xl disabled:opacity-70"
//             style={{
//               background: `linear-gradient(135deg, ${PRIMARY_500}, #1D4ED8)`,
//             }}
//           >
//             {loading ? 'Saving...' : 'Save Driver Profile'}
//           </motion.button>
//         </div>
//       </form>
//     </motion.div>
//   );
// };

// export default DriverProfileUpdate; 





/* eslint-disable no-unused-vars */
// src/pages/Dashboard/DriverProfileUpdate.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Car, DollarSign, Globe, Languages, Gauge, Calendar, CheckCircle, CheckCircle2, Circle,
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

const DriverProfileUpdate = () => {
  const token = localStorage.getItem('token');
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  // ─── Fetch driver profile on mount and prefill ────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/driver/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profileData = res.data?.profile || {};
        setProfile(profileData);

        setValue('categories', Array.isArray(profileData.categories) ? profileData.categories : []);
        setValue('expectedEarnings.min', profileData.expectedEarnings?.min ?? '');
        setValue('expectedEarnings.max', profileData.expectedEarnings?.max ?? '');
        setValue('yearsOfExperience', profileData.yearsOfExperience ?? '');
        setValue('transmission', Array.isArray(profileData.transmission) ? profileData.transmission : []);
        setValue('languagesSpoken', Array.isArray(profileData.languagesSpoken) ? profileData.languagesSpoken : []);
        setValue('travelCapabilities.interstate', profileData.travelCapabilities?.interstate || false);
        setValue('travelCapabilities.international', profileData.travelCapabilities?.international || false);
        setValue('bio', profileData.bio || '');
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
    setLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/driver/profile`, data, {
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

  const toggleSelection = (field, value) => {
    const current = watch(field) || [];
    if (current.includes(value)) {
      setValue(field, current.filter((v) => v !== value));
    } else {
      setValue(field, [...current, value]);
    }
  };

  // ─── Live completeness meter, based on this schema's required fields ──
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
              <input
                {...register('expectedEarnings.min', { required: true })}
                type="number"
                className={inputClass}
                placeholder="50000"
              />
              {errors.expectedEarnings?.min && <p className="mt-2 text-sm text-red-600">Minimum is required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
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

        {/* Languages & Travel */}
        <SectionCard icon={Languages} iconColor="text-teal-600" title="Languages & Travel">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Languages className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                Languages Spoken
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {LANGUAGES.map((lang) => {
                  const isSelected = watch('languagesSpoken')?.includes(lang);
                  return (
                    <label
                      key={lang}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                        isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={lang}
                        checked={!!isSelected}
                        onChange={() => toggleSelection('languagesSpoken', lang)}
                        className="hidden"
                      />
                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 shrink-0" />
                      )}
                      <span className="truncate">{lang}</span>
                    </label>
                  );
                })}
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