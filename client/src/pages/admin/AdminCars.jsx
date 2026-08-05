// /* eslint-disable no-unused-vars */
// // src/pages/Admin/AdminCars.jsx
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Car, CheckCircle, XCircle, Eye, DollarSign } from 'lucide-react';
// import axios from 'axios';
// import { toast } from 'sonner';

// const AdminCars = () => {
//   const [cars, setCars] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCar, setSelectedCar] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   const token = localStorage.getItem('adminToken');

//   useEffect(() => {
//     fetchPendingCars();
//   }, []);

//   const fetchPendingCars = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rent-car/pending-cars`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setCars(res.data.cars || []);
//     } catch (err) {
//       toast.error('Failed to load cars');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleManage = async (carId, action) => {
//     try {
//       await axios.put(
//         `${import.meta.env.VITE_BACKEND_URL}/api/rent-car/manage-car/${carId}`,
//         { action },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success(`Car ${action}d`);
//       fetchPendingCars();
//     } catch (err) {
//       toast.error('Action failed');
//     }
//   };

//   return (
//     <div className="p-8">
//       <h1 className="text-4xl font-bold mb-12 text-center">Pending Car Approvals</h1>

//       {loading ? (
//         <p className="text-center py-20">Loading...</p>
//       ) : cars.length === 0 ? (
//         <p className="text-center py-20 text-2xl text-gray-600">No pending cars</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {cars.map(car => (
//             <motion.div
//               key={car._id}
//               whileHover={{ scale: 1.05 }}
//               className="bg-white rounded-3xl shadow-xl p-6"
//             >
//               <img src={car.photos[0]} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
//               <h3 className="text-2xl font-bold">{car.make} {car.model} ({car.year})</h3>
//               <p className="text-gray-600 mt-2">Owner: {car.owner.firstName} {car.owner.lastName}</p>
//               <p className="text-xl font-bold mt-4">₦{car.rentalPrice}/day</p>

//               <div className="flex gap-4 mt-6">
//                 <button
//                   onClick={() => handleManage(car._id, 'approve')}
//                   className="flex-1 py-3 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2"
//                 >
//                   <CheckCircle className="h-6 w-6" />
//                   Approve
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedCar(car);
//                     setShowModal(true);
//                   }}
//                   className="flex-1 py-3 bg-red-600 text-white rounded-xl flex items-center justify-center gap-2"
//                 >
//                   <XCircle className="h-6 w-6" />
//                   Decline
//                 </button>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       )}

//       {/* Decline Modal */}
//       {showModal && selectedCar && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-2xl max-w-md w-full">
//             <h2 className="text-2xl font-bold mb-4">Decline Car?</h2>
//             <input
//               type="text"
//               placeholder="Reason (optional)"
//               className="w-full p-4 border rounded-xl mb-6"
//             />
//             <div className="flex gap-4">
//               <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-200 rounded-xl">
//                 Cancel
//               </button>
//               <button onClick={() => handleManage(selectedCar._id, 'decline')} className="flex-1 py-3 bg-red-600 text-white rounded-xl">
//                 Confirm Decline
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminCars;






/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, CheckCircle, XCircle, Eye, Star } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  // Inspection form state
  const [inspectionData, setInspectionData] = useState({
    grade: 'B',
    condition: '',
    rating: 7,
    notes: '',
  });

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchPendingCars();
  }, []);

  const fetchPendingCars = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/rent-car/pending-cars`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCars(res.data.cars || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending cars');
    } finally {
      setLoading(false);
    }
  };

  // Open Inspection Modal
  const openInspectModal = (car) => {
    setSelectedCar(car);
    setInspectionData({
      grade: 'B',
      condition: '',
      rating: 7,
      notes: '',
    });
    setShowInspectModal(true);
  };

  // Handle Inspection Submit
  const handleInspectCar = async () => {
    if (!selectedCar) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/rent-car/inspect/${selectedCar._id}`,
        inspectionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Car inspected with Grade ${inspectionData.grade}`);
      setShowInspectModal(false);
      fetchPendingCars(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Inspection failed');
    }
  };

  // Decline Car
  const handleDecline = async (reason) => {
    if (!selectedCar) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/rent-car/manage-car/${selectedCar._id}`,
        { action: 'decline', reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Car declined');
      setShowDeclineModal(false);
      fetchPendingCars();
    } catch (err) {
      toast.error('Failed to decline car');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">Pending Car Approvals</h1>
        <button
          onClick={fetchPendingCars}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-xl">Loading pending cars...</p>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-20">
          <Car className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-2xl text-gray-600">No pending cars at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <motion.div
              key={car._id}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <img
                src={car.photos?.[0] || '/placeholder-car.jpg'}
                alt={`${car.make} ${car.model}`}
                className="w-full h-52 object-cover"
              />

              <div className="p-6">
                <h3 className="text-2xl font-bold">
                  {car.make} {car.model} ({car.year})
                </h3>
                <p className="text-gray-600 mt-1">
                  Owner: {car.owner?.firstName} {car.owner?.lastName}
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <p><span className="font-medium">Plate:</span> {car.plateNumber}</p>
                  <p><span className="font-medium">Location:</span> {car.location}</p>
                  <p className="font-bold text-lg">
                    ₦{car.rentalPriceWithFuel || car.rentalPrice}/day (with fuel)
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3 mt-8">
                  <button
                    onClick={() => openInspectModal(car)}
                    className="col-span-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 font-medium transition"
                  >
                    <Star className="h-5 w-5" />
                    Inspect & Approve
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCar(car);
                      setShowDeclineModal(true);
                    }}
                    className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center gap-2 font-medium transition"
                  >
                    <XCircle className="h-5 w-5" />
                    Decline
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ==================== INSPECTION MODAL ==================== */}
      {showInspectModal && selectedCar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8">
            <h2 className="text-3xl font-bold mb-2">Inspect Car</h2>
            <p className="text-gray-600 mb-6">
              {selectedCar.make} {selectedCar.model} ({selectedCar.year})
            </p>

            <div className="space-y-6">
              {/* Grade Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Inspection Grade (A-E)</label>
                <div className="grid grid-cols-5 gap-2">
                  {['A', 'B', 'C', 'D', 'E'].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setInspectionData({ ...inspectionData, grade })}
                      className={`py-3 rounded-2xl font-bold text-lg transition ${
                        inspectionData.grade === grade
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium mb-2">Overall Condition</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent, Good, Fair with minor scratches"
                  value={inspectionData.condition}
                  onChange={(e) =>
                    setInspectionData({ ...inspectionData, condition: e.target.value })
                  }
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rating (out of 10): <span className="font-bold">{inspectionData.rating}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={inspectionData.rating}
                  onChange={(e) =>
                    setInspectionData({ ...inspectionData, rating: Number(e.target.value) })
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Inspection Notes</label>
                <textarea
                  placeholder="Any observations, issues, or recommendations..."
                  value={inspectionData.notes}
                  onChange={(e) =>
                    setInspectionData({ ...inspectionData, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowInspectModal(false)}
                className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 rounded-2xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleInspectCar}
                className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-medium transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Submit Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DECLINE MODAL ==================== */}
      {showDeclineModal && selectedCar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold mb-6">Decline Car</h2>
            <p className="mb-4 text-gray-600">
              {selectedCar.make} {selectedCar.model} ({selectedCar.year})
            </p>

            <textarea
              id="declineReason"
              placeholder="Reason for declining (optional)"
              className="w-full p-4 border border-gray-300 rounded-2xl h-32 resize-y focus:outline-none focus:border-red-500"
            />

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 py-4 bg-gray-200 rounded-2xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const reason = document.getElementById('declineReason').value.trim();
                  handleDecline(reason);
                }}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-medium hover:bg-red-700 transition"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCars;