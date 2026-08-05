

/* eslint-disable no-unused-vars */
// src/pages/Client/RentCar.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Car, MapPin, X, Gauge, Fuel, Star,
  AlertCircle, CheckCircle, User, Phone, Award, AirVent
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const RentCar = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  const [form, setForm] = useState({
    location: '',
    fullname: '',
    durationDays: 1,
    destination: '',
    reasonForRent: '',        // New field
    priceOption: 'withFuel',  // 'withFuel' or 'withoutFuel'
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/rent-car/approved-cars`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCars(res.data.cars || []);
    } catch (err) {
      toast.error('Failed to load available cars');
    } finally {
      setLoading(false);
    }
  };

  const isAvailable = (car) =>
    car.status === 'approved' && car.available === true;

  const openCarDetails = (car) => {
    if (!isAvailable(car)) return;

    setSelectedCar(car);
    setActiveImage(car.photos?.[0] || null);

    setForm({
      location: '',
      fullname: '',
      durationDays: 1,
      destination: '',
      reasonForRent: '',
      priceOption: 'withFuel',
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCar(null);
  };

  const calculateTotal = () => {
    if (!selectedCar) return 0;
    const dailyPrice = form.priceOption === 'withFuel'
      ? (selectedCar.rentalPriceWithFuel || selectedCar.rentalPrice || 0)
      : (selectedCar.rentalPriceWithoutFuel || selectedCar.rentalPrice || 0);
    
    return dailyPrice * form.durationDays;
  };

  const handleRent = async () => {
    if (!form.fullname || !form.location || !form.destination || !form.reasonForRent) {
      toast.error('Please fill all required fields including reason for renting');
      return;
    }
    if (form.durationDays < 1) {
      toast.error('Duration must be at least 1 day');
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rent-car/rent`,
        {
          carId: selectedCar._id,
          ...form,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.location.href = res.data.authorization_url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Available Cars for Rent</h1>
        <p className="text-center text-gray-600 mb-10">Choose from our verified fleet</p>

        {loading ? (
          <div className="text-center py-32">
            <div className="animate-spin h-16 w-16 border-b-4 border-indigo-600 rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cars...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20">
            <Car className="mx-auto h-20 w-20 text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">No cars available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => {
              const available = isAvailable(car);
              const dailyPrice = car.rentalPriceWithFuel || car.rentalPrice;

              return (
                <motion.div
                  key={car._id}
                  whileHover={{ scale: available ? 1.03 : 1 }}
                  className={`bg-white rounded-3xl overflow-hidden shadow-lg transition-all ${
                    !available && 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => openCarDetails(car)}
                >
                  <div className="relative">
                    <img
                      src={car.photos?.[0]}
                      alt={`${car.make} ${car.model}`}
                      className="h-64 w-full object-cover"
                    />
                    {car.hasAirCondition && (
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow">
                        <AirVent size={14} /> AC
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-2xl">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={16} /> {car.location}
                    </p>

                    <div className="flex justify-between items-end mt-6">
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="text-3xl font-bold text-indigo-600">
                          ₦{dailyPrice?.toLocaleString() || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">per day</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                        available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {available ? 'Available' : 'Rented'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= CAR DETAIL MODAL ================= */}
      {showModal && selectedCar && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden max-h-[95vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-3xl font-bold">
                {selectedCar.make} {selectedCar.model} ({selectedCar.year})
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-black">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left: Images & Basic Info */}
                <div>
                  <img
                    src={activeImage || selectedCar.photos?.[0]}
                    className="w-full h-96 object-cover rounded-2xl shadow-lg"
                    alt="Car"
                  />

                  {/* Thumbnail Gallery */}
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {selectedCar.photos?.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        onClick={() => setActiveImage(photo)}
                        className={`h-20 w-full object-cover rounded-xl cursor-pointer transition-all hover:scale-105 ${
                          activeImage === photo ? 'ring-4 ring-indigo-500' : ''
                        }`}
                        alt={`Car view ${i}`}
                      />
                    ))}
                  </div>

                  {/* Inspection Grade */}
                  {selectedCar.inspection?.grade && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
                      <p className="font-semibold text-blue-800">Admin Vehicle Inspection</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-5xl font-bold text-blue-600">
                          {selectedCar.inspection.grade}
                        </div>
                        <div>
                          <p className="text-lg">{selectedCar.inspection.condition}</p>
                          <p className="text-sm text-gray-600">
                            Rated {selectedCar.inspection.rating}/10
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Details + Driver + Booking Form */}
                <div className="space-y-8">

                  {/* Car Specs */}
                  <div>
                    <h3 className="font-bold text-xl mb-4">Car Specifications</h3>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                      <p><strong>Color:</strong> {selectedCar.color}</p>
                      <p><strong>Transmission:</strong> {selectedCar.transmission}</p>
                      <p><strong>Fuel Type:</strong> {selectedCar.fuelType}</p>
                      <p><strong>Plate Number:</strong> {selectedCar.plateNumber}</p>
                      <p><strong>Location:</strong> {selectedCar.location}</p>
                      <p className="flex items-center gap-2">
                        <AirVent size={18} className="text-green-600" />
                        <strong>Air Condition:</strong> {selectedCar.hasAirCondition ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Options */}
                  <div>
                    <h3 className="font-bold text-xl mb-4">Pricing Options</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <button
                        onClick={() => setForm({ ...form, priceOption: 'withFuel' })}
                        className={`p-5 rounded-2xl border-2 transition-all text-left ${
                          form.priceOption === 'withFuel' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="font-semibold">With Fuel</div>
                        <div className="text-3xl font-bold mt-1">
                          ₦{(selectedCar.rentalPriceWithFuel || selectedCar.rentalPrice || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">per day • Fuel included</div>
                      </button>

                      <button
                        onClick={() => setForm({ ...form, priceOption: 'withoutFuel' })}
                        className={`p-5 rounded-2xl border-2 transition-all text-left ${
                          form.priceOption === 'withoutFuel' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="font-semibold">Without Fuel</div>
                        <div className="text-3xl font-bold mt-1">
                          ₦{(selectedCar.rentalPriceWithoutFuel || selectedCar.rentalPrice || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">per day • You provide fuel</div>
                      </button>
                    </div>
                  </div>

                  {/* Driver Information */}
                  {selectedCar.driver?.name && (
                    <div>
                      <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <User size={24} /> Assigned Driver
                      </h3>
                      <div className="flex gap-5 bg-gray-50 p-5 rounded-2xl">
                        {selectedCar.driver.photo && (
                          <img
                            src={selectedCar.driver.photo}
                            alt={selectedCar.driver.name}
                            className="w-24 h-24 object-cover rounded-2xl"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-xl">{selectedCar.driver.name}</p>
                          <p className="flex items-center gap-2 mt-2 text-gray-600">
                            <Phone size={18} /> {selectedCar.driver.contactNumber}
                          </p>
                          {selectedCar.driver.yearsOfExperience && (
                            <p className="flex items-center gap-2 mt-1 text-gray-600">
                              <Award size={18} /> {selectedCar.driver.yearsOfExperience} years experience
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking Form */}
                  <div>
                    <h3 className="font-bold text-xl mb-4">Booking Details</h3>

                    <div className="space-y-4">
                      <input
                        placeholder="Your Full Name"
                        className="w-full border p-4 rounded-2xl focus:outline-none focus:border-indigo-500"
                        value={form.fullname}
                        onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                      />

                      <input
                        placeholder="Pickup Location"
                        className="w-full border p-4 rounded-2xl focus:outline-none focus:border-indigo-500"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                      />

                      <input
                        placeholder="Destination"
                        className="w-full border p-4 rounded-2xl focus:outline-none focus:border-indigo-500"
                        value={form.destination}
                        onChange={(e) => setForm({ ...form, destination: e.target.value })}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600 block mb-1">Duration (Days)</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full border p-4 rounded-2xl focus:outline-none focus:border-indigo-500"
                            value={form.durationDays}
                            onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 block mb-1">Total Amount</label>
                          <div className="p-4 bg-gray-100 rounded-2xl font-bold text-xl">
                            ₦{calculateTotal().toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <textarea
                        placeholder="Reason for renting this car (e.g. Trip to Abuja, Wedding, Business meeting...)"
                        className="w-full border p-4 rounded-2xl h-28 focus:outline-none focus:border-indigo-500 resize-y"
                        value={form.reasonForRent}
                        onChange={(e) => setForm({ ...form, reasonForRent: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Pay Button */}
            <div className="border-t p-6 bg-white sticky bottom-0">
              <button
                onClick={handleRent}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-5 rounded-2xl text-xl font-bold shadow-lg transition"
              >
                Proceed to Pay with Paystack
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">
                You will be redirected to secure payment page
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentCar;