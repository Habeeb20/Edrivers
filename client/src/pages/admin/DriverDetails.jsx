// src/components/Admin/DriverDetails.jsx
import React from 'react';
import { Star, Clock, DollarSign, MapPin, Phone, Mail, User, TrendingUp } from 'lucide-react';

const DriverDetails = ({ driverData, onClose }) => {
  if (!driverData) return null;

  const { driver, hires, stats, ratings } = driverData;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              {driver.firstName[0]}{driver.lastName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{driver.firstName} {driver.lastName}</h2>
              <p className="text-gray-600">Driver ID: {driver._id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Driver Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <p><strong>Email:</strong> {driver.email}</p>
                <p><strong>Phone:</strong> {driver.phone || 'Not provided'}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    driver.currentHireStatus === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {driver.currentHireStatus}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Rating & Performance
              </h3>
              <div className="space-y-3">
                <p><strong>Average Rating:</strong> {driver.rating} / 5</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < driver.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p><strong>Total Trips:</strong> {driver.totalTrips}</p>
                <p><strong>Total Earnings:</strong> ₦{driver.earnings?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          {/* Hire History Table */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Hire History
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {hires.length} hires
              </span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Offered
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin Approved
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Review
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hires.map((hire, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {hire.clientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hire.clientEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {hire.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {hire.durationHours} hrs
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">
                        ₦{hire.amountOffered?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                        ₦{hire.systemAmount?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          hire.status === 'active' ? 'bg-green-100 text-green-800' :
                          hire.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          hire.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {hire.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          hire.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          hire.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {hire.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          hire.adminApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {hire.adminApproved ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {hire.rating || 'N/A'} / 5
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {hire.review ? (
                            <div>
                              <p className="font-medium">{hire.review}</p>
                              <p className="text-gray-500 text-xs mt-1">{hire.comment}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">No review</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* No hires message */}
          {hires.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hire History</h3>
              <p className="text-gray-500">This driver has no hire records yet.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => fetchAnalytics()}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
          >
            Refresh Data
          </button>
          <button
            onClick={() => {
              // Export functionality
              const dataStr = JSON.stringify(analytics, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `driver-analytics-${new Date().toISOString().slice(0, 10)}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
          >
            Export Data
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DriverDetails;