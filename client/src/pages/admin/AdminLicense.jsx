// src/pages/Admin/AdminLicenseApplications.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, User, Calendar, MapPin, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Phone, X } from 'lucide-react';
const AdminLicenseApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/licenses/submitted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data)
      setApplications(res.data.applications || []);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (applicationId) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/licenses/confirm/${applicationId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Application confirmed and in processing');
      fetchApplications();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to confirm');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-center mb-12"
      >
        Driver License Applications
      </motion.h1>

      {loading ? (
        <p className="text-center py-20 text-2xl">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-center py-20 text-3xl text-gray-600">No submitted applications</p>
      ) : (
        <div className="space-y-8">
          {applications.map(app => (
            <motion.div
              key={app._id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold">{app.fullName}</h3>
                    <p className="text-xl text-gray-600 mt-1">{app.licenseType?.toUpperCase()} Application</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedApp(app);
                    setShowModal(true);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl"
                >
                  View Details
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-8 text-gray-700 text-lg">
                <p className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  DOB: {new Date(app.dateOfBirth).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-red-600" />
                  Address: {app.address}
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-green-600" />
                  Phone: {app.phone}
                </p>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Submitted: {new Date(app.submittedAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-10">
            <div className="flex justify-between mb-8">
              <h2 className="text-3xl font-bold">{selectedApp.fullName}'s Application</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="h-8 w-8 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Personal Details</h3>
                <p><strong>Gender:</strong> {selectedApp.gender}</p>
                <p><strong>Blood Group:</strong> {selectedApp.bloodGroup}</p>
                <p><strong>Nationality:</strong> {selectedApp.nationality}</p>
                <p><strong>Email:</strong> {selectedApp.email}</p>
                <p><strong>Phone:</strong> {selectedApp.phone}</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">Application Type</h3>
                <p><strong>Type:</strong> {selectedApp.licenseType?.toUpperCase()}</p>
                {selectedApp.type === 'renewal' && (
                  <>
                    <p><strong>License Number:</strong> {selectedApp.licenseNumber}</p>
                    <p><strong>Expiry Date:</strong> {new Date(selectedApp.expiryDate).toLocaleDateString()}</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Photo</h3>
                <img src={selectedApp.photo} alt="Photo" className="w-full h-64 object-cover rounded-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Signature</h3>
                <img src={selectedApp.signature} alt="Signature" className="w-full h-64 object-contain rounded-xl bg-gray-50" />
              </div>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => handleConfirm(selectedApp._id)}
                className="px-12 py-6 bg-gradient-to-r from-green-600 to-teal-600 text-white text-2xl font-bold rounded-3xl"
              >
                Confirm & Process
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminLicenseApplications;