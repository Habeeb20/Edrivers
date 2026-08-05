// src/components/InteractiveDistanceMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin, Clock, Loader2, AlertTriangle } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const InteractiveDistanceMap = ({ clientAddress, driverAddress }) => {
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);

  useEffect(() => {
    if (!clientAddress || !driverAddress) {
      setError('Missing addresses');
      setLoading(false);
      return;
    }

    const calculateRoute = async () => {
      try {
        setLoading(true);
        setError(null);

        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
          {
            origin: clientAddress,
            destination: driverAddress,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(result);
              const route = result.routes[0].legs[0];
              setDistance(route.distance?.text || 'N/A');
              setDuration(route.duration?.text || 'N/A');
            } else {
              setError('Could not calculate route: ' + status);
            }
            setLoading(false);
          }
        );
      } catch (err) {
        setError('Map error: ' + err.message);
        setLoading(false);
      }
    };

    calculateRoute();
  }, [clientAddress, driverAddress]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-3" />
        <span className="text-gray-700 font-medium">Loading map...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
      {/* Map */}
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: 6.5244, lng: 3.3792 }} // Default to Lagos
          zoom={10}
          onLoad={(map) => (mapRef.current = map)}
        >
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>

      {/* Overlay Info */}
      <div className="p-5 border-t bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
              <MapPin size={16} className="text-indigo-600" /> Distance
            </p>
            <p className="text-xl font-bold text-gray-900">{distance || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
              <Clock size={16} className="text-purple-600" /> Est. Time
            </p>
            <p className="text-xl font-bold text-gray-900">{duration || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDistanceMap;