
























// /* eslint-disable no-unused-vars */
// // src/pages/Dashboard/ProfileUpdate.jsx

// import React, { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { useSelector, useDispatch } from 'react-redux';
// import { toast } from 'sonner';
// import {
//   User,
//   Phone,
//   Mail,
//   MapPin,
//   Cake,
//   Upload,
//   Car,
//   FileText,
//   CreditCard,
//   Camera,
//   HeartHandshake,      // new icon for guarantor
//   Stethoscope,
//   ChartBarDecreasingIcon,          // new icon for medicals
// } from 'lucide-react';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import { updateProfileAsync } from '../../store/slices/userSlice';
// import imageCompression from 'browser-image-compression';
// import { 
//   MdWork, MdSchedule, MdWeekend, MdTimer, 
//   MdFlight, MdDirectionsCar, MdNightlight, 
//   MdBusinessCenter, MdFamilyRestroom, MdSchool, 
//   MdLocalShipping, MdCalendarMonth, MdPets 
// } from 'react-icons/md';

// const PRIMARY_500 = '#3B82F6';
// const PRIMARY_600 = '#2563EB';
// const PRIMARY_700 = '#1D4ED8';

// const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
// const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// const ProfileUpdate = () => {
//  const dispatch = useDispatch();
// const [maxDate, setMaxDate] = useState("");
// const { user, token: reduxToken } = useSelector((state) => state.user);
// const role = user?.role || 'client';

// const token = reduxToken || localStorage.getItem('token');

// const [uploading, setUploading] = useState(false);
// const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
// const [uploadedDocuments, setUploadedDocuments] = useState(user?.documents || []);

// const {
//   register,
//   handleSubmit,
//   formState: { errors },
//   setValue,
//   watch,
// } = useForm({
//   defaultValues: {
//     firstName: user?.firstName || '',
//     lastName: user?.lastName || '',
//     email: user?.email || '',
//     phone: user?.phone || '',
//     dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
//     address: user?.address || '',
//     state: user?.state || '',
//     lga: user?.lga || '',
//     category: user?.category || 'full-time',
//     country: user?.country || 'NIGERIA',

//     vehicle: user?.vehicle || {
//       make: '',
//       model: '',
//       year: '',
//       color: '',
//       licensePlate: '',
//       capacity: 4,
//     },
//     preferredPayment: user?.preferredPayment || 'card',
//   },
// });

// useEffect(() => {
//   if (user) {
//     // 1. Pre-fill basic user fields (handled by defaultValues, but good for safety)
//     setValue('firstName', user.firstName);
//     setValue('lastName', user.lastName);

//     // 2. Pre-fill Guarantors
//     if (user.guarantors && user.guarantors.length > 0) {
//       user.guarantors.forEach((g) => {
//         const prefix = g.position === 1 ? 'guarantor' : 'guarantor2';
//         setValue(`${prefix}.name`, g.name);
//         setValue(`${prefix}.phone`, g.phone);
//         setValue(`${prefix}.relationship`, g.relationship);
//         setValue(`${prefix}.address`, g.address?.street || '');
//         setValue(`${prefix}.idDocument`, g.idDocument);
//       });
//     }

//     // 3. Pre-fill Documents (Medicals and others)
//     if (user.documents && user.documents.length > 0) {
//       const medicalDoc = user.documents.find(d => d.type === 'medical');
//       if (medicalDoc) setValue('medicals', medicalDoc.url);
      
//       // Update the local state for the license/insurance list
//       setUploadedDocuments(user.documents);
//     }
//   }
// }, [user, setValue]);

// useEffect(() => {
//   if (user?.avatar) setAvatarPreview(user.avatar);
//   if (user?.documents?.length > 0) setUploadedDocuments(user.documents);
// }, [user]);

// useEffect(() => {
//   const today = new Date();
//   const max = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
//   setMaxDate(max.toISOString().split("T")[0]);
// }, []);

// // ─── Image Upload with Compression ──────────────────────
// // --- Updated uploadToCloudinary to handle Document State ---
// const uploadToCloudinary = async (originalFile, type) => {
//   if (!originalFile) return;
//   setUploading(true);
//   const loadingToast = toast.loading('Uploading...');

//   try {
//     let fileToUpload = originalFile;
//     if (originalFile.type.startsWith('image/')) {
//       const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
//       fileToUpload = await imageCompression(originalFile, options);
//     }

//     const formData = new FormData();
//     formData.append('file', fileToUpload);
//     formData.append('upload_preset', UPLOAD_PRESET);

//     const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, formData);
//     const url = res.data.secure_url;

//     if (type === 'avatar') {
//       setAvatarPreview(url);
//       setValue('avatar', url);
//     } else if (type === 'guarantorID') {
//       setValue('guarantor.idDocument', url); // Map to Schema name
//     } else if (type === 'guarantor2ID') {
//       setValue('guarantor2.idDocument', url);
//     } else if (type === 'medicals') {
//       setValue('medicals', url);
//     } else {
//       // For general documents (license, insurance, etc.)
//       const newDocs = [...uploadedDocuments.filter(d => d.type !== type), { type, url }];
//       setUploadedDocuments(newDocs);
//     }
//     toast.success('Upload successful!');
//   } catch (err) {
//     toast.error('Upload failed');
//   } finally {
//     setUploading(false);
//     toast.dismiss(loadingToast);
//   }
// };

// // --- Updated onSubmit to format data for the Backend ---
// const onSubmit = async (data) => {
//   const loadingToast = toast.loading('Updating profile...');
  
//   try {
//     // 1. Format Guarantors Array
//     const guarantors = [];
//     if (data.guarantor?.name) {
//       guarantors.push({
//         position: 1,
//         ...data.guarantor,
//         address: { street: data.guarantor.address } // Wrap string into address object
//       });
//     }
//     if (data.guarantor2?.name) {
//       guarantors.push({
//         position: 2,
//         ...data.guarantor2,
//         address: { street: data.guarantor2.address }
//       });
//     }

//     // 2. Format Documents Array (Merging generic docs and specific ones)
//     const documents = [...uploadedDocuments];
//     if (data.guarantor?.idDocument) {
//       documents.push({ type: 'guarantor-id', url: data.guarantor.idDocument, guarantorPosition: 1 });
//     }
//     if (data.guarantor2?.idDocument) {
//       documents.push({ type: 'guarantor-id', url: data.guarantor2.idDocument, guarantorPosition: 2 });
//     }
//     if (data.medicals) {
//       documents.push({ type: 'medical', url: data.medicals });
//     }

//     // 3. Construct Final Payload
//     const payload = {
//       user: {
//         firstName: data.firstName,
//         lastName: data.lastName,
//         phone: data.phone,
//         avatar: avatarPreview,
//         dateOfBirth: data.dateOfBirth,
//         address: data.address,
//         state: data.state,
//         lga: data.lga,
//         vehicle: data.vehicle,
//         category: data.category,
//         preferredPayment: data.preferredPayment
//       },
//       guarantors,
//       documents
//     };

//     await dispatch(updateProfileAsync(payload)).unwrap();
//     toast.success('Profile updated successfully! 🎉');
//   } catch (error) {
//     toast.error(error || 'Update failed');
//   } finally {
//     toast.dismiss(loadingToast);
//   }
// };
  

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}
//       className="max-w-6xl mx-auto py-10 px-6"
//     >
//       <div className="text-center mb-12">
//         <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-4">
//           <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
//             <User className="h-8 w-8 text-white" />
//           </div>
//           Update Your Profile
//         </h1>
//         <p className="text-gray-600 mt-3">Keep your information up to date</p>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
//         {/* Personal Information - unchanged */}
//         <section className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
//           <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
//             <User className="h-7 w-7 text-blue-600" />
//             Personal Information
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
//               <input
//                 {...register('firstName', { required: 'First name is required' })}
//                 className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
//                 placeholder="John"
//               />
//               {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
//               <input
//                 {...register('lastName', { required: 'Last name is required' })}
//                 className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
//                 placeholder="Doe"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                 <Mail className="h-5 w-5 text-gray-500" />
//                 Email Address
//               </label>
//               <input
//                 {...register('email')}
//                 type="email"
//                 disabled
//                 className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                 <Phone className="h-5 w-5 text-gray-500" />
//                 Phone Number
//               </label>
//               <input
//                 {...register('phone', {
//                   required: 'Phone number is required',
//                   pattern: {
//                     value: /^[0-9+\-() \s]*$/,
//                     message: 'Invalid phone number format',
//                   },
//                 })}
//                 type="tel"
//                 inputMode="tel"
//                 placeholder="+234 801 234 5678"
//                 className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
//               />
//               {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>}
//             </div>

// <div>
//   <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//     <ChartBarDecreasingIcon className="h-5 w-5 text-gray-500" />
//     Category
//   </label>

//   <select
//     {...register('category', {
//       required: "Please select a category",
//     })}
//     className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition bg-white text-gray-900 appearance-none cursor-pointer"
//   >
//     <option value="" disabled>
//       Select a category...
//     </option>

//     {Object.entries({
//       'full-time':          { icon: MdWork,          label: 'Full-Time' },
//       'part-time':          { icon: MdSchedule,      label: 'Part-Time' },
//       'weekend':            { icon: MdWeekend,       label: 'Weekend' },
//       'short-time':         { icon: MdTimer,         label: 'Short-Time' },
//       'airport-pickup':     { icon: MdFlight,        label: 'Airport Pickup' },
//       'outstation-travel':  { icon: MdDirectionsCar, label: 'Outstation Travel' },
//       'night-out-designated': { icon: MdNightlight, label: 'Night Out (Designated Driver)' },
//       'executive-chauffeur':  { icon: MdBusinessCenter, label: 'Executive Chauffeur' },
//       'family-child-friendly': { icon: MdFamilyRestroom, label: 'Family / Child-Friendly' },
//       'school-bus':         { icon: MdSchool,        label: 'School Bus' },
//       'tanker-hazmat':      { icon: MdLocalShipping, label: 'Tanker / Hazmat' },
//       'retained-monthly':   { icon: MdCalendarMonth, label: 'Retained Monthly' },
//     }).map(([value, { icon: Icon, label }]) => (
//       <option key={value} value={value}>
//         {label}
//       </option>
//     ))}
//   </select>

//   {/* Custom dropdown arrow */}
//   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 mt-[2.35rem]">
//     <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
//       <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//     </svg>
//   </div>

//   {errors.category && (
//     <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
//   )}
// </div>

//             <div className="md:col-span-2">
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-900 mb-2 flex items-center gap-2">
//                 <Cake className="h-5 w-5 text-gray-900 dark:text-gray-400" />
//                 Date of Birth
//               </label>
//               <input
//                 {...register("dateOfBirth", {
//                   required: "Date of birth is required",
//                   validate: (value) => {
//                     const birthDate = new Date(value);
//                     const ageDifMs = Date.now() - birthDate.getTime();
//                     const ageDate = new Date(ageDifMs);
//                     const age = Math.abs(ageDate.getUTCFullYear() - 1970);
//                     return age >= 18 || "You must be at least 18 years old";
//                   },
//                 })}
//                 type="date"
//                 max={maxDate}
//                 className="w-full px-5 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-white text-gray-900 dark:text-gray-900"
//               />
//               {errors.dateOfBirth && (
//                 <p className="mt-2 text-sm text-red-600 dark:text-red-400">
//                   {errors.dateOfBirth.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Avatar Upload */}
//           <div className="mt-10 flex flex-col items-center">
//             <div className="relative">
//               <img
//                 src={avatarPreview || 'https://via.placeholder.com/150?text=Profile'}
//                 alt="Profile"
//                 className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-2xl"
//               />
//               <label className="absolute bottom-2 right-2 cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-110">
//                 <Camera className="h-6 w-6 text-white" />
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => uploadToCloudinary(e.target.files?.[0], 'avatar')}
//                   className="hidden"
//                   disabled={uploading}
//                 />
//               </label>
//             </div>
//             <p className="mt-4 text-sm text-gray-600">Click the camera to change photo</p>
//           </div>
//         </section>

//         {/* Address - unchanged */}
//         <section className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
//           <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
//             <MapPin className="h-7 w-7 text-blue-600" />
//             Address
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <input {...register('address')} placeholder="Street Address" className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
//             <input {...register('lga')} placeholder="LGA" className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
//             <input {...register('state')} placeholder="State / Province" className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
//             <input {...register('zipCode')} placeholder="ZIP / Postal Code" className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
//             <input {...register('country')} defaultValue="NIGERIA" className="md:col-span-2 px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
//           </div>
//         </section>

//         {/* Driver: Vehicle */}
//         {role === 'driver' && (
//           <section className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
//             <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
//               <Car className="h-7 w-7 text-blue-600" />
//               Vehicle Details
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               <input {...register('vehicle.make', { required: true })} placeholder="Make (e.g. Toyota)" className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
//               <input {...register('vehicle.model', { required: true })} placeholder="Model (e.g. Camry)" className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
//               <input {...register('vehicle.year', { required: true })} type="number" placeholder="Year" className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
//               <input {...register('vehicle.color')} placeholder="Color" className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
//               <input {...register('vehicle.licensePlate', { required: true })} placeholder="License Plate" className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
//               <input {...register('vehicle.capacity')} type="number" min="1" placeholder="Passenger Capacity" className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
//             </div>
//           </section>
//         )}

//         {/* NEW: Driver Guarantors & Medicals */}
//         {role === 'driver' && (
//           <section className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
//             <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
//               <HeartHandshake className="h-7 w-7 text-blue-600" />
//               Guarantors & Medicals
//             </h2>

//             {/* Guarantor 1 */}
//             <div className="mb-10">
//               <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                 <User className="h-6 w-6 text-green-600" />
//                 Guarantor 1
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <input
//                   {...register('guarantor.name')}
//                   placeholder="Full Name"
//                   className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
//                 />
//                 <input
//                   {...register('guarantor.phone')}
//                   placeholder="Phone Number"
//                   className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
//                 />
//                 <input
//                   {...register('guarantor.address')}
//                   placeholder="Address"
//                   className="md:col-span-2 px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
//                 />
//                 <input
//                   {...register('guarantor.relationship')}
//                   placeholder="Relationship (e.g. Father, Brother)"
//                   className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
//                 />
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     ID Document (Upload)
//                   </label>
//                   <label className="cursor-pointer flex items-center gap-3 px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition">
//                     <Upload className="h-5 w-5 text-gray-600" />
//                     <span>{watch('guarantor.IDDocument') ? 'Replace' : 'Upload ID'}</span>
//                     <input
//                       type="file"
//                       accept="image/*,.pdf"
//                       onChange={(e) => uploadToCloudinary(e.target.files?.[0], 'guarantorID')}
//                       className="hidden"
//                       disabled={uploading}
//                     />
//                   </label>
//                   {watch('guarantor.IDDocument') && (
//                     <a
//                       href={watch('guarantor.IDDocument')}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-sm text-blue-600 hover:underline mt-2 block"
//                     >
//                       View uploaded document
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Guarantor 2 */}
//             <div className="mb-10">
//               <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                 <User className="h-6 w-6 text-green-600" />
//                 Guarantor 2
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <input
//                   {...register('guarantor2.name')}
//                   placeholder="Full Name"
//                   className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
//                 />
//                 <input
//                   {...register('guarantor2.phone')}
//                   placeholder="Phone Number"
//                   className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
//                 />
//                 <input
//                   {...register('guarantor2.address')}
//                   placeholder="Address"
//                   className="md:col-span-2 px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
//                 />
//                 <input
//                   {...register('guarantor2.relationship')}
//                   placeholder="Relationship (e.g. Mother, Sister)"
//                   className="px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
//                 />
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     ID Document (Upload)
//                   </label>
//                   <label className="cursor-pointer flex items-center gap-3 px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition">
//                     <Upload className="h-5 w-5 text-gray-600" />
//                     <span>{watch('guarantor2.IDDocument') ? 'Replace' : 'Upload ID'}</span>
//                     <input
//                       type="file"
//                       accept="image/*,.pdf"
//                       onChange={(e) => uploadToCloudinary(e.target.files?.[0], 'guarantor2ID')}
//                       className="hidden"
//                       disabled={uploading}
//                     />
//                   </label>
//                   {watch('guarantor2.IDDocument') && (
//                     <a
//                       href={watch('guarantor2.IDDocument')}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-sm text-blue-600 hover:underline mt-2 block"
//                     >
//                       View uploaded document
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Medicals */}
//             <div>
//               <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                 <Stethoscope className="h-6 w-6 text-blue-600" />
//                 Medical Report
//               </h3>
//               <label className="cursor-pointer flex items-center gap-3 px-6 py-5 bg-gray-100 border border-gray-300 rounded-2xl hover:bg-gray-200 transition w-full md:w-auto">
//                 <Upload className="h-6 w-6 text-gray-600" />
//                 <span>{watch('medicals') ? 'Replace Medical Report' : 'Upload Medical Report (PDF/Image)'}</span>
//                 <input
//                   type="file"
//                   accept="image/*,.pdf"
//                   onChange={(e) => uploadToCloudinary(e.target.files?.[0], 'medicals')}
//                   className="hidden"
//                   disabled={uploading}
//                 />
//               </label>
//               {watch('medicals') && (
//                 <div className="mt-4">
//                   <a
//                     href={watch('medicals')}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 hover:underline flex items-center gap-2"
//                   >
//                     <FileText size={18} />
//                     View current medical report
//                   </a>
//                 </div>
//               )}
//             </div>
//           </section>
//         )}

//         {/* Driver: Documents - unchanged */}
//         {role === 'driver' && (
//           <section className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
//             <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
//               <FileText className="h-7 w-7 text-blue-600" />
//               Required Documents
//             </h2>
//             <div className="space-y-8">
//               {['license', 'insurance', 'registration'].map((type) => {
//                 const doc = uploadedDocuments.find(d => d.type === type);
//                 return (
//                   <div key={type} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
//                     <div>
//                       <p className="font-semibold text-gray-800 capitalize">
//                         {type === 'license' ? "Driver's License" : type.charAt(0).toUpperCase() + type.slice(1)}
//                       </p>
//                       {doc && (
//                         <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
//                           View current document →
//                         </a>
//                       )}
//                     </div>
//                     <label className="cursor-pointer px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition transform hover:scale-105">
//                       <Upload className="h-5 w-5 inline mr-2" />
//                       {doc ? 'Replace' : 'Upload'}
//                       <input
//                         type="file"
//                         accept="image/*,.pdf"
//                         onChange={(e) => uploadToCloudinary(e.target.files?.[0], type)}
//                         className="hidden"
//                         disabled={uploading}
//                       />
//                     </label>
//                   </div>
//                 );
//               })}
//             </div>
//           </section>
//         )}

//         {/* Payment Preference - unchanged */}
//         <section className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
//           <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
//             <CreditCard className="h-7 w-7 text-blue-600" />
//             Preferred Payment Method
//           </h2>
//           <select
//             {...register('preferredPayment')}
//             className="w-full max-w-md px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg"
//           >
//             <option value="card">Credit / Debit Card</option>
//             <option value="wallet">Digital Wallet</option>
//             <option value="cash">Cash on Delivery</option>
//           </select>
//         </section>

//         {/* Submit Button */}
//         <div className="flex justify-center mt-12">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             type="submit"
//             disabled={uploading}
//             className="px-16 py-5 text-xl font-bold text-white rounded-2xl shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed transition-all"
//             style={{
//               background: `linear-gradient(135deg, ${PRIMARY_500}, ${PRIMARY_700})`,
//               boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
//             }}
//           >
//             {uploading ? 'Saving Changes...' : 'Save Profile'}
//           </motion.button>
//         </div>
//       </form>
//     </motion.div>
//   );
// };

// export default ProfileUpdate;

/* eslint-disable no-unused-vars */
// src/pages/Dashboard/ProfileUpdate.jsx
import { statesAndLgas } from '../../utils/stateAndLga';
import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Cake,
  Upload,
  Car,
  FileText,
  CreditCard,
  Camera,
  HeartHandshake,
  Stethoscope,
  ChartBarDecreasingIcon,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { updateProfileAsync } from '../../store/slices/userSlice';
import imageCompression from 'browser-image-compression';
import {
  MdWork, MdSchedule, MdWeekend, MdTimer,
  MdFlight, MdDirectionsCar, MdNightlight,
  MdBusinessCenter, MdFamilyRestroom, MdSchool,
  MdLocalShipping, MdCalendarMonth,
} from 'react-icons/md';

const PRIMARY_500 = '#3B82F6';
const PRIMARY_600 = '#2563EB';
const PRIMARY_700 = '#1D4ED8';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CATEGORY_OPTIONS = {
  'full-time': { icon: MdWork, label: 'Full-Time' },
  'part-time': { icon: MdSchedule, label: 'Part-Time' },
  weekend: { icon: MdWeekend, label: 'Weekend' },
  'short-time': { icon: MdTimer, label: 'Short-Time' },
  'airport-pickup': { icon: MdFlight, label: 'Airport Pickup' },
  'outstation-travel': { icon: MdDirectionsCar, label: 'Outstation Travel' },
  'night-out-designated': { icon: MdNightlight, label: 'Night Out (Designated Driver)' },
  'executive-chauffeur': { icon: MdBusinessCenter, label: 'Executive Chauffeur' },
  'family-child-friendly': { icon: MdFamilyRestroom, label: 'Family / Child-Friendly' },
  'school-bus': { icon: MdSchool, label: 'School Bus' },
  'tanker-hazmat': { icon: MdLocalShipping, label: 'Tanker / Hazmat' },
  'retained-monthly': { icon: MdCalendarMonth, label: 'Retained Monthly' },
};

const SectionCard = ({ icon: Icon, title, children, id }) => (
  <section
    id={id}
    className="bg-white rounded-2xl sm:rounded-3xl shadow-sm sm:shadow-lg border border-gray-100 p-5 sm:p-8 scroll-mt-24"
  >
    <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center gap-2.5 sm:gap-3">
      <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-blue-600 shrink-0" />
      {title}
    </h2>
    {children}
  </section>
);

const inputClass =
  'w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-sm sm:text-base';

const ProfileUpdate = () => {
  const dispatch = useDispatch();
  const [maxDate, setMaxDate] = useState('');
  const { user, token: reduxToken } = useSelector((state) => state.user);
  const role = user?.role || 'client';

  const token = reduxToken || localStorage.getItem('token');
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  const [uploading, setUploading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [displayName, setDisplayName] = useState({ first: '', last: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      state: '',
      lga: '',
      category: 'full-time',
      country: 'NIGERIA',
      vehicle: { make: '', model: '', year: '', color: '', licensePlate: '', capacity: 4 },
      preferredPayment: 'card',
    },
  });

  const selectedState = watch('state');
const lgaOptions = useMemo(() => statesAndLgas[selectedState] || [], [selectedState]);

useEffect(() => {
  const currentLga = watch('lga');
  if (selectedState && currentLga && !lgaOptions.includes(currentLga)) {
    setValue('lga', '');
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedState]);

  // ─── Fetch the full saved profile and prefill everything ─────────────
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoadingProfile(true);
      try {
        const res = await axios.get(`${API_BASE}/api/users/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedUser = res.data?.data?.user;
        if (!fetchedUser) return;

        reset({
          firstName: fetchedUser.firstName || '',
          lastName: fetchedUser.lastName || '',
          email: fetchedUser.email || '',
          phone: fetchedUser.phone || '',
          dateOfBirth: fetchedUser.dateOfBirth
            ? new Date(fetchedUser.dateOfBirth).toISOString().split('T')[0]
            : '',
          address: fetchedUser.address || '',
          state: fetchedUser.state || '',
          lga: fetchedUser.lga || '',
          category: fetchedUser.category || 'full-time',
          country: fetchedUser.country || 'NIGERIA',
          vehicle: fetchedUser.vehicle || {
            make: '', model: '', year: '', color: '', licensePlate: '', capacity: 4,
          },
          preferredPayment: fetchedUser.preferredPayment || 'card',
        });

        setDisplayName({ first: fetchedUser.firstName, last: fetchedUser.lastName });
        if (fetchedUser.avatar) setAvatarPreview(fetchedUser.avatar);

        if (fetchedUser.guarantors?.length > 0) {
          fetchedUser.guarantors.forEach((g) => {
            const prefix = g.position === 1 ? 'guarantor' : 'guarantor2';
            setValue(`${prefix}.name`, g.name || '');
            setValue(`${prefix}.phone`, g.phone || '');
            setValue(`${prefix}.relationship`, g.relationship || '');
            setValue(`${prefix}.address`, g.address?.street || '');
            setValue(`${prefix}.idDocument`, g.idDocument || '');
          });
        }

        if (fetchedUser.documents?.length > 0) {
          const medicalDoc = fetchedUser.documents.find((d) => d.type === 'medical');
          if (medicalDoc) setValue('medicals', medicalDoc.url);

          const generalDocs = fetchedUser.documents.filter(
            (d) => !['medical', 'guarantor-id'].includes(d.type)
          );
          setUploadedDocuments(generalDocs);
        }
      } catch (err) {
        console.error('Failed to load profile for prefill:', err);
        toast.error('Could not load your saved profile details');
      } finally {
        setLoadingProfile(false);
      }
    };

    if (token) fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const today = new Date();
    const max = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    setMaxDate(max.toISOString().split('T')[0]);
  }, []);

  // ─── Live completeness meter for the hero ─────────────────────────────
  const watchedFields = watch();
  const completion = useMemo(() => {
    const checks = [
      !!avatarPreview,
      !!watchedFields.phone,
      !!watchedFields.address,
      !!watchedFields.state,
      !!watchedFields.lga,
      !!watchedFields.dateOfBirth,
    ];
    if (role === 'driver') {
      checks.push(
        !!watchedFields.vehicle?.make,
        !!watchedFields.vehicle?.model,
        !!watchedFields.vehicle?.licensePlate,
        !!watchedFields.guarantor?.name,
        !!watchedFields.medicals
      );
    }
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [watchedFields, avatarPreview, role]);

  // ─── Image Upload with Compression ────────────────────────────────────
  const uploadToCloudinary = async (originalFile, type) => {
    if (!originalFile) return;
    setUploading(true);
    const loadingToast = toast.loading('Uploading...');

    try {
      let fileToUpload = originalFile;
      if (originalFile.type.startsWith('image/')) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        fileToUpload = await imageCompression(originalFile, options);
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('upload_preset', UPLOAD_PRESET);

      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, formData);
      const url = res.data.secure_url;

      if (type === 'avatar') {
        setAvatarPreview(url);
        setValue('avatar', url);
      } else if (type === 'guarantorID') {
        setValue('guarantor.idDocument', url);
      } else if (type === 'guarantor2ID') {
        setValue('guarantor2.idDocument', url);
      } else if (type === 'medicals') {
        setValue('medicals', url);
      } else {
        const newDocs = [...uploadedDocuments.filter((d) => d.type !== type), { type, url }];
        setUploadedDocuments(newDocs);
      }
      toast.success('Upload successful!');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      toast.dismiss(loadingToast);
    }
  };

  const onSubmit = async (data) => {
    const loadingToast = toast.loading('Updating profile...');

    try {
      const guarantors = [];
      if (data.guarantor?.name) {
        guarantors.push({
          position: 1,
          ...data.guarantor,
          address: { street: data.guarantor.address },
        });
      }
      if (data.guarantor2?.name) {
        guarantors.push({
          position: 2,
          ...data.guarantor2,
          address: { street: data.guarantor2.address },
        });
      }

      const documents = [...uploadedDocuments];
      if (data.guarantor?.idDocument) {
        documents.push({ type: 'guarantor-id', url: data.guarantor.idDocument, guarantorPosition: 1 });
      }
      if (data.guarantor2?.idDocument) {
        documents.push({ type: 'guarantor-id', url: data.guarantor2.idDocument, guarantorPosition: 2 });
      }
      if (data.medicals) {
        documents.push({ type: 'medical', url: data.medicals });
      }

      const payload = {
        user: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          avatar: avatarPreview,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          state: data.state,
          lga: data.lga,
          vehicle: data.vehicle,
          category: data.category,
          preferredPayment: data.preferredPayment,
        },
        guarantors,
        documents,
      };

      await dispatch(updateProfileAsync(payload)).unwrap();
      toast.success('Profile updated successfully! 🎉');
    } catch (error) {
      toast.error(error || 'Update failed');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const sections = [
    { id: 'personal', label: 'Personal', show: true },
    { id: 'address', label: 'Address', show: true },
    { id: 'vehicle', label: 'Vehicle', show: role === 'driver' },
    { id: 'guarantors', label: 'Guarantors', show: role === 'driver' },
    { id: 'documents', label: 'Documents', show: role === 'driver' },
    { id: 'payment', label: 'Payment', show: true },
  ].filter((s) => s.show);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loadingProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4">
        <div className="w-9 h-9 rounded-full border-[3px] border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-gray-500 text-sm">Loading your profile…</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28"
    >
      {/* ── Hero: identity + completeness ──────────────────────────── */}
      <div
        className="rounded-3xl p-5 sm:p-8 mb-6 sm:mb-10 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${PRIMARY_600}, ${PRIMARY_700})` }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-14 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
          <div className="relative shrink-0 mx-auto sm:mx-0">
            <img
              src={avatarPreview || 'https://via.placeholder.com/150?text=Profile'}
              alt="Profile"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white/70 shadow-xl"
            />
            <label className="absolute bottom-0 right-0 cursor-pointer bg-white text-blue-600 p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
              <Camera className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadToCloudinary(e.target.files?.[0], 'avatar')}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-100">
              {role === 'driver' ? 'Driver profile' : 'Passenger profile'}
            </p>
            <h1 className="text-xl sm:text-3xl font-bold truncate">
              {displayName.first || 'Your'} {displayName.last || 'Profile'}
            </h1>
            <p className="text-blue-100 text-sm mt-1">Keep your details up to date to stay verified.</p>

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

      {/* ── Section nav ─────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sticky top-0 z-10 py-2 bg-gray-50/90 backdrop-blur sm:static sm:bg-transparent sm:backdrop-blur-none">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollToSection(s.id)}
            className="shrink-0 text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-10">
        {/* Personal Information */}
        <SectionCard id="personal" icon={User} title="Personal Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                className={inputClass}
                placeholder="John"
              />
              {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                className={inputClass}
                placeholder="Doe"
              />
              {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                disabled
                className={`${inputClass} bg-gray-50 cursor-not-allowed`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                Phone Number
              </label>
              <input
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: { value: /^[0-9+\-() \s]*$/, message: 'Invalid phone number format' },
                })}
                type="tel"
                inputMode="tel"
                placeholder="+234 801 234 5678"
                className={inputClass}
              />
              {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>}
            </div>
{/* 
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ChartBarDecreasingIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                Category
              </label>
              <select
                {...register('category', { required: 'Please select a category' })}
                className={`${inputClass} bg-white appearance-none cursor-pointer pr-10`}
              >
                <option value="" disabled>Select a category...</option>
                {Object.entries(CATEGORY_OPTIONS).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 mt-7">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>}
            </div> */}

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Cake className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                Date of Birth
              </label>
              <input
                {...register('dateOfBirth', {
                  required: 'Date of birth is required',
                  validate: (value) => {
                    const birthDate = new Date(value);
                    const ageDifMs = Date.now() - birthDate.getTime();
                    const ageDate = new Date(ageDifMs);
                    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                    return age >= 18 || 'You must be at least 18 years old';
                  },
                })}
                type="date"
                max={maxDate}
                className={inputClass}
              />
              {errors.dateOfBirth && <p className="mt-2 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
            </div>
          </div>
        </SectionCard>

        {/* Address */}
        <SectionCard id="address" icon={MapPin} title="Address">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            <input {...register('address')} placeholder="Street Address" className={inputClass} />
       <div className="relative">
  <select
    {...register('state', { required: 'State is required' })}
    className={`${inputClass} bg-white appearance-none cursor-pointer pr-10`}
  >
    <option value="" disabled>Select State...</option>
    {Object.keys(statesAndLgas).map((stateName) => (
      <option key={stateName} value={stateName}>{stateName}</option>
    ))}
  </select>
  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  </div>
  {errors.state && <p className="mt-2 text-sm text-red-600">{errors.state.message}</p>}
</div>

<div className="relative">
  <select
    {...register('lga', { required: 'LGA is required' })}
    disabled={!selectedState}
    className={`${inputClass} bg-white appearance-none cursor-pointer pr-10 disabled:bg-gray-50 disabled:cursor-not-allowed`}
  >
    <option value="" disabled>
      {selectedState ? 'Select LGA...' : 'Select a state first'}
    </option>
    {lgaOptions.map((lgaName) => (
      <option key={lgaName} value={lgaName}>{lgaName}</option>
    ))}
  </select>
  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  </div>
  {errors.lga && <p className="mt-2 text-sm text-red-600">{errors.lga.message}</p>}
</div>
            <input {...register('zipCode')} placeholder="ZIP / Postal Code" className={inputClass} />
            <input
              {...register('country')}
              defaultValue="NIGERIA"
              className={`md:col-span-2 ${inputClass}`}
            />
          </div>
        </SectionCard>

        {/* Driver: Vehicle */}
        {role === 'driver' && (
          <SectionCard id="vehicle" icon={Car} title="Vehicle Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
              <input {...register('vehicle.make', { required: true })} placeholder="Make (e.g. Toyota)" className={inputClass} />
              <input {...register('vehicle.model', { required: true })} placeholder="Model (e.g. Camry)" className={inputClass} />
              <input {...register('vehicle.year', { required: true })} type="number" placeholder="Year" className={inputClass} />
              <input {...register('vehicle.color')} placeholder="Color" className={inputClass} />
              <input {...register('vehicle.licensePlate', { required: true })} placeholder="License Plate" className={inputClass} />
              <input {...register('vehicle.capacity')} type="number" min="1" placeholder="Passenger Capacity" className={inputClass} />
            </div>
          </SectionCard>
        )}

        {/* Driver: Guarantors & Medicals */}
        {role === 'driver' && (
          <SectionCard id="guarantors" icon={HeartHandshake} title="Guarantors & Medicals">
            {[1, 2].map((num) => {
              const prefix = num === 1 ? 'guarantor' : 'guarantor2';
              return (
                <div key={num} className="mb-8 sm:mb-10 last:mb-0">
                  <h3 className="text-base sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    Guarantor {num}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <input {...register(`${prefix}.name`)} placeholder="Full Name" className={inputClass} />
                    <input {...register(`${prefix}.phone`)} placeholder="Phone Number" className={inputClass} />
                    <input {...register(`${prefix}.address`)} placeholder="Address" className={`md:col-span-2 ${inputClass}`} />
                    <input
                      {...register(`${prefix}.relationship`)}
                      placeholder={`Relationship (e.g. ${num === 1 ? 'Father, Brother' : 'Mother, Sister'})`}
                      className={inputClass}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Document (Upload)</label>
                      <label className="cursor-pointer flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border border-gray-300 rounded-xl hover:bg-gray-100 transition text-sm sm:text-base">
                        <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 shrink-0" />
                        <span className="truncate">
                          {watch(`${prefix}.idDocument`) ? 'Replace' : 'Upload ID'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => uploadToCloudinary(e.target.files?.[0], num === 1 ? 'guarantorID' : 'guarantor2ID')}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {watch(`${prefix}.idDocument`) && (
                        <a
                          href={watch(`${prefix}.idDocument`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-2 block"
                        >
                          View uploaded document
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div>
              <h3 className="text-base sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                Medical Report
              </h3>
              <label className="cursor-pointer flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-5 bg-gray-50 border border-gray-300 rounded-2xl hover:bg-gray-100 transition w-full md:w-auto text-sm sm:text-base">
                <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 shrink-0" />
                <span className="truncate">{watch('medicals') ? 'Replace Medical Report' : 'Upload Medical Report (PDF/Image)'}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => uploadToCloudinary(e.target.files?.[0], 'medicals')}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {watch('medicals') && (
                <a
                  href={watch('medicals')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-blue-600 hover:underline flex items-center gap-2 text-sm"
                >
                  <FileText size={16} />
                  View current medical report
                </a>
              )}
            </div>
          </SectionCard>
        )}

        {/* Driver: Documents */}
        {role === 'driver' && (
          <SectionCard id="documents" icon={FileText} title="Required Documents">
            <div className="space-y-4 sm:space-y-6">
              {['license', 'insurance', 'registration'].map((type) => {
                const doc = uploadedDocuments.find((d) => d.type === type);
                return (
                  <div
                    key={type}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 bg-gray-50 rounded-2xl"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {doc ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 capitalize truncate">
                          {type === 'license' ? "Driver's License" : type}
                        </p>
                        {doc && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs sm:text-sm"
                          >
                            View current document →
                          </a>
                        )}
                      </div>
                    </div>
                    <label className="cursor-pointer shrink-0 px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-sm rounded-xl hover:shadow-lg transition-shadow text-center">
                      <Upload className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                      {doc ? 'Replace' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => uploadToCloudinary(e.target.files?.[0], type)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Payment Preference */}
        <SectionCard id="payment" icon={CreditCard} title="Preferred Payment Method">
          <select
            {...register('preferredPayment')}
            className={`w-full max-w-md ${inputClass}`}
          >
            <option value="card">Credit / Debit Card</option>
            <option value="wallet">Digital Wallet</option>
            <option value="cash">Cash on Delivery</option>
          </select>
        </SectionCard>
      </form>

      {/* ── Sticky save bar ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <p className="hidden sm:block text-sm text-gray-500">
            {completion}% complete — keep going!
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={uploading}
            className="w-full sm:w-auto px-8 sm:px-14 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-white rounded-2xl shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY_500}, ${PRIMARY_700})`,
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
            }}
          >
            {uploading ? 'Saving Changes...' : 'Save Profile'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileUpdate;










































