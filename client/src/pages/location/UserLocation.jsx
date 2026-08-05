// import { useEffect, useState } from "react";

// export const useUserLocation = () => {
//   const [location, setLocation] = useState(null);
//   const [address, setAddress] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setError("Geolocation is not supported by your browser.");
//       setLoading(false);
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         try {
//           const { latitude, longitude, accuracy } = position.coords;

//           const coords = {
//             lat: latitude,
//             lng: longitude,
//             accuracy,
//           };

//           setLocation(coords);

//           // 🔥 Reverse Geocoding
//           const res = await fetch(
//             `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
//           );

//           const data = await res.json();

//           if (data.status === "OK") {
//             setAddress(data.results[0]);
//           } else {
//             setError("Unable to fetch address.");
//           }
//         } catch (err) {
//           setError("Error fetching location details.");
//         } finally {
//           setLoading(false);
//         }
//       },
//       (err) => {
//         setError(err.message);
//         setLoading(false);
//       },
//       {
//         enableHighAccuracy: true, // 🔥 key for accuracy
//         timeout: 15000,
//         maximumAge: 0,
//       }
//     );
//   }, []);

//   return { location, address, loading, error };
// };






// utils/useUserLocation.js
import { useEffect, useState } from "react";

const NG_GEO_BASE_URL = "https://nigeria.jamiuadewaleyusuf.com/api/v1";

// ── Straight-line distance (Haversine) ──────────────────────────────
// Kept as a pure local calculation — this is exactly what the API's own
// /distance endpoint does under the hood, but computing it client-side
// is instant and needs no network round-trip. Use this for quick
// eligibility checks ("is this rider within 20km?").
export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Reverse geocode via the Nigeria geo API (no API key required) ──
export const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `${NG_GEO_BASE_URL}/geocode/reverse?lat=${lat}&lng=${lng}`
  );

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message || "Unable to fetch address.");
  }

  return data.data;
};

export const useUserLocation = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;

          const coords = {
            lat: latitude,
            lng: longitude,
            accuracy,
          };

          setLocation(coords);

          // 🔥 Reverse Geocoding — Nigeria geo API, no key needed
          const addressData = await reverseGeocode(latitude, longitude);
          setAddress(addressData);
        } catch (err) {
          setError(err.message || "Error fetching location details.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true, // 🔥 key for accuracy
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  return { location, address, loading, error };
};