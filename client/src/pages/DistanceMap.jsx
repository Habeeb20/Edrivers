



// // src/components/DistanceInfo.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { MapPin, Car, Clock, AlertCircle, Loader2 } from 'lucide-react';

// const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// const DistanceInfo = ({ clientAddressParts, providerAddressParts }) => {
//   const [distance, setDistance] = useState(null);
//   const [duration, setDuration] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Build clean address string with smart fallback
//   const buildAddress = (parts) => {
//     if (!parts) return 'Lagos, Nigeria';

//     const partsArray = [
//       parts.address || '',
//       parts.lga || '',
//       parts.state || 'Lagos',
//       parts.country || 'Nigeria'
//     ].filter(Boolean);

//     return partsArray.join(', ') || 'Lagos, Nigeria';
//   };

//   // Generate embed URL (client-side only - no backend needed for map)
//   const origin = buildAddress(clientAddressParts);
//   const destination = buildAddress(providerAddressParts);
//   const embedMapUrl = `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_KEY}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving&zoom=12&maptype=roadmap`;

//   // Optional: Fetch plain text distance/time as fallback (via your backend)
//   useEffect(() => {
//     if (!origin || !destination || !GOOGLE_KEY) {
//       setError('Location or API key missing');
//       setLoading(false);
//       return;
//     }

//     const fetchTextDistance = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/distance`, {
//           params: { origin, destination }
//         });

//         if (res.data.success) {
//           setDistance(res.data.distance?.text || res.data.distance?.km);
//           setDuration(res.data.duration?.text || 'N/A');
//         } else {
//           setError(res.data.error || 'Could not calculate distance');
//         }
//       } catch (err) {
//         console.error('Text distance fetch failed:', err);
//         setError('Using map view only (text distance unavailable)');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTextDistance();
//   }, [clientAddressParts, providerAddressParts]);

//   return (
//     <div className="space-y-6">
//       {/* Interactive Embedded Map - Primary display */}
//       <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
//         {loading ? (
//           <div className="h-80 md:h-96 flex items-center justify-center bg-gray-50">
//             <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mr-3" />
//             <span className="text-lg text-gray-700">Loading route map...</span>
//           </div>
//         ) : error && !embedMapUrl ? (
//           <div className="h-80 md:h-96 flex flex-col items-center justify-center bg-red-50 p-6 text-center">
//             <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
//             <p className="text-lg font-medium text-red-800">{error}</p>
//             <p className="text-sm text-red-700 mt-2">
//               Please update your address or driver's location in profile
//             </p>
//           </div>
//         ) : (
//           <iframe
//             width="100%"
//             height="400"
//             style={{ border: 0 }}
//             loading="lazy"
//             allowFullScreen
//             referrerPolicy="no-referrer-when-downgrade"
//             src={embedMapUrl}
//             title="Route from your location to driver"
//           />
//         )}
//       </div>

//       {/* Text Distance & Time (fallback or supplement) */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
//         <div className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm">
//           <div className="p-3 bg-indigo-100 rounded-full">
//             <MapPin className="h-6 w-6 text-indigo-600" />
//           </div>
//           <div>
//             <p className="text-sm text-indigo-700 font-medium">Distance</p>
//             <p className="text-2xl font-bold text-gray-900">
//               {loading ? 'Calculating...' : distance || 'N/A'}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm">
//           <div className="p-3 bg-purple-100 rounded-full">
//             <Clock className="h-6 w-6 text-purple-600" />
//           </div>
//           <div>
//             <p className="text-sm text-purple-700 font-medium">Est. Drive Time</p>
//             <p className="text-2xl font-bold text-gray-900">
//               {loading ? 'Calculating...' : duration || 'N/A'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Small note */}
//       <p className="text-sm text-gray-500 text-center">
//         Map shows real-time driving route (traffic included). Text values are estimates.
//       </p>
//     </div>
//   );
// };

// export default DistanceInfo;






// src/components/DistanceInfo.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { searchGeocode, fetchRoute, fetchDistance, fetchLgaCenter, decodePolyline } from '../utils/geoapi';

// Resolves a location from address parts, preferring the most reliable
// method available:
// 1. If there's a specific street address, try free-text search on that
//    (searchGeocode is autocomplete — works best on a single specific place
//    name, not a comma-joined "address, lga, state, country" string).
// 2. Otherwise (or if that fails), fall back to the LGA's structured center
//    lookup — a direct DB match, not fuzzy search, so it's reliable for
//    "just state + LGA" cases like most seller profiles.
const resolveLocationPoint = async (parts) => {
  if (!parts) return null;

  const hasSpecificAddress = Boolean(parts.address && parts.address.trim());

  if (hasSpecificAddress) {
    try {
      return await searchGeocode(parts.address.trim());
    } catch {
      // fall through to LGA center below
    }
  }

  if (parts.lga && parts.lga.trim()) {
    try {
      return await fetchLgaCenter(parts.lga.trim());
    } catch {
      // fall through to null below
    }
  }

  return null;
};

const hasUsableParts = (parts) => {
  if (!parts) return false;
  return Boolean((parts.address && parts.address.trim()) || (parts.lga && parts.lga.trim()));
};

const makeDotIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

const clientIcon = makeDotIcon('#EF4444'); // red
const providerIcon = makeDotIcon('#3B82F6'); // blue

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(points, { padding: [40, 40] });
  }, [points, map]);

  return null;
}

// Wraps navigator.geolocation in a promise, with sane options
const getBrowserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });

// providerAddressParts: { address, lga, state, country }.
// clientAddressParts is OPTIONAL — if omitted (or has no address/lga),
// the browser's live geolocation is used as the client point instead.
const DistanceInfo = ({ clientAddressParts, providerAddressParts }) => {
  const [clientCoords, setClientCoords] = useState(null);
  const [providerCoords, setProviderCoords] = useState(null);
  const [routePath, setRoutePath] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [driveMinutes, setDriveMinutes] = useState(null);
  const [durationText, setDurationText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      setLocationDenied(false);

      if (!hasUsableParts(providerAddressParts)) {
        if (!cancelled) {
          setError('Location details not available');
          setLoading(false);
        }
        return;
      }

      try {
        // ── Resolve the client/origin point ──
        let origin;

        if (hasUsableParts(clientAddressParts)) {
          origin = await resolveLocationPoint(clientAddressParts);
        }

        if (!origin) {
          try {
            origin = await getBrowserLocation();
          } catch (geoErr) {
            if (!cancelled) {
              if (geoErr.code === 1) {
                setLocationDenied(true);
                setError('Location access denied — please allow location or update your address in profile');
              } else {
                setError('Unable to get your current location');
              }
              setLoading(false);
            }
            return;
          }
        }

        if (cancelled) return;

        // ── Resolve the provider/destination point ──
        const destination = await resolveLocationPoint(providerAddressParts);

        if (!destination) {
          if (!cancelled) {
            setError('Could not locate the provider\'s address');
            setLoading(false);
          }
          return;
        }

        if (cancelled) return;

        setClientCoords(origin);
        setProviderCoords(destination);

        // Prefer a real road route (distance, duration, polyline)
        try {
          const route = await fetchRoute(origin.lat, origin.lng, destination.lat, destination.lng);
          if (cancelled) return;
          setDistanceKm(route.distance_km ?? null);
          setDriveMinutes(route.duration_minutes ?? null);
          setDurationText(route.duration_text ?? null);
          setRoutePath(route.polyline ? decodePolyline(route.polyline) : null);
        } catch {
          const dist = await fetchDistance(origin.lat, origin.lng, destination.lat, destination.lng);
          if (cancelled) return;
          setDistanceKm(dist.distance_km ?? null);
          setDriveMinutes(dist.duration_minutes ?? null);
          setDurationText(dist.duration_text ?? null);
          setRoutePath(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to calculate distance');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [clientAddressParts, providerAddressParts]);

  const points = [
    clientCoords && [clientCoords.lat, clientCoords.lng],
    providerCoords && [providerCoords.lat, providerCoords.lng],
  ].filter(Boolean);

  const distanceLabel =
    distanceKm != null
      ? distanceKm < 1
        ? `${Math.round(distanceKm * 1000)} m`
        : `${distanceKm.toFixed(1)} km`
      : 'N/A';

  const durationLabel = durationText || (driveMinutes != null ? `${driveMinutes} min` : 'N/A');

  return (
    <div className="space-y-6">
      {/* Interactive Map — Leaflet/OpenStreetMap, no API key */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="h-80 md:h-96 flex items-center justify-center bg-gray-50">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mr-3" />
            <span className="text-lg text-gray-700">
              {locationDenied ? 'Waiting for location...' : 'Loading route map...'}
            </span>
          </div>
        ) : error ? (
          <div className="h-80 md:h-96 flex flex-col items-center justify-center bg-red-50 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <p className="text-lg font-medium text-red-800">{error}</p>
            <p className="text-sm text-red-700 mt-2">
              {locationDenied
                ? 'Enable location access in your browser settings, or add your address in profile'
                : "Please update your address or driver's location in profile"}
            </p>
          </div>
        ) : (
          <div style={{ height: 400, width: '100%' }}>
            <MapContainer
              center={points[0] || [6.5244, 3.3792]}
              zoom={11}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitBounds points={points} />

              {clientCoords && (
                <Marker position={[clientCoords.lat, clientCoords.lng]} icon={clientIcon}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
              {providerCoords && (
                <Marker position={[providerCoords.lat, providerCoords.lng]} icon={providerIcon}>
                  <Popup>Provider Location</Popup>
                </Marker>
              )}
              {clientCoords && providerCoords && (
                <Polyline
                  positions={
                    routePath && routePath.length > 0
                      ? routePath
                      : [
                          [clientCoords.lat, clientCoords.lng],
                          [providerCoords.lat, providerCoords.lng],
                        ]
                  }
                  pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.8 }}
                />
              )}
            </MapContainer>
          </div>
        )}
      </div>

      {/* Text Distance & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm">
          <div className="p-3 bg-indigo-100 rounded-full">
            <MapPin className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-indigo-700 font-medium">Distance</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? 'Calculating...' : distanceLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm">
          <div className="p-3 bg-purple-100 rounded-full">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-purple-700 font-medium">Est. Drive Time</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? 'Calculating...' : durationLabel}
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center">
        {routePath ? 'Map shows the estimated driving route.' : 'Map shows a straight-line preview between the two locations.'}{' '}
        Values are estimates.
      </p>
    </div>
  );
};

export default DistanceInfo;