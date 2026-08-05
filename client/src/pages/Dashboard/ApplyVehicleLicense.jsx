// src/pages/User/ApplyVehicleLicense.jsx
// Beautiful, responsive component for users to apply for new or renew vehicle license

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Car, Calendar, FileText, Upload, DollarSign, CheckCircle, AlertCircle, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import MyVehicleLicenses from './MyVechileLicense';

const NEW_VEHICLE_LICENSE_PRICE = 5000000; // ₦50,000 in kobo
const RENEWAL_VEHICLE_LICENSE_PRICE = 2000000; // ₦20,000 in kobo
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const ApplyVehicleLicense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [isRenewal, setIsRenewal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const [form, setForm] = useState({
    // Common fields
    ownerFullName: '',
    ownerPhone: '',
    ownerEmail: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    chassisNumber: '',
    engineNumber: '',
    plateNumber: '',
    vehicleColor: '',
    fuelType: 'petrol',
    vehicleType: '',
    vehiclePhoto: '',
    proofOfOwnership: '',
    insuranceCertificate: '',
    roadWorthyCertificate: '',

    // Renewal only
    currentLicenseNumber: '',
    currentExpiryDate: '',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setPaymentStatus('success');
      toast.success('Payment successful! Your vehicle license application has been submitted.');
      setTimeout(() => navigate('/dashboard'), 5000);
    } else if (status === 'failed') {
      setPaymentStatus('failed');
      toast.error('Payment failed. Please try again.');
    }
  }, [searchParams, navigate]);


  const handleInput = (field, regex, maxLength) => (e) => {
  const value = e.target.value.toUpperCase();

  if (!regex.test(value)) return;
  if (maxLength && value.length > maxLength) return;

  setForm(prev => ({ ...prev, [field]: value }));
};

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET); 

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, // Replace with your cloud name
        formData
      );
      setForm({ ...form, [field]: res.data.secure_url });
      toast.success(`${field.replace(/([A-Z])/g, ' $1')} uploaded successfully`);
    } catch (err) {
      console.log(err)
      toast.error('Upload failed');
    }
  };

  const handleSubmit = async () => {
    const requiredCommon = [
      'ownerFullName', 'ownerPhone', 'ownerEmail', 'vehicleMake', 'vehicleModel',
      'vehicleYear', 'chassisNumber', 'engineNumber', 'plateNumber', 'vehicleColor',
      'vehicleType', 'vehiclePhoto', 'proofOfOwnership', 'insuranceCertificate', 'roadWorthyCertificate'
    ];

    const missingCommon = requiredCommon.filter(f => !form[f]);
    if (missingCommon.length > 0) {
      toast.error('Please fill all required fields and upload all documents');
      return;
    }

    if (isRenewal && (!form.currentLicenseNumber || !form.currentExpiryDate)) {
      toast.error('Please provide current license details for renewal');
      return;
    }

    setLoading(true);
    try {
      const amount = isRenewal ? RENEWAL_VEHICLE_LICENSE_PRICE : NEW_VEHICLE_LICENSE_PRICE;

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vehicle-license/initiate-payment`,
        {
          type: isRenewal ? 'renewal' : 'new',
          amount,
          applicationData: form,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.location.href = res.data.authorization_url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center"
        >
          <CheckCircle className="h-24 w-24 text-green-600 mx-auto mb-8" />
          <h1 className="text-4xl font-bold mb-6">Payment Successful!</h1>
          <p className="text-xl text-gray-700 mb-4">
            Your vehicle license application has been submitted.
          </p>
          <p className="text-lg text-gray-600">
            The admin will review your documents and process your license.
          </p>
          <p className="text-sm text-gray-500 mt-8">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-center mb-12 text-gray-900"
        >
          Apply for Vehicle License
        </motion.h1>

        {/* Toggle New / Renewal */}
        <div className="flex justify-center mb-10">
          <button
            onClick={() => setIsRenewal(false)}
            className={`px-6 py-2 rounded-l-3xl font-bold text-xl transition-all ${
              !isRenewal ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700'
            }`}
          >
            New License (₦50,000)
          </button>
          <button
            onClick={() => setIsRenewal(true)}
            className={`px-6 py-2 rounded-r-3xl font-bold text-xl transition-all ${
              isRenewal ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Renewal (₦20,000)
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-2xl font-bold mb-8 text-center">Vehicle & Owner Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Owner Details */}
            <div>
              <label className="block text-lg font-semibold mb-2">Owner Full Name</label>
              <input
                type="text"
                value={form.ownerFullName}
                onChange={e => setForm({ ...form, ownerFullName: e.target.value })}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
   <div>
  <label className="block text-lg font-semibold mb-2">Owner Phone</label>
  <input
    type="tel"
    inputMode="tel" // Shows numeric keyboard on mobile
    value={form.ownerPhone}
    onChange={(e) => {
      // Only allow valid phone characters
      const value = e.target.value;
      const cleaned = value.replace(/[^0-9+\-() \s]/g, ''); // Remove anything invalid
      setForm({ ...form, ownerPhone: cleaned });
    }}
    onKeyDown={(e) => {
      // Prevent typing invalid keys (except navigation/control keys)
      const allowedKeys = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '+', '(', ')', '-', ' ', 'Backspace', 'Delete',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Tab', 'Enter', 'Home', 'End'
      ];
      if (!allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    }}
    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 transition"
    placeholder="+234 801 234 5678"
    maxLength={20} // Optional: prevent excessively long input
  />
</div>
            <div>
              <label className="block text-lg font-semibold mb-2">Owner Email</label>
              <input
                type="email"
                value={form.ownerEmail}
                onChange={e => setForm({ ...form, ownerEmail: e.target.value })}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="owner@example.com"
              />
            </div>

            {/* Vehicle Details */}
            <div>
              <label className="block text-lg font-semibold mb-2">Vehicle Make</label>
              <input
                type="text"
                value={form.vehicleMake}
                onChange={e => setForm({ ...form, vehicleMake: e.target.value })}
                className="w-full p-4 border rounded-xl"
                placeholder="Toyota"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">Model</label>
              <input
                type="text"
                value={form.vehicleModel}
                onChange={e => setForm({ ...form, vehicleModel: e.target.value })}
                className="w-full p-4 border rounded-xl"
                placeholder="Camry"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">Year</label>
              <input
                type="number"
                value={form.vehicleYear}
                onChange={e => setForm({ ...form, vehicleYear: e.target.value })}
                className="w-full p-4 border rounded-xl"
                placeholder="2020"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">Color</label>
              <input
                type="text"
                value={form.vehicleColor}
                onChange={e => setForm({ ...form, vehicleColor: e.target.value })}
                className="w-full p-4 border rounded-xl"
                placeholder="Black"
              />
            </div>
          <div>
  <label className="block text-lg font-semibold mb-2">Plate Number</label>
  <input
    type="text"
    value={form.plateNumber}
    onChange={handleInput(
      "plateNumber",
      /^[A-Z0-9-]*$/,
      10
    )}
    className="w-full p-4 border rounded-xl"
    placeholder="ABC-123-DE"
  />
</div>

<div>
  <label className="block text-lg font-semibold mb-2">Chassis Number (VIN)</label>
  <input
    type="text"
    value={form.chassisNumber}
    onChange={handleInput(
      "chassisNumber",
      /^[A-HJ-NPR-Z0-9]*$/,
      17
    )}
    className="w-full p-4 border rounded-xl"
    placeholder="17-character VIN"
  />
</div>

<div>
  <label className="block text-lg font-semibold mb-2">Engine Number</label>
  <input
    type="text"
    value={form.engineNumber}
    onChange={handleInput(
      "engineNumber",
      /^[A-Z0-9]*$/,
      20
    )}
    className="w-full p-4 border rounded-xl"
    placeholder="Engine number"
  />
</div>

            <div>
              <label className="block text-lg font-semibold mb-2">Fuel Type</label>
              <select
                value={form.fuelType}
                onChange={e => setForm({ ...form, fuelType: e.target.value })}
                className="w-full p-4 border rounded-xl"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">Vehicle Type</label>
              <input
                type="text"
                value={form.vehicleType}
                onChange={e => setForm({ ...form, vehicleType: e.target.value })}
                className="w-full p-4 border rounded-xl"
                placeholder="Saloon, SUV, Truck, etc."
              />
            </div>
          </div>

          {/* Renewal Only Fields */}
          {isRenewal && (
            <div className="bg-yellow-50 p-6 rounded-2xl mb-10">
              <h3 className="text-xl font-bold mb-4">Current License Details (Renewal Only)</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-lg font-semibold mb-2">Current License Number</label>
                  <input
                    type="text"
                    value={form.currentLicenseNumber}
                    onChange={e => setForm({ ...form, currentLicenseNumber: e.target.value })}
                    className="w-full p-4 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-2">Current Expiry Date</label>
                  <input
                    type="date"
                    value={form.currentExpiryDate}
                    onChange={e => setForm({ ...form, currentExpiryDate: e.target.value })}
                    className="w-full p-4 border rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Uploads */}
          <h2 className="text-2xl font-bold mb-8 text-center">Required Documents & Photos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <Car className="h-6 w-6 text-blue-600" />
                Vehicle Photo (Front View)
              </label>
              <input type="file" accept="image/*" onChange={e => handleUpload(e, 'vehiclePhoto')} className="w-full p-4 border rounded-xl" />
              {form.vehiclePhoto && <img src={form.vehiclePhoto} alt="Vehicle" className="mt-4 w-full h-64 object-cover rounded-xl" />}
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Proof of Ownership (e.g. Receipt)
              </label>
              <input type="file" accept="image/*,application/pdf" onChange={e => handleUpload(e, 'proofOfOwnership')} className="w-full p-4 border rounded-xl" />
              {form.proofOfOwnership && <p className="mt-4 text-green-600">Uploaded ✓</p>}
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Insurance Certificate
              </label>
              <input type="file" accept="image/*,application/pdf" onChange={e => handleUpload(e, 'insuranceCertificate')} className="w-full p-4 border rounded-xl" />
              {form.insuranceCertificate && <p className="mt-4 text-green-600">Uploaded ✓</p>}
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                Road Worthy Certificate
              </label>
              <input type="file" accept="image/*,application/pdf" onChange={e => handleUpload(e, 'roadWorthyCertificate')} className="w-full p-4 border rounded-xl" />
              {form.roadWorthyCertificate && <p className="mt-4 text-green-600">Uploaded ✓</p>}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={loading}
            className="mt-12 w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-1xl font-bold rounded-3xl shadow-2xl disabled:opacity-70"
          >
            {loading ? 'Processing...' : `Submit & Pay ₦${isRenewal ? '20,000' : '50,000'}`}
          </motion.button>
        </div>
      </div>

      <MyVehicleLicenses />
    </div>
  );
};

export default ApplyVehicleLicense;