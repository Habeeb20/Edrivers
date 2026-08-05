import React from "react";
import { useUserLocation } from "./UserLocation";


export default function UserLocationCard() {
  const { location, address, loading, error } = useUserLocation();

  return (
    <div className="w-full  mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-4">

      <h2 className="text-xl font-bold text-gray-800">
        📍 Your Current Location
      </h2>

      {loading && (
        <div className="text-gray-500 animate-pulse">
          Detecting your location...
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {location && (
        <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-1">
          <p><span className="font-medium">Latitude:</span> {location.lat}</p>
          <p><span className="font-medium">Longitude:</span> {location.lng}</p>
          <p className="text-gray-500 text-xs">
            Accuracy: ±{Math.round(location.accuracy)} meters
          </p>
        </div>
      )}

      {address && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Detected Address</p>
          <p className="font-semibold text-gray-800 leading-relaxed">
            {address.formatted_address}
          </p>
        </div>
      )}

      {!loading && !location && !error && (
        <p className="text-gray-500 text-sm">
          Location not available.
        </p>
      )}
    </div>
  );
}