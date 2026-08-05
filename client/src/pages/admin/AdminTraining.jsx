// src/pages/Admin/AdminTrainingRegistrations.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Eye,
  CheckCircle,
  X,
  PlayCircle,
  Award,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminTrainingRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedReg, setSelectedReg] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/training/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegistrations(res.data.registrations || []);
    } catch (err) {
      toast.error('Failed to load registrations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (updatingId === id) return;

    setUpdatingId(id);

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/training/admin/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`Status updated to ${newStatus.replace('-', ' ')}`);
      fetchRegistrations(); // refresh list
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-training':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-amber-100 text-amber-800';
      case 'certified':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5" />;
      case 'in-training':
        return <PlayCircle className="h-5 w-5" />;
      case 'completed':
        return <Award className="h-5 w-5" />;
      case 'certified':
        return <ShieldCheck className="h-5 w-5" />;
      default:
        return <ShieldCheck className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-center mb-16 text-gray-900"
      >
        Driver Training Registrations
      </motion.h1>

      {loading ? (
        <div className="text-center py-32">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : registrations.length === 0 ? (
        <p className="text-center py-32 text-3xl text-gray-700">
          No registrations yet
        </p>
      ) : (
        <div className="grid gap-8">
          {registrations.map((reg) => (
            <motion.div
              key={reg._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              className="bg-gray-50 rounded-3xl shadow-2xl p-8 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-12 w-12 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{reg.fullName}</h3>
                    <p className="text-xl text-gray-700 mt-1">
                      {reg.city}, {reg.state}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${getStatusColor(
                      reg.status
                    )}`}
                  >
                    {getStatusIcon(reg.status)}
                    <span className="ml-2">{reg.status.toUpperCase().replace('-', ' ')}</span>
                  </span>
                  <p className="text-sm text-gray-600 mt-2">
                    Registered: {new Date(reg.registeredAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-lg text-gray-800">
                <p className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                  {reg.email}
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-green-600" />
                  {reg.phone}
                </p>
                <p className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  DOB: {new Date(reg.dateOfBirth).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-end gap-4 mt-8 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedReg(reg);
                    setShowModal(true);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-3"
                >
                  <Eye className="h-5 w-5" />
                  View Details
                </button>

                {reg.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(reg._id, 'confirmed')}
                    disabled={updatingId === reg._id}
                    className={`px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg transition flex items-center gap-3 min-w-[160px] justify-center ${
                      updatingId === reg._id ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    <CheckCircle className="h-5 w-5" />
                    {updatingId === reg._id ? 'Updating...' : 'Confirm'}
                  </button>
                )}

                {reg.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate(reg._id, 'in-training')}
                    disabled={updatingId === reg._id}
                    className={`px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg transition flex items-center gap-3 min-w-[180px] justify-center ${
                      updatingId === reg._id ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    <PlayCircle className="h-5 w-5" />
                    {updatingId === reg._id ? 'Updating...' : 'Start Training'}
                  </button>
                )}

                {reg.status === 'in-training' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(reg._id, 'completed')}
                      disabled={updatingId === reg._id}
                      className={`px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg transition flex items-center gap-3 min-w-[180px] justify-center ${
                        updatingId === reg._id ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                      {updatingId === reg._id ? 'Updating...' : 'Mark Completed'}
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(reg._id, 'certified')}
                      disabled={updatingId === reg._id}
                      className={`px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transition flex items-center gap-3 min-w-[160px] justify-center ${
                        updatingId === reg._id ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <Award className="h-5 w-5" />
                      {updatingId === reg._id ? 'Updating...' : 'Certify'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedReg && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-10"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900">Registration Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  Personal Information
                </h3>
                <div className="space-y-4 text-lg text-gray-800">
                  <p><strong>Full Name:</strong> {selectedReg.fullName}</p>
                  <p><strong>Email:</strong> {selectedReg.email}</p>
                  <p><strong>Phone:</strong> {selectedReg.phone}</p>
                  <p><strong>Date of Birth:</strong> {new Date(selectedReg.dateOfBirth).toLocaleDateString()}</p>
                  <p><strong>Address:</strong> {selectedReg.address}</p>
                  <p><strong>City/State:</strong> {selectedReg.city}, {selectedReg.state}</p>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  Training Preferences
                </h3>
                <div className="space-y-4 text-lg text-gray-800">
                  <p>
                    <strong>Previous Experience:</strong>{' '}
                    {selectedReg.previousExperience.replace('-', ' ')}
                  </p>
                  <p><strong>Preferred Schedule:</strong> {selectedReg.preferredSchedule}</p>
                  <p>
                    <strong>Referral Source:</strong> {selectedReg.referralSource || 'N/A'}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span
                      className={`ml-3 px-4 py-2 rounded-full font-bold ${getStatusColor(
                        selectedReg.status
                      )}`}
                    >
                      {getStatusIcon(selectedReg.status)}
                      <span className="ml-2">
                        {selectedReg.status.toUpperCase().replace('-', ' ')}
                      </span>
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Status actions in modal */}
            <div className="mt-12 flex flex-wrap gap-6 justify-center">
              {selectedReg.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate(selectedReg._id, 'confirmed')}
                  disabled={updatingId === selectedReg._id}
                  className={`px-12 py-6 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold rounded-full shadow-2xl transition min-w-[260px] ${
                    updatingId === selectedReg._id ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  Confirm Registration
                </button>
              )}

              {selectedReg.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusUpdate(selectedReg._id, 'in-training')}
                  disabled={updatingId === selectedReg._id}
                  className={`px-12 py-6 bg-purple-600 hover:bg-purple-700 text-white text-2xl font-bold rounded-full shadow-2xl transition min-w-[260px] ${
                    updatingId === selectedReg._id ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  Start Training
                </button>
              )}

              {selectedReg.status === 'in-training' && (
                <div className="flex flex-wrap gap-6 justify-center">
                  <button
                    onClick={() => handleStatusUpdate(selectedReg._id, 'completed')}
                    disabled={updatingId === selectedReg._id}
                    className={`px-12 py-6 bg-amber-600 hover:bg-amber-700 text-white text-2xl font-bold rounded-full shadow-2xl transition min-w-[260px] ${
                      updatingId === selectedReg._id ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    Mark as Completed
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(selectedReg._id, 'certified')}
                    disabled={updatingId === selectedReg._id}
                    className={`px-12 py-6 bg-emerald-600 hover:bg-emerald-700 text-white text-2xl font-bold rounded-full shadow-2xl transition min-w-[260px] ${
                      updatingId === selectedReg._id ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    Certify Driver
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminTrainingRegistrations;