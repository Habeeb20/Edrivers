// src/components/NetworkError.jsx
import React from 'react';
import { Link } from 'react-router-dom';  // For home link

const NetworkError = ({ onRetry, message = "Oops! Connection lost. Let's try again." }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        {/* Sad Cloud Icon (SVG for lightness) */}
        <div className="mx-auto w-24 h-24">
          <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.003 5.884L10 9.352v.5a7 7 0 01-14 0v-5a3 3 0 016.005-0.5M12 13v-3M12 13a6 6 0 00-6-6H4a2 2 0 00-2 2v3.582A6.5 6.5 0 0112 13z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 13a6 6 0 016-6h2a2 2 0 012 2v3.582A6.5 6.5 0 0112 13z" />
          </svg>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Network Hiccup</h2>
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={onRetry}
            className="bg-primary-500 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-primary-500/25"
          >
            Retry Connection
          </button>
          <Link
            to="/"
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
        
        <p className="text-xs text-gray-500">Still stuck? Check your internet or <Link to="/support" className="text-primary-500 hover:underline">contact support</Link>.</p>
      </div>
    </div>
  );
};

export default NetworkError;