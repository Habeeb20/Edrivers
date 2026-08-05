// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ message = "Loading...", size = "lg" }) => {
  const sizeClass = size === "sm" ? "w-8 h-8" : size === "md" ? "w-12 h-12" : "w-16 h-16";

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className="relative">
        <div className={`${sizeClass} border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin`}></div>
        <div className="absolute inset-0 ${sizeClass} border-4 border-transparent border-t-primary-500 rounded-full animate-pulse opacity-30"></div>
      </div>
      <p className="text-gray-600 font-medium text-sm md:text-base animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;