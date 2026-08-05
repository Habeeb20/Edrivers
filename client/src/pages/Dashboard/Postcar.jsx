




// src/pages/Owner/PostCar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Car, Upload, MapPin, CheckCircle, X, Loader2, User, FileText, Image as ImageIcon, Snowflake,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const CLOUDINARY_UPLOAD_PRESET = 'essential';
const CLOUDINARY_CLOUD_NAME = 'dc0poqt9l';

const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
  <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-8">
    <div className="mb-5 sm:mb-6">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5 sm:gap-3">
        <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-blue-600 shrink-0" />
        {title}
      </h2>
      {subtitle && <p className="text-xs sm:text-sm text-gray-400 mt-1 ml-7 sm:ml-10">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const fieldClass =
  'w-full p-3.5 sm:p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition text-sm sm:text-base';

const Dropzone = ({ label, onChange, disabled, multiple, accept = 'image/*', hint }) => (
  <label className="block cursor-pointer">
    <div className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-2xl p-5 sm:p-6 text-center transition-colors bg-gray-50/50">
      <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
      <span className="text-sm font-medium text-gray-600">{label}</span>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      onChange={onChange}
      disabled={disabled}
      className="hidden"
    />
  </label>
);

const PostCar = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    make: '', model: '', year: '', color: '', plateNumber: '',
    transmission: 'automatic', fuelType: 'petrol',
    rentalPriceWithFuel: '', rentalPriceWithoutFuel: '',
    hasAirCondition: true, location: '',
    driver: { name: '', contactNumber: '', photo: '', yearsOfExperience: '' },
    photos: [],
    documents: { insurance: '', roadWorthy: '', license: '' },
  });

  const token = localStorage.getItem('token');

  const uploadToCloudinary = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        formData
      );
      return res.data.secure_url;
    } catch (err) {
      toast.error(`Failed to upload ${type}`);
      throw err;
    }
  };

  const handlePhotosChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((file) => uploadToCloudinary(file, 'photo')));
      setForm((f) => ({ ...f, photos: [...f.photos, ...urls] }));
      toast.success(`${files.length} photo(s) uploaded successfully`);
    } catch (err) {
      // already toasted
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentChange = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, docType);
      setForm((f) => ({ ...f, documents: { ...f.documents, [docType]: url } }));
      toast.success(`${docType.replace(/([A-Z])/g, ' $1')} uploaded`);
    } catch (err) {
      // already toasted
    } finally {
      setUploading(false);
    }
  };

  const handleDriverPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'driver photo');
      setForm((f) => ({ ...f, driver: { ...f.driver, photo: url } }));
      toast.success('Driver photo uploaded');
    } catch (err) {
      // already toasted
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.make || !form.model || !form.year || !form.location) {
      toast.error('Please fill all required car details');
      return;
    }
    if (!form.rentalPriceWithFuel || !form.rentalPriceWithoutFuel) {
      toast.error('Please enter both rental prices (with and without fuel)');
      return;
    }
    if (form.photos.length < 3) {
      toast.error('Please upload at least 3 car photos');
      return;
    }
    if (!form.documents.insurance || !form.documents.roadWorthy || !form.documents.license) {
      toast.error('Please upload all required documents');
      return;
    }
    if (!form.driver.name || !form.driver.contactNumber) {
      toast.error('Please provide driver name and contact number');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rent-car/post-car`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Car posted successfully! Awaiting admin approval.');
      setForm({
        make: '', model: '', year: '', color: '', plateNumber: '',
        transmission: 'automatic', fuelType: 'petrol',
        rentalPriceWithFuel: '', rentalPriceWithoutFuel: '',
        hasAirCondition: true, location: '',
        driver: { name: '', contactNumber: '', photo: '', yearsOfExperience: '' },
        photos: [],
        documents: { insurance: '', roadWorthy: '', license: '' },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post car');
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (index) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
  };

  const docLabels = { insurance: 'Insurance', roadWorthy: 'Road Worthiness', license: "Driver's License" };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 pb-32">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase mb-2">
            Car owner
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Post Your Car for Rent</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            Give renters everything they need to trust and book your car.
          </p>
        </motion.div>

        <div className="space-y-5 sm:space-y-8">
          {/* Car details */}
          <SectionCard icon={Car} title="Car Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <input placeholder="Car Make (e.g. Toyota)" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className={fieldClass} />
              <input placeholder="Model (e.g. Camry)" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={fieldClass} />
              <input type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={fieldClass} />
              <input placeholder="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={fieldClass} />
              <input placeholder="Plate Number" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })} className={fieldClass} />
              <select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} className={`${fieldClass} bg-white`}>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
              <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} className={`${fieldClass} bg-white`}>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <div className="relative sm:col-span-2">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Location (City, State)"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={`${fieldClass} pl-11`}
                />
              </div>
            </div>
          </SectionCard>

          {/* AC & Pricing */}
          <SectionCard icon={Snowflake} title="Comfort & Pricing">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Air Conditioning</label>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, hasAirCondition: true })}
                    className={`flex-1 py-3 sm:py-3.5 rounded-xl font-medium text-sm transition-colors ${
                      form.hasAirCondition ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, hasAirCondition: false })}
                    className={`flex-1 py-3 sm:py-3.5 rounded-xl font-medium text-sm transition-colors ${
                      !form.hasAirCondition ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Price with fuel (₦/day)</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={form.rentalPriceWithFuel}
                  onChange={(e) => setForm({ ...form, rentalPriceWithFuel: e.target.value })}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Price without fuel (₦/day)</label>
                <input
                  type="number"
                  placeholder="e.g. 35000"
                  value={form.rentalPriceWithoutFuel}
                  onChange={(e) => setForm({ ...form, rentalPriceWithoutFuel: e.target.value })}
                  className={fieldClass}
                />
              </div>
            </div>
          </SectionCard>

          {/* Driver info */}
          <SectionCard icon={User} title="Driver Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <input placeholder="Driver Full Name" value={form.driver.name} onChange={(e) => setForm({ ...form, driver: { ...form.driver, name: e.target.value } })} className={fieldClass} />
              <input placeholder="Driver Contact Number" value={form.driver.contactNumber} onChange={(e) => setForm({ ...form, driver: { ...form.driver, contactNumber: e.target.value } })} className={fieldClass} />
              <input type="number" placeholder="Years of Experience" value={form.driver.yearsOfExperience} onChange={(e) => setForm({ ...form, driver: { ...form.driver, yearsOfExperience: e.target.value } })} className={fieldClass} />

              <div>
                {form.driver.photo ? (
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                      <img src={form.driver.photo} alt="Driver" className="w-full h-full object-cover rounded-2xl shadow" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, driver: { ...form.driver, photo: '' } })}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <label className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                      Replace photo
                      <input type="file" accept="image/*" onChange={handleDriverPhotoChange} disabled={uploading} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <Dropzone label="Upload driver photo" onChange={handleDriverPhotoChange} disabled={uploading} />
                )}
              </div>
            </div>
          </SectionCard>

          {/* Car photos */}
          <SectionCard icon={ImageIcon} title="Car Photos" subtitle="Upload at least 3 clear photos of the car">
            <Dropzone
              label={uploading ? 'Uploading…' : 'Click to upload car photos'}
              hint="You can select multiple images at once"
              onChange={handlePhotosChange}
              disabled={uploading}
              multiple
            />

            {uploading && (
              <p className="text-blue-600 flex items-center gap-2 mt-4 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading photos...
              </p>
            )}

            {form.photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-5">
                {form.photos.map((url, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={url} alt={`Car ${i}`} className="w-full h-full object-cover rounded-2xl shadow" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3">{form.photos.length} of 3 minimum photos uploaded</p>
          </SectionCard>

          {/* Documents */}
          <SectionCard icon={FileText} title="Required Documents">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {Object.keys(docLabels).map((doc) => (
                <div key={doc}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">{docLabels[doc]}</label>
                  {form.documents[doc] ? (
                    <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-800 font-medium text-sm">Uploaded</span>
                      <label className="ml-auto text-xs text-blue-600 hover:underline cursor-pointer shrink-0">
                        Replace
                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocumentChange(e, doc)} disabled={uploading} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <Dropzone label="Upload document" accept="image/*,application/pdf" onChange={(e) => handleDocumentChange(e, doc)} disabled={uploading} />
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Sticky submit bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base sm:text-lg font-bold rounded-2xl shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Posting Car...
              </>
            ) : (
              'Post Car for Rent'
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PostCar;