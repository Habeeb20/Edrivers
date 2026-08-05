


























// src/pages/User/ApplyDriverLicense.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, Globe, Phone, Mail, Users, Calendar, MapPin, CreditCard, CheckCircle, AlertCircle, FileText, Upload } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const NEW_LICENSE_PRICE = 5000000; // ₦50,000 in kobo
const RENEWAL_PRICE = 2000000; // ₦20,000 in kobo

const ApplyDriverLicense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [isRenewal, setIsRenewal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    nationality: '',
    address: '',
    phone: '',
    email: '',
    photo: '',
    signature: '',
    licenseNumber: '',
    expiryDate: '',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setPaymentStatus('success');
      toast.success('Payment successful! Your application has been submitted.');
      setTimeout(() => navigate('/dashboard'), 5000);
    } else if (status === 'failed') {
      setPaymentStatus('failed');
      toast.error('Payment failed. Please try again.');
    }
  }, [searchParams, navigate]);

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'essential'); // Replace with your Cloudinary preset

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dc0poqt9l/upload`, // Replace with your cloud name
        formData
      );
      setForm({ ...form, [type]: res.data.secure_url });
      toast.success(`${type} uploaded`);
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = async () => {
    const required = ['fullName', 'dateOfBirth', 'gender', 'nationality', 'address', 'phone', 'email', 'photo'];
    if (required.some(f => !form[f])) {
      toast.error('Please fill all required fields and wait for passport and signature be uploaded');
      return;
    }

    if (isRenewal && (!form.licenseNumber || !form.expiryDate)) {
      toast.error('Please provide license details for renewal');
      return;
    }

    setLoading(true);
    try {
      const amount = isRenewal ? RENEWAL_PRICE : NEW_LICENSE_PRICE;

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/license/initiate-payment`,
        {
          type: isRenewal ? 'renewal' : 'new',
          amount,
          applicationData: form,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirect to Paystack
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
            Your driver's license application has been submitted.
          </p>
          <p className="text-lg text-gray-600">
            The admin will review it and confirm processing soon.
          </p>
          <p className="text-sm text-gray-500 mt-8">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-center mb-12 text-gray-900"
        >
          Apply for Driver's License
        </motion.h1>

        {/* Toggle New/Renewal */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setIsRenewal(false)}
            className={`px-10 py-4 rounded-l-3xl font-bold text-xl ${!isRenewal ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            New License (₦50,000)
          </button>
          <button
            onClick={() => setIsRenewal(true)}
            className={`px-10 py-4 rounded-r-3xl font-bold text-xl ${isRenewal ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Renewal (₦20,000)
          </button>
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                Full Name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Gender
              </label>
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-blue-600" />
                Blood Group
              </label>
              <select
                value={form.bloodGroup}
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B- ">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB- ">AB-</option>
                <option value="O+">O+</option>
                <option value="O- ">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <Globe className="h-6 w-6 text-blue-600" />
                Nationality
              </label>
              <input
                type="text"
                value={form.nationality}
                onChange={e => setForm({ ...form, nationality: e.target.value })}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Nigerian"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-blue-600" />
                Address
              </label>
              <textarea
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Full residential address"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <Phone className="h-6 w-6 text-blue-600" />
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="+234..."
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <Mail className="h-6 w-6 text-blue-600" />
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>

            {isRenewal && (
              <div className="md:col-span-2 grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    Existing License Number
                  </label>
                  <input
                    type="text"
                    value={form.licenseNumber}
                    onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter license number"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <Upload className="h-6 w-6 text-blue-600" />
                Upload Photo (Passport size)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleUpload(e, 'photo')}
                className="w-full p-4 border rounded-xl"
              />
              {form.photo && <img src={form.photo} alt="Photo" className="mt-4 w-32 h-32 object-cover rounded-full" />}
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg font-semibold mb-2 flex items-center gap-2">
                <Upload className="h-6 w-6 text-blue-600" />
                Upload Signature
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleUpload(e, 'signature')}
                className="w-full p-4 border rounded-xl"
              />
              {form.signature && <img src={form.signature} alt="Signature" className="mt-4 w-48 h-24 object-contain" />}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={loading}
            className="mt-12 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-1xl font-bold rounded-3xl shadow-2xl disabled:opacity-70"
          >
            {loading ? 'Processing...' : `Submit & Pay ₦${isRenewal ? '20,000' : '50,000'}`}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ApplyDriverLicense;