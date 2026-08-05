// src/pages/Admin/AdminPaidRentals.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, User, DollarSign, Clock, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminPaidRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchPaidRentals();
  }, []);

  const fetchPaidRentals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rent-car/admin/paid-rentals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals(res.data.rentals || []);
    } catch (err) {
      toast.error('Failed to load paid rentals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center mb-12"
      >
        Paid Car Rentals
      </motion.h1>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
        </div>
      ) : rentals.length === 0 ? (
        <p className="text-center py-20 text-2xl text-gray-600">No paid rentals yet</p>
      ) : (
        <div className="grid gap-8">
          {rentals.map(rental => (
            <motion.div
              key={rental._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="grid md:grid-cols-3 gap-8">
                {/* Renter */}
                <div className="border-r border-gray-200 pr-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <User className="h-6 w-6 text-blue-600" />
                    Renter
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {rental.renter.name}</p>
                    <p><strong>Email:</strong> {rental.renter.email}</p>
                    <p><strong>Phone:</strong> {rental.renter.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Car & Owner */}
                <div className="border-r border-gray-200 pr-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <Car className="h-6 w-6 text-green-600" />
                    Car Details
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Car:</strong> {rental.car.make} {rental.car.model} ({rental.car.year})</p>
                    <p><strong>Plate:</strong> {rental.car.plateNumber}</p>
                    <p><strong>Status:</strong> {rental.car.status}</p>
                    <p><strong>Owner:</strong> {rental.car.owner.name}</p>
                    <p><strong>Daily Price:</strong> ₦{rental.car.dailyPrice.toLocaleString()}</p>
                  </div>
                </div>

                {/* Rental Info */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                    Rental Details
                  </h3>
                  <div className="space-y-2">
                    <p><strong>Total Paid:</strong> ₦{rental.rentalDetails.totalAmount.toLocaleString()}</p>
                    <p><strong>Duration:</strong> {rental.rentalDetails.durationDays} days</p>
                    <p><strong>Location:</strong> {rental.rentalDetails.location}</p>
                    <p><strong>Destination:</strong> {rental.rentalDetails.destination}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                        rental.rentalDetails.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rental.rentalDetails.status.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                      Rented on: {new Date(rental.rentalDetails.rentedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPaidRentals;