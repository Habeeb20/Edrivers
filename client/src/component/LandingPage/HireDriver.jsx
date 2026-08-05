/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import im from "../../assets/drivers.jpg"; // Your imported image

const HireDriverHero = () => {
  const navigate = useNavigate();

  const handleHireClick = () => {
    navigate('/login');
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Your Imported Image */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={im}
                alt="Professional driver ready to serve you safely and reliably"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Subtle gradient overlay for better text visibility if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-6">
              Hire a Professional Driver Today
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Experience hassle-free travel with our vetted, licensed drivers. Safe, reliable, and always on time—your journey starts here.
            </p>

            {/* Why Hire Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center lg:justify-start gap-3">
                <span className="text-4xl">🚗</span>
                Why Hire a Driver?
              </h2>

              <ul className="space-y-4 text-base sm:text-lg text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-2xl mt-1">✓</span>
                  <span>Ensure <strong>safety</strong> on every trip with experienced professionals.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-2xl mt-1">✓</span>
                  <span>Save <strong>time and stress</strong>—focus on your day while we drive.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-2xl mt-1">✓</span>
                  <span>Access <strong>reliable service</strong> for airports, events, or daily commutes, 24/7.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-2xl mt-1">✓</span>
                  <span>Enjoy <strong>peace of mind</strong> with insured, background-checked drivers.</span>
                </li>
              </ul>
            </div>

            {/* Hire Button */}
            <button
              onClick={handleHireClick}
              className="group relative inline-flex items-center px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl rounded-full shadow-2xl hover:shadow-3xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-110 transition-all duration-300"
            >
              <span className="relative flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                Hire Now
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HireDriverHero;