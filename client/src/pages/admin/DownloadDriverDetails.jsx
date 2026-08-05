// src/pages/Admin/AdminDriverDetails.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Users, Loader2, Eye, Download, FileText, User, ShieldCheck,
  Star, MapPin, Car, Phone, Mail, Calendar, FileDown, X
} from 'lucide-react';
import { RefreshCcw } from 'lucide-react';

const AdminDriverDetails = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchAllDrivers();
  }, []);

  const fetchAllDrivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/drivers/all`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );
      setDrivers(res.data.drivers || []);
    } catch (err) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverDetails = async (driverId) => {
    setDetailsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/drivers/${driverId}/full-details`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );

      if (res.data.success) {
        setSelectedDriver(res.data.driver);
      }
    } catch (err) {
      toast.error('Failed to load driver details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const downloadDocument = (url, fileName) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">All Drivers Overview</h1>
          <button
            onClick={fetchAllDrivers}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            <RefreshCcw size={18} /> Refresh
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Phone / Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Vehicle</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">Certified</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={driver.avatar || '/default-avatar.jpg'}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover mr-3 border border-gray-200"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {driver.firstName} {driver.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Joined {new Date(driver.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                      {driver.phone || '—'}<br />
                      {driver.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                      {driver.vehicle ? (
                        <>{driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.year})</>
                      ) : (
                        'No vehicle'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {driver.isCertified ? (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Certified
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Not Certified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => fetchDriverDetails(driver._id)}
                        className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                        title="View Full Details"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full Driver Details Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-5 right-5 p-3 bg-gray-100 rounded-full hover:bg-gray-200 z-10"
            >
              <X size={24} />
            </button>

            <div className="p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12">
                <img
                  src={selectedDriver.avatar || '/default-avatar.jpg'}
                  alt=""
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-indigo-100 shadow-xl"
                />
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {selectedDriver.firstName} {selectedDriver.lastName}
                  </h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                    {selectedDriver.isCertified && (
                      <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium flex items-center gap-1.5">
                        <ShieldCheck size={16} /> Certified
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="fill-current" size={18} />
                      <span className="font-semibold">{selectedDriver.rating?.toFixed(1) || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Personal Info */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User className="h-6 w-6 text-indigo-600" /> Personal Info
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>Phone:</strong> {selectedDriver.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedDriver.email}</p>
                    <p><strong>Joined:</strong> {new Date(selectedDriver.createdAt).toLocaleDateString()}</p>
                    <p><strong>Date of Birth:</strong> {selectedDriver.dateOfBirth ? new Date(selectedDriver.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Car className="h-6 w-6 text-blue-600" /> Vehicle
                  </h3>
                  {selectedDriver.vehicle ? (
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Make/Model:</strong> {selectedDriver.vehicle.make} {selectedDriver.vehicle.model}</p>
                      <p><strong>Year:</strong> {selectedDriver.vehicle.year}</p>
                      <p><strong>Color:</strong> {selectedDriver.vehicle.color}</p>
                      <p><strong>Plate:</strong> {selectedDriver.vehicle.licensePlate}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No vehicle info</p>
                  )}
                </div>

                {/* Driver Profile */}
                {selectedDriver.driverProfile && (
                  <div className="bg-gray-50 p-6 rounded-xl md:col-span-2 lg:col-span-3">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-green-600" /> Driver Profile
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
                      <div>
                        <p><strong>Experience:</strong> {selectedDriver.driverProfile.yearsOfExperience} years</p>
                        <p><strong>Availability:</strong> {selectedDriver.driverProfile.isAvailable ? 'Available' : 'Unavailable'}</p>
                        {selectedDriver.driverProfile.categories?.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium">Categories:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedDriver.driverProfile.categories.map(cat => (
                                <span key={cat} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <p><strong>Languages:</strong> {selectedDriver.driverProfile.languagesSpoken?.join(', ') || 'None'}</p>
                        <p><strong>Transmission:</strong> {selectedDriver.driverProfile.transmission?.join(', ') || 'N/A'}</p>
                      </div>
                    </div>
                    {selectedDriver.driverProfile.bio && (
                      <p className="mt-6 text-gray-700">
                        <strong>Bio:</strong> {selectedDriver.driverProfile.bio}
                      </p>
                    )}
                  </div>
                )}

                {/* Documents */}
                {selectedDriver.documents?.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-xl md:col-span-2 lg:col-span-3">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <FileText className="h-6 w-6 text-teal-600" /> Documents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedDriver.documents.map((doc) => (
                        <div key={doc._id} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition">
                          <p className="font-medium capitalize mb-2">{doc.type.replace('-', ' ')}</p>
                          <p className="text-sm text-gray-600 mb-3">
                            Status: <span className={doc.status === 'verified' ? 'text-green-600' : doc.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}>
                              {doc.status}
                            </span>
                          </p>
                          {doc.url && (
                            <button
                              onClick={() => downloadDocument(doc.url, `${doc.type}-${selectedDriver.firstName}.pdf`)}
                              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                            >
                              <Download size={18} /> Download
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guarantors */}
                {selectedDriver.guarantors?.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-xl md:col-span-2 lg:col-span-3">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Users className="h-6 w-6 text-purple-600" /> Guarantors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedDriver.guarantors.map((g) => (
                        <div key={g._id} className="bg-white p-5 rounded-xl border border-gray-200">
                          <p className="font-medium mb-2">Guarantor {g.position}</p>
                          <p><strong>Name:</strong> {g.name}</p>
                          <p><strong>Phone:</strong> {g.phone}</p>
                          <p><strong>Relationship:</strong> {g.relationship}</p>
                          {g.idDocument && (
                            <button
                              onClick={() => downloadDocument(g.idDocument, `guarantor-${g.position}-${selectedDriver.firstName}.pdf`)}
                              className="mt-3 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                            >
                              <Download size={18} /> Download ID
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-12 flex justify-end">
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="px-8 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDriverDetails;