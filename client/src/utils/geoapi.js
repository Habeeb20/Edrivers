

// // utils/geoApi.js
// const NG_GEO_BASE_URL = "https://nigeria.jamiuadewaleyusuf.com/api/v1";

// // ── Forward geocode: address string → coordinates (replaces Google Places/Geocoding) ──
// export const searchGeocode = async (query) => {
//   const res = await fetch(
//     `${NG_GEO_BASE_URL}/geocode/search?q=${encodeURIComponent(query)}`
//   );
//   const data = await res.json();

//   if (data.status !== "success") {
//     throw new Error(data.message || `Could not locate "${query}"`);
//   }

//   const results = Array.isArray(data.data) ? data.data : [data.data];
//   const first = results[0];

//   if (!first) {
//     throw new Error(`No matching location found for "${query}"`);
//   }

//   // Be tolerant of field-naming differences in the API's response shape
//   const lat = first.lat ?? first.latitude ?? first.location?.lat;
//   const lng = first.lng ?? first.longitude ?? first.location?.lng;

//   if (lat == null || lng == null) {
//     throw new Error("Unexpected geocode response shape");
//   }

//   return { lat: Number(lat), lng: Number(lng), raw: first };
// };

// // ── Straight-line distance via the API (zero-latency Haversine, server-side) ──
// export const fetchDistance = async (fromLat, fromLng, toLat, toLng) => {
//   const res = await fetch(
//     `${NG_GEO_BASE_URL}/distance?from_lat=${fromLat}&from_lng=${fromLng}&to_lat=${toLat}&to_lng=${toLng}`
//   );
//   const data = await res.json();

//   if (data.status && data.status !== "success") {
//     throw new Error(data.message || "Could not calculate distance");
//   }

//   return data.data || data;
// };

// // ── Road route: distance, duration, turn-by-turn, polyline ──
// export const fetchRoute = async (fromLat, fromLng, toLat, toLng) => {
//   const res = await fetch(
//     `${NG_GEO_BASE_URL}/route?from_lat=${fromLat}&from_lng=${fromLng}&to_lat=${toLat}&to_lng=${toLng}`
//   );
//   const data = await res.json();

//   if (data.status && data.status !== "success") {
//     throw new Error(data.message || "Could not calculate route");
//   }

//   return data.data || data;
// };

// // ── LGA center via its bounds endpoint — use this for known LGA/state names ──
// // (structured lookup; accepts slug, display name, or ISO code, case-insensitive).
// // This is the correct endpoint for administrative-unit lookups — /geocode/search
// // is free-text address autocomplete and isn't meant for "LGA, State" strings.
// export const fetchLgaCenter = async (lgaSlugOrName) => {
//   const res = await fetch(
//     `${NG_GEO_BASE_URL}/lgas/${encodeURIComponent(lgaSlugOrName)}/bounds`
//   );
//   const data = await res.json();

//   if (data.status !== "success") {
//     throw new Error(data.message || `LGA "${lgaSlugOrName}" not found`);
//   }

//   const payload = data.data;

//   // Tolerate a few likely response shapes: an explicit center object, or a
//   // bounds box we can average into a center ourselves.
//   if (payload.center) {
//     return { lat: Number(payload.center.lat), lng: Number(payload.center.lng), raw: payload };
//   }

//   const bounds = payload.bounds || payload;
//   const north = bounds.north ?? bounds.max_lat ?? bounds.maxLat;
//   const south = bounds.south ?? bounds.min_lat ?? bounds.minLat;
//   const east = bounds.east ?? bounds.max_lng ?? bounds.maxLng;
//   const west = bounds.west ?? bounds.min_lng ?? bounds.minLng;

//   if ([north, south, east, west].some((v) => v == null)) {
//     throw new Error("Unexpected LGA bounds response shape");
//   }

//   return {
//     lat: (Number(north) + Number(south)) / 2,
//     lng: (Number(east) + Number(west)) / 2,
//     raw: payload,
//   };
// };

// // ── Decode a standard encoded polyline string (Google polyline algorithm, precision 5) ──
// export const decodePolyline = (encoded) => {
//   if (!encoded) return [];

//   const points = [];
//   let index = 0;
//   let lat = 0;
//   let lng = 0;

//   while (index < encoded.length) {
//     let b;
//     let shift = 0;
//     let result = 0;

//     do {
//       b = encoded.charCodeAt(index++) - 63;
//       result |= (b & 0x1f) << shift;
//       shift += 5;
//     } while (b >= 0x20);
//     const dlat = result & 1 ? ~(result >> 1) : result >> 1;
//     lat += dlat;

//     shift = 0;
//     result = 0;
//     do {
//       b = encoded.charCodeAt(index++) - 63;
//       result |= (b & 0x1f) << shift;
//       shift += 5;
//     } while (b >= 0x20);
//     const dlng = result & 1 ? ~(result >> 1) : result >> 1;
//     lng += dlng;

//     points.push([lat / 1e5, lng / 1e5]);
//   }

//   return points;
// };






// utils/geoApi.js
const NG_GEO_BASE_URL = "https://nigeria.jamiuadewaleyusuf.com/api/v1";

// ── Forward geocode: address string → coordinates (replaces Google Places/Geocoding) ──
export const searchGeocode = async (query) => {
  const res = await fetch(
    `${NG_GEO_BASE_URL}/geocode/search?q=${encodeURIComponent(query)}`
  );
  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message || `Could not locate "${query}"`);
  }

  const results = Array.isArray(data.data) ? data.data : [data.data];
  const first = results[0];

  if (!first) {
    throw new Error(`No matching location found for "${query}"`);
  }

  // API's consistent shape: { coordinates: { lat, lng } }
  // (confirmed across /states, /states/{slug}/lgas, and /geocode/search)
  const lat = first.coordinates?.lat ?? first.lat ?? first.latitude;
  const lng = first.coordinates?.lng ?? first.lng ?? first.longitude;

  if (lat == null || lng == null) {
    console.error('Unrecognized geocode shape — raw response:', data);
    throw new Error("Unexpected geocode response shape");
  }

  return { lat: Number(lat), lng: Number(lng), raw: first };
};

// ── Straight-line distance via the API (zero-latency Haversine, server-side) ──
export const fetchDistance = async (fromLat, fromLng, toLat, toLng) => {
  const res = await fetch(
    `${NG_GEO_BASE_URL}/distance?from_lat=${fromLat}&from_lng=${fromLng}&to_lat=${toLat}&to_lng=${toLng}`
  );
  const data = await res.json();

  if (data.status && data.status !== "success") {
    throw new Error(data.message || "Could not calculate distance");
  }

  return data.data || data;
};

// ── Road route: distance, duration, turn-by-turn, polyline ──
export const fetchRoute = async (fromLat, fromLng, toLat, toLng) => {
  const res = await fetch(
    `${NG_GEO_BASE_URL}/route?from_lat=${fromLat}&from_lng=${fromLng}&to_lat=${toLat}&to_lng=${toLng}`
  );
  const data = await res.json();

  if (data.status && data.status !== "success") {
    throw new Error(data.message || "Could not calculate route");
  }

  return data.data || data;
};

// ── LGA center via its bounds endpoint ──
export const fetchLgaCenter = async (lgaSlugOrName) => {
  const res = await fetch(
    `${NG_GEO_BASE_URL}/lgas/${encodeURIComponent(lgaSlugOrName)}/bounds`
  );
  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message || `LGA "${lgaSlugOrName}" not found`);
  }

  const payload = data.data;

  if (payload.center) {
    return { lat: Number(payload.center.lat), lng: Number(payload.center.lng), raw: payload };
  }
  if (payload.coordinates) {
    return { lat: Number(payload.coordinates.lat), lng: Number(payload.coordinates.lng), raw: payload };
  }

  const bounds = payload.bounds || payload;
  const north = bounds.north ?? bounds.max_lat ?? bounds.maxLat;
  const south = bounds.south ?? bounds.min_lat ?? bounds.minLat;
  const east = bounds.east ?? bounds.max_lng ?? bounds.maxLng;
  const west = bounds.west ?? bounds.min_lng ?? bounds.minLng;

  if ([north, south, east, west].some((v) => v == null)) {
    throw new Error("Unexpected LGA bounds response shape");
  }

  return {
    lat: (Number(north) + Number(south)) / 2,
    lng: (Number(east) + Number(west)) / 2,
    raw: payload,
  };
};

// ── Decode a standard encoded polyline string (Google polyline algorithm, precision 5) ──
export const decodePolyline = (encoded) => {
  if (!encoded) return [];

  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
};