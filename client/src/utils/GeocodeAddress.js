// const cache = {};

// export const geocodeAddress = async (address) => {
//   try {
//     if (cache[address]) {
//       return cache[address]; // ✅ instant return
//     }

//     const res = await fetch(
//       `${import.meta.env.VITE_BACKEND_URL}/api/geocode?q=${encodeURIComponent(address)}`
//     );

//     const text = await res.text();

//     if (text.startsWith("<")) {
//       console.error("Invalid geocode response:", text);
//       return null;
//     }

//     const data = JSON.parse(text);

//     const coords = data?.length > 0
//       ? {
//           lat: parseFloat(data[0].lat),
//           lng: parseFloat(data[0].lon),
//         }
//       : null;

//     cache[address] = coords; // ✅ store

//     return coords;
//   } catch (err) {
//     console.error("Geocoding failed:", err);
//     return null;
//   }
// };
// export const getProviderCoords = async (location) => {
//   if (!location) return null;

//   return await geocodeAddress(location);
// };
// // export const getProviderCoords = async (provider) => {
// //   if (provider?.location?.lat && provider?.location?.lng) {
// //     return {
// //       lat: provider.location.lat,
// //       lng: provider.location.lng,
// //     };
// //   }

// //   // fallback → address
// //   const address =
// //     provider?.address ||
// //     `${provider?.user?.state || ""} ${provider?.user?.lga || ""}`.trim();

// //   if (!address) return null;

// //   return await geocodeAddress(address);
// // };







import { searchGeocode } from './geoapi';

// Turns "Ikeja" / "Lagos" into { lat, lng } using the Nigeria geo API
export const getProviderCoords = async (locationString) => {
  if (!locationString) return null;
  try {
    const result = await searchGeocode(`${locationString}, Nigeria`, 1);
    return { lat: result.lat, lng: result.lng };
  } catch (err) {
    console.warn(`Could not geocode "${locationString}":`, err.message);
    return null;
  }
};