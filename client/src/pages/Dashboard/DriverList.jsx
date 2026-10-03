
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Car, Star, MapPin, Clock, DollarSign, Home, List,
  X, Eye, Gauge, Languages, Globe, Calendar,
  User, Phone, Mail, Search, Loader2,Briefcase,Wallet,
  Heart, HeartOff, Share2, SlidersHorizontal, Filter,
  Calendar1, CalendarIcon,
  Clock1, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import DistanceInfo from "../DistanceMap"
import { useUserLocation } from '../location/UserLocation';
import { getProviderCoords } from '../../utils/GeocodeAddress';
import { useRef } from 'react'; // add to existing react import

import { timeAgo, formatJoinDate } from '../../utils/formatTime';
import HireModal from "../subPages/HireModal"

import { fetchRoute, fetchDistance, fetchLgaCenter, searchGeocode } from '../../utils/geoapi';
import DriverProfileDetails from '../subPages/DriverProfileModalDetail';
const formatCategory = (cat) =>
  cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const DriversList = () => {
  const [completedCounts, setCompletedCounts] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [nameSearch, setNameSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [pricingConfigs, setPricingConfigs] = useState([]);
  const [driverCategories, setDriverCategories] = useState([]);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
const [driverHistory, setDriverHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);
const { location } = useUserLocation();
const [selectedHistoryDriver, setSelectedHistoryDriver] = useState(null);

  // Inside DriversList component, add this state
const [selectedCategoryPricing, setSelectedCategoryPricing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
    const [distances, setDistances] = useState({});
  const userLat = location?.lat;
const userLng = location?.lng;
  const token = localStorage.getItem('token');
    const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ['places'];
  const [form, setForm] = useState({
    durationHours: '',
    amountOffered: '',
    category: '',
    address: '',
    description:'',
    date:'',
    time:'',
    accommodation: false,
    benefits: '',
  });
    const { isLoaded } = useLoadScript({
    googleMapsApiKey: mapsApiKey,
    libraries,
  });


  const [searchParams, setSearchParams] = useState({
      category: '',     
    transmission: [],
    languages: [],
    minExperience: '',
    maxExperience: '',
    minEarnings: '',
    maxEarnings: '',
    interstate: false,
    international: false,
    isAvailable: true,
  });

  const [calculatedAmount, setCalculatedAmount] = useState(0);


// Increment view count when "View Details" is clicked
const handleViewDetails = async (driver) => {
  console.log(driver)
  // Get driver ID safely - your data has driver.user._id
  const driverId = driver?.user?.id|| driver?.user?._id || driver?._id;

  if (!driverId) {
    toast.error("Invalid driver ID");
    return;
  }

  // Optimistic update - handle nested "user" structure
  setDrivers((prev) =>
    prev.map((d) => {
      const currentId = d?.user?._id || d?._id;
      if (currentId === driverId) {
        const currentViews = d?.user?.views ?? d?.views ?? 0;
        return {
          ...d,
          user: d.user 
            ? { ...d.user, views: currentViews + 1 } 
            : { ...d, views: currentViews + 1 }
        };
      }
      return d;
    })
  );

  // Save to backend
  try {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/drivers/${driverId}/view`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error("Failed to increment view count:", err);
    // toast.error("Could not update view count");  // optional
  }

  // Open the details modal
  openDetailsModal(driver);
};

  // Fetch Hire History for a specific driver
const fetchDriverHistory = async (driver) => {
  if (!driver?.user?._id && !driver?.user?.id) {
    toast.error("Invalid driver ID");
    return;
  }

  const driverId = driver.user?._id || driver.user?.id;
  setSelectedHistoryDriver(driver);
  setHistoryLoading(true);
  setShowHistoryModal(true);

  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/hire/history/${driverId}?role=driver`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setDriverHistory(res.data.data || []);
    const history = res.data.data || [];
    setDriverHistory(history);
    // Save completed count for the grid
    const completed = history.filter(h => h.status === 'ended').length;
    setCompletedCounts(prev => ({
      ...prev,
      [driver.user?._id || driver._id]: completed
    }));
  } catch (err) {
    console.error("Failed to fetch history:", err);
    toast.error("Failed to load hire history");
    setDriverHistory([]);
  } finally {
    setHistoryLoading(false);
  }
};

  useEffect(() => {
    fetchPricingConfigs();
  }, []);

  useEffect(() => {
    if (pricingConfigs.length > 0) {
      const categories = pricingConfigs.map(c => c.category);
      setDriverCategories(categories);
      fetchDrivers(); // initial load
    }
  }, [pricingConfigs]);

  const fetchDrivers = async (params = searchParams) => {
    if (!token) {
      toast.error('Please log in to view drivers');
      return;
    }

    setLoading(true);

    try {
      const query = new URLSearchParams();

      // Categories (multiple)
      // params.categories?.forEach(cat => query.append('categories', cat));
  if (params.category) {
        query.append('categories', params.category);
      }
      // Transmission
      params.transmission?.forEach(t => query.append('transmission', t));

      // Languages
      params.languages?.forEach(l => query.append('languages', l));

      // Experience
      if (params.minExperience) query.append('minExperience', params.minExperience);
      if (params.maxExperience) query.append('maxExperience', params.maxExperience);

      // Earnings
      if (params.minEarnings) query.append('minEarnings', params.minEarnings);
      if (params.maxEarnings) query.append('maxEarnings', params.maxEarnings);

      // Travel
      if (params.interstate) query.append('interstate', 'true');
      if (params.international) query.append('international', 'true');


      

      // Availability
      query.append('isAvailable', params.isAvailable);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/driver/search?${query.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data.data || res.data ||  [];
      setDrivers(data);
      console.log(data)
      console.log("Fetched drivers:", data);
    } catch (err) {
      console.error("Driver fetch error:", err);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingConfigs = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/pricing`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPricingConfigs(res.data.pricingConfigs || []);
    } catch (err) {
      console.warn("Could not load pricing configs", err);
    }
  };

  // Apply filters
  const handleSearch = () => {
    fetchDrivers(searchParams);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultParams = {
      categories: [],
      transmission: [],
      languages: [],
      minExperience: '',
      maxExperience: '',
      minEarnings: '',
      maxEarnings: '',
      interstate: false,
      international: false,
      isAvailable: true,
    };
    setSearchParams(defaultParams);
    fetchDrivers(defaultParams);
  };


  const selectCategory = (cat) => {
    setSearchParams(prev => ({
      ...prev,
      category: prev.category === cat ? '' : cat, // toggle: select or deselect
    }));
  };
  // Toggle transmission
  const toggleTransmission = (t) => {
    setSearchParams(prev => ({
      ...prev,
      transmission: prev.transmission.includes(t)
        ? prev.transmission.filter(x => x !== t)
        : [...prev.transmission, t],
    }));
  };

  // Toggle language
  const toggleLanguage = (l) => {
    setSearchParams(prev => ({
      ...prev,
      languages: prev.languages.includes(l)
        ? prev.languages.filter(x => x !== l)
        : [...prev.languages, l],
    }));
  };

  // Like / Unlike
  const toggleLike = async (driverId) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/drivers/${driverId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setDrivers(prev =>
          prev.map(p =>
            p._id === driverId
              ? { ...p, likesCount: res.data.likesCount, isLiked: res.data.isLiked }
              : p
          )
        );
      }
      toast.success("liked successfully")
    } catch (err) {
      console.log(err)
      toast.error('Failed to update like');
    }
  };

  // Share
  const handleShare = async (driverId) => {
    const url = `${window.location.origin}/driver/${driverId}`;
    const text = `Check out ${driverId.providerProfile?.businessName || `${driverId.firstName} ${driverId.lastName}`} on Efixit!`;

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/drivers/${driverId}/share`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("sharing contents...")
    } catch (err) {
      console.error('Share count increment failed:', err);
    }

    if (navigator.share) {
      navigator.share({ title: 'Driver', text, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      toast.success('Link copied to clipboard!');
    }
  };

  // Open Details (fixed _id issue)
  const openDetailsModal = async (driver) => {
    const driverId = driver?.user?._id || driver?.user?.id; // fallback in case API returns id instead of _id
    if (!driverId) {
      toast.error('Invalid driver ID');
      return;
    }


    setSelectedDriver(driver);
    setSelectedProfile(null);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/driver/profile/${driverId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSelectedProfile(res.data.profile);
      } else {
        toast.error('Profile not found');
      }
    } catch (err) {
      toast.error('Failed to load driver profile');
      console.error(err);
    }

    setShowDetailsModal(true);
  };

//   const openHireModal = (driver) => {
    
//   setSelectedDriver(driver);

//   let prefilledCategory = '';
//   if (searchParams.category) {
//     prefilledCategory = searchParams.category; // single selected category
//   }

//   // We'll calculate suggested amount after category & duration are set
//   setForm({
//     durationHours: '',
//     amountOffered: '',           // will be set via useEffect once calculated
//     category: prefilledCategory,
//     address: '',
//     description:'',
//     date:'',
//     time:'',
//     accommodation: false,
//     benefits: '',
//   });
//   setCalculatedAmount(0);
//   setShowHireModal(true);
// };

const openHireModal = (driver) => {
  setSelectedDriver(driver);
  setShowHireModal(true);
};

useEffect(() => {
  console.log("useEffect triggered → category:", JSON.stringify(form.category));

  if (!form.category || pricingConfigs.length === 0) {
    setSelectedCategoryPricing(null);
    setCalculatedAmount(0);
    setForm(prev => ({ ...prev, amountOffered: '' }));
    return;
  }

  // Super tolerant cleaning to handle invisible chars, spaces, different dashes
  const clean = str =>
    (str || '')
      .trim()
      .toLowerCase()
      .replace(/[\s\u200B-\u200D\uFEFF\u00A0]+/g, '-')     // all whitespace variants → -
      .replace(/[-–—−]+/g, '-');                           // all dash types → normal -

  const formClean = clean(form.category);

  console.log("Cleaned form value:", formClean);

  const config = pricingConfigs.find(c => {
    const dbClean = clean(c.category);
    const matches = dbClean === formClean;
    console.log(`Comparing DB "${c.category}" → "${dbClean}" vs form "${formClean}" → ${matches}`);
    return matches;
  });

  console.log("Found config:", config ? config.category : "NOT FOUND");

  if (config) {
    setSelectedCategoryPricing(config);

    const hours = Number(form.durationHours);
    if (!isNaN(hours) && hours > 0) {
      let suggested = 0;
      if (hours >= 720) suggested = config.monthlyRate || 0;
      else if (hours >= 168) suggested = config.weeklyRate || 0;
      else if (hours >= 24) suggested = (config.dailyRate || 0) * Math.ceil(hours / 24);
      else suggested = (config.hourlyRate || 0) * hours;

      const rounded = Math.round(suggested);
      setCalculatedAmount(rounded);
      setForm(prev => ({ ...prev, amountOffered: rounded.toString() }));
    }
  } else {
    setSelectedCategoryPricing(null);
    setCalculatedAmount(0);
    setForm(prev => ({ ...prev, amountOffered: '' }));
  }
}, [form.category, form.durationHours, pricingConfigs]);
  

// Enforce minimum offer (75% of calculated)
 
 
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (calculatedAmount > 0 && Number(value) > 0) {
      const minAllowed = calculatedAmount * 0.75;
      if (Number(value) < minAllowed) {
        toast.error(
          `Your offer must be at least 75% of the suggested amount (₦${Math.round(minAllowed).toLocaleString()}). ` +
          `This helps ensure fair compensation for drivers while still giving you flexibility.`
        );
        return; // block input below min
      }
    }
    setForm({ ...form, amountOffered: value });
  };

const resolveDriverLocation = async (address, lga) => {
  if (address && address.trim()) {
    try {
      return await searchGeocode(address.trim());
    } catch {
      // fall through to LGA center
    }
  }
  if (lga && lga.trim()) {
    try {
      return await fetchLgaCenter(lga.trim());
    } catch {
      return null;
    }
  }
  return null;
};

// Wraps navigator.geolocation in a promise — same as DistanceInfo
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

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

useEffect(() => {
  if (!drivers.length) return;

  let cancelled = false;

  const computeDistances = async () => {
    // ── Get the user's real current location from the browser ──
    let originLat, originLng;
    try {
      const origin = await getBrowserLocation();
      if (cancelled) return;
      originLat = origin.lat;
      originLng = origin.lng;
    } catch (err) {
      console.error('Could not get browser location:', err);
      if (!cancelled) setDistances({});
      return; // no reliable origin — don't compute anything wrong
    }

    const results = {};
    const locationMap = {}; // cache for geocoded LGA/state fallbacks

    const driversNeedingGeocode = drivers.filter((d) => {
      const coords = d.user?.location?.coordinates;
      const hasValidCoords =
        Array.isArray(coords) &&
        coords.length === 2 &&
        coords[0] !== 0 &&
        coords[1] !== 0;
      return !hasValidCoords;
    });

    const uniqueLocations = [
      ...new Set(
        driversNeedingGeocode
          .map((d) => d.user?.lga || d.user?.state)
          .filter(Boolean)
      ),
    ];

    // Resolve each unique LGA/state once, via the structured lookup
    for (const loc of uniqueLocations) {
      try {
        const geo = await resolveDriverLocation(null, loc);
        locationMap[loc] = geo;
      } catch (err) {
        console.error('Geocode failed for', loc, err);
        locationMap[loc] = null;
      }
      await new Promise((res) => setTimeout(res, 1000));
    }

    if (cancelled) return;

    for (const driver of drivers) {
      const driverId = driver.user?.id;
      if (!driverId) continue;

      const coords = driver.user?.location?.coordinates;
      const hasValidCoords =
        Array.isArray(coords) &&
        coords.length === 2 &&
        coords[0] !== 0 &&
        coords[1] !== 0;

      let lat, lng;

      if (hasValidCoords) {
        // GeoJSON order is [longitude, latitude]
        [lng, lat] = coords;
      } else {
        const loc = driver.user?.lga || driver.user?.state;
        const geo = locationMap[loc];
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
        }
      }

      if (lat == null || lng == null) continue;

      try {
        const route = await fetchRoute(originLat, originLng, lat, lng);
        if (route?.distance_km != null) {
          results[driverId] = {
            km: route.distance_km,
            minutes: route.duration_minutes ?? null,
          };
        } else {
          throw new Error('No route data');
        }
      } catch {
        try {
          const dist = await fetchDistance(originLat, originLng, lat, lng);
          results[driverId] = {
            km: dist.distance_km ?? calculateDistance(originLat, originLng, lat, lng),
            minutes: dist.duration_minutes ?? null,
          };
        } catch {
          const km = calculateDistance(originLat, originLng, lat, lng);
          if (typeof km === 'number' && !isNaN(km)) {
            results[driverId] = { km, minutes: null };
          }
        }
      }

      await new Promise((res) => setTimeout(res, 300));
    }

    if (!cancelled) {
      setDistances(results);
    }
  };

  computeDistances();
  return () => {
    cancelled = true;
  };
}, [drivers]);

const estimateETA = (distanceKm) => {
  const avgSpeed = 40;
  return Math.round((distanceKm / avgSpeed) * 60);
};


const filteredDrivers = drivers.filter((driver) => {
  if (!nameSearch.trim()) return true;
  const fullName = `${driver.user?.firstName || ''} ${driver.user?.lastName || ''}`.toLowerCase();
  const businessName = driver.user?.providerProfile?.businessName?.toLowerCase() || '';
  const query = nameSearch.toLowerCase().trim();
  return fullName.includes(query) || businessName.includes(query);
});
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-900"
        >
          Find Your Perfect Driver
        </motion.h1>

        {/* Filters - Horizontal Scrollable on Mobile */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Filter className="h-6 w-6 text-blue-600" />
              Filters
            </h2>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="relative mb-5">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
  <input
    type="text"
    value={nameSearch}
    onChange={(e) => setNameSearch(e.target.value)}
    placeholder="Search drivers by name..."
    className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition text-base"
  />
  {nameSearch && (
    <button
      onClick={() => setNameSearch('')}
      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
    >
      <X className="h-4 w-4 text-gray-400" />
    </button>
  )}
</div>
{nameSearch && (
  <p className="text-sm text-gray-500 -mt-3 mb-4">
    Showing {filteredDrivers.length} of {drivers.length} drivers
  </p>
)}

          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-3 min-w-max">
            {driverCategories.map(cat => (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectCategory(cat)}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm ${
                    searchParams.category === cat
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {formatCategory(cat)}
                </motion.button>
              ))}
            </div>
          </div>
            <div className="flex gap-4 mt-6 justify-center md:justify-start">
            <button
              onClick={handleSearch}
              className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md"
            >
              <Search size={18} />
             Search
            </button>
            <button
              onClick={resetFilters}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
            >
              Reset
            </button>
          </div>
        </div>

      

        {/* Drivers Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        // ) : drivers.length === 0 ? (
        //   <div className="text-center py-20 text-gray-600 text-xl font-medium">
        //     No drivers found. Try adjusting your filters.
        //   </div>
        // ) : (
        //   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        //     {drivers.map(driver => (
          ) : filteredDrivers.length === 0 ? (
  <div className="text-center py-20 text-gray-600 text-xl font-medium">
    {nameSearch
      ? `No drivers found matching "${nameSearch}".`
      : 'No drivers found. Try adjusting your filters.'}
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
    {filteredDrivers.map(driver => (
              <motion.div
                key={driver._id}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-600">
                  <img
                    src={driver.user?.avatar || '/default-avatar.jpg'}
                    alt={`${driver.user.firstName} ${driver.user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold">
                      {driver.user.firstName} {driver.user.lastName}
                    </h3>
                 

                    
                    
    
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {driver.categories?.slice(0, 3).map(cat => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {formatCategory(cat)}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-3 text-sm text-gray-700">
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-500" />
                      {driver.user?.state || driver.user?.lga || 'Location not specified'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Gauge size={16} className="text-green-600" />
                      {driver.yearsOfExperience || 0} years experience
                    </p>
                   
                    {driver.isAvailable ? (
 <p className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-black text-xs font-semibold rounded-full">
                      <Gauge size={16} className="text-green-600" />
                      {'Available Now'}
                    </p>

                    ) : (
                      <>
                      <p className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-black text-xs font-semibold rounded-full">
                      <Gauge size={16} className="text-blue-600" />
                      {'Currently Unavailable'}
                    </p>
                      </>
                    )}
                <p className="flex items-center gap-2">
  <Gauge size={16} className="text-green-600" />
  Last Seen: {timeAgo(driver.user?.lastSeen)}
</p>
<p className="flex items-center gap-2">
  <Gauge size={16} className="text-green-600" />
  Joined: {formatJoinDate(driver.user?.createdAt)}
</p>
                    {/* <DistanceAndTime /> */}
<p>
  📍 {distances[driver.user.id]
    ? `${distances[driver.user.id].km.toFixed(1)} km away • ${
        distances[driver.user.id].minutes != null
          ? distances[driver.user.id].minutes
          : estimateETA(distances[driver.user.id].km)
      } min away`
    : "Calculating distance..."}
</p>
                  </div>
                                 <div className="flex items-center gap-1.5 text-sm mt-1">
  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
  
  {driver.user?.isCertified && (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
      Certified
    </span>
  )}
  {driver.user?.isOnline ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
      Online
    </span>
  ) : (
    <>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
        Offline
      </span>
    </>
  )}
</div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleLike(driver.user?.id)}
                      className={`flex-1 py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                        driver.isLiked
                          ? 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {driver.isLiked ? <HeartOff size={18} /> : <Heart size={18} />}
                      {driver.user?.likes?.length || 0}
                    </button>
                    <button
                      onClick={() => handleShare(driver.user?.id)}
                      className="flex-1 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 text-gray-700 font-medium"
                    >
                      <Share2 size={18} />
                      {driver.user?.shares || 0}
                    </button>
                    <button
                      onClick={() => handleShare(driver.user?.id)}
                      className="flex-1 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 text-gray-700 font-medium"
                    >
                      <Eye size={18} />
                      {driver.user?.views || 0}
                    </button>
                  </div>




                  <div className="flex gap-3">
             <button
    onClick={() => handleViewDetails(driver)}
    className="flex-1 py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition"
  >
    View Details

  </button>
                    <button
                      onClick={() => openHireModal(driver)}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                      Hire Now
                    </button>

 
                  </div>
                                     <button
    onClick={() => fetchDriverHistory(driver)}
    className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition flex items-center justify-center gap-2"
  >
    <Clock className="h-5 w-5" />
    View Hire History
  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
    {/* Details Modal */}
{showDetailsModal && selectedDriver && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white w-full sm:max-w-4xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto relative"
    >

      <button
        onClick={() => setShowDetailsModal(false)}
        className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-md hover:bg-white transition"
      >
        <X className="h-5 w-5 text-gray-700" />
      </button>

   
      <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-600 px-6 pt-10 pb-16 sm:rounded-t-3xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
        <div className="relative text-center">
          <img
            src={selectedDriver.user?.avatar || '/default-avatar.jpg'}
            alt=""
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mx-auto border-4 border-white/80 shadow-xl object-cover"
          />
          <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-white">
            {selectedDriver.user?.firstName} {selectedDriver.user?.lastName}
          </h2>
          <p className="flex items-center justify-center gap-1.5 text-white/80 text-sm mt-1">
            <MapPin className="h-4 w-4" />
            {selectedDriver.user?.lga}{selectedDriver.user?.state ? `, ${selectedDriver.user.state}` : ''}
          </p>
     
        </div>
      </div>

  
      <div className="px-4 sm:px-8 -mt-8 relative">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 grid grid-cols-2 sm:grid-cols-3 divide-x divide-gray-100">
          <div className="p-4 text-center">
            <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Experience</p>
            <p className="font-semibold text-gray-900 text-sm">
              {selectedProfile?.yearsOfExperience || selectedDriver.yearsOfExperience || 'N/A'} yrs
            </p>
          </div>
          <div className="p-4 text-center">
            <Languages className="h-5 w-5 text-teal-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Languages</p>
            <p className="font-semibold text-gray-900 text-sm truncate">
              {selectedProfile?.languagesSpoken?.length > 0
                ? selectedProfile.languagesSpoken.length
                : selectedDriver.driverProfile?.languagesSpoken?.length || '—'}
            </p>
          </div>
          <div className="p-4 text-center col-span-2 sm:col-span-1">
            <Globe className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Interstate</p>
            <p className="font-semibold text-gray-900 text-sm">
              {selectedProfile?.travelCapabilities?.interstate ? 'Available' : 'No'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-gray-900">
              <User className="h-5 w-5 text-blue-600" /> Personal Info
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                {selectedProfile?.yearsOfExperience || selectedDriver.yearsOfExperience || 'N/A'} years experience
              </p>
              <p className="flex items-center gap-2.5">
                <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                {selectedProfile?.bio ? 'Bio available' : 'No bio provided'}
              </p>
            </div>
          </div>

   
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-gray-900">
              <Car className="h-5 w-5 text-blue-600" /> Vehicle
            </h3>
            {selectedDriver.user?.vehicle ? (
              <div className="space-y-1.5 text-sm text-gray-700">
                <p><span className="text-gray-500">Make/Model:</span> {selectedDriver.user.vehicle.make} {selectedDriver.user.vehicle.model}</p>
                <p><span className="text-gray-500">Year:</span> {selectedDriver.user.vehicle.year}</p>
                <p><span className="text-gray-500">Color:</span> {selectedDriver.user.vehicle.color}</p>
                <p><span className="text-gray-500">Plate:</span> {selectedDriver.user.vehicle.licensePlate}</p>
                <p><span className="text-gray-500">Capacity:</span> {selectedDriver.user.vehicle.capacity} passengers</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No vehicle info</p>
            )}
          </div>
        </div>

      
        {selectedProfile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-gray-900">
                <Languages className="h-5 w-5 text-teal-600" /> Languages Spoken
              </h3>
              <p className="text-sm text-gray-700">
                {selectedProfile.languagesSpoken?.length > 0
                  ? selectedProfile.languagesSpoken.join(', ')
                  : 'Not specified'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-gray-900">
                <Globe className="h-5 w-5 text-blue-600" /> Travel Capabilities
              </h3>
              <div className="space-y-1.5 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  {selectedProfile.travelCapabilities?.interstate
                    ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                    : <X className="h-4 w-4 text-blue-400" />}
                  Interstate
                </p>
                <p className="flex items-center gap-2">
                  {selectedProfile.travelCapabilities?.international
                    ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                    : <X className="h-4 w-4 text-blue-400" />}
                  International
                </p>
                {selectedProfile.travelCapabilities?.travelNotes && (
                  <p className="text-xs italic text-gray-500 mt-2 pt-2 border-t border-gray-200">
                    {selectedProfile.travelCapabilities.travelNotes}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

    
        {selectedProfile?.expectedEarnings && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100">
            <h3 className="text-base font-bold mb-2 flex items-center gap-2 text-gray-900">
              <Wallet className="h-5 w-5 text-green-600" /> Expected Earnings
            </h3>
            <p className="text-xl font-bold text-emerald-700">
              ₦{selectedProfile.expectedEarnings?.min?.toLocaleString() || 'N/A'} – ₦
              {selectedProfile.expectedEarnings?.max?.toLocaleString() || 'N/A'}
              <span className="text-sm font-normal text-gray-500"> /month</span>
            </p>
            {selectedProfile.expectedEarnings?.note && (
              <p className="text-xs text-gray-500 mt-1">{selectedProfile.expectedEarnings.note}</p>
            )}
          </div>
        )}

        {/* Full driver profile */}
{selectedProfile && <DriverProfileDetails profile={selectedProfile} />}
      
        {selectedDriver.driverProfile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-gray-900">
                <Gauge className="h-5 w-5 text-green-600" /> Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedDriver.driverProfile.categories?.map((cat) => (
                  <span key={cat} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                    {cat.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-gray-900">
                <Languages className="h-5 w-5 text-teal-600" /> Languages & Travel
              </h3>
              <div className="space-y-1.5 text-sm text-gray-700">
                <p>{selectedDriver.driverProfile.languagesSpoken?.join(', ') || 'Not specified'}</p>
                <p>Interstate: {selectedDriver.driverProfile.travelCapabilities?.interstate ? 'Yes' : 'No'}</p>
                <p>International: {selectedDriver.driverProfile.travelCapabilities?.international ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        )}

 
        {(selectedProfile?.bio || selectedDriver.bio) && (
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h3 className="text-base font-bold mb-3 text-gray-900">About Me</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {selectedProfile?.bio || selectedDriver.bio}
            </p>
          </div>
        )}


        <DistanceInfo
          providerAddressParts={{
            address: selectedDriver.user?.address || '',
            lga: selectedDriver.user?.lga || '',
            state: selectedDriver.user?.state || 'Lagos',
            country: 'Nigeria',
          }}
        />
      </div>

    
      <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 p-4 sm:p-6">
        <button
          onClick={() => {
            setShowDetailsModal(false);
            openHireModal(selectedDriver);
          }}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white text-base sm:text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          Hire This Driver
        </button>
      </div>
    </motion.div>
  </div>
)}




    {showHireModal && selectedDriver && (
  <HireModal
    driver={selectedDriver}
    token={token}
    pricingConfigs={pricingConfigs}
    driverCategories={driverCategories}
    initialCategory={searchParams.category}
    isLoaded={isLoaded}
    onClose={() => setShowHireModal(false)}
  />
)}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
          >
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-2xl font-bold text-center mb-6">Confirm Hire Request</h3>

            <div className="space-y-6">
              <p className="text-center text-gray-700">
                You are about to send a hire request to{' '}
                <strong className="text-gray-900">
                  {selectedDriver?.user?.firstName} {selectedDriver?.user?.lastName}
                </strong>
              </p>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex justify-between">
                    <span className="font-medium">Category:</span>
                    <span>{formatCategory(form.category)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Duration:</span>
                    <span>{form.durationHours} hours</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Description:</span>
                    <span>{form.description} </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Your Offer:</span>
                    <span className="font-bold">₦{Number(form.amountOffered).toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Address:</span>
                    <span className="text-right">{form.address.substring(0, 60)}{form.address.length > 60 ? '...' : ''}</span>
                  </li>
                </ul>
              </div>

              <div className="text-sm text-gray-600 border-t pt-5">
                <p className="font-semibold mb-3">Important Terms:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Payment will be required after driver acceptance</li>
                  <li>Cancellation after acceptance may incur fees</li>
                  <li>
                    Most importantly, if your offer is below 75% of the suggested amount, your request will be delayed until admin approves it
                  </li>
                  <li>Both parties agree to communicate respectfully</li>
                  <li>Platform fee may apply (shown during payment)</li>
                  <li>By proceeding you agree to our Terms of Service</li>
                </ul>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={actionLoading}
                  className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    if (actionLoading) return;
                    setActionLoading(true);
                    setShowConfirmModal(false);

                    let calculated = 0;
                    const config = pricingConfigs.find(c => c.category === form.category);

                    if (config) {
                      const hours = Number(form.durationHours);
                      if (!isNaN(hours) && hours > 0) {
                        if (hours >= 720) calculated = config.monthlyRate || 0;
                        else if (hours >= 168) calculated = config.weeklyRate || 0;
                        else if (hours >= 24) {
                          const days = Math.ceil(hours / 24);
                          calculated = (config.dailyRate || 0) * days;
                        } else {
                          calculated = (config.hourlyRate || 0) * hours;
                        }
                      }
                    }

                    if (calculated <= 0) {
                      toast.error('Could not calculate suggested amount');
                      setActionLoading(false);
                      return;
                    }

                    const systemAmount = Math.round(calculated);

                    try {
                      await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/hire/request/${selectedDriver?.user.id}`,
                        {
                          driverId: selectedDriver.user?.id,
                          ...form,
                          amount: systemAmount.toString(),
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );

                      toast.success('Hire request sent successfully 🚀');
                      setShowHireModal(false);
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Failed to send request');
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'I Agree – Send Request'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ==================== HIRE HISTORY MODAL ==================== */}
{/* ==================== FULL HIRE HISTORY MODAL ==================== */}
{showHistoryModal && selectedHistoryDriver && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 overflow-y-auto">
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[94vh] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Hire History</h2>
            <p className="text-blue-100 mt-1">
              {selectedHistoryDriver.user?.firstName} {selectedHistoryDriver.user?.lastName}
            </p>

            <p className="text-blue-100 text-sm mt-1 font-medium">
        {driverHistory.filter(h => h.status === 'ended').length} trips completed
      </p>
          </div>
          <button
            onClick={() => setShowHistoryModal(false)}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <X className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {historyLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">Loading hire records...</p>
          </div>
        ) : driverHistory.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="h-20 w-20 mx-auto text-gray-300 mb-4" />
            <p className="text-2xl font-medium text-gray-600">No hire history yet</p>
            <p className="text-gray-500 mt-2">This driver has not been hired yet.</p>
          </div>
        ) : (
          driverHistory.map((hire) => (
            <div
              key={hire._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              {/* Top Row - Status & Date */}
              <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                <div>
                  <div className={`inline-flex px-4 py-1.5 rounded-full text-sm font-semibold ${
                    hire.status === 'ended' ? 'bg-emerald-100 text-emerald-700' :
                    hire.status === 'active' ? 'bg-blue-100 text-blue-700' :
                    hire.status === 'pending' || hire.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {hire.status.replace('_', ' ').toUpperCase()}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Requested: {new Date(hire.requestedAt).toLocaleDateString('en-NG', { 
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Hire Reference</p>
                  <p className="font-mono text-sm font-medium text-gray-700">
                    {hire.hireReference || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    {formatCategory(hire.category)}
                  </h4>
                  <p className="text-gray-600">
                    {hire.durationHours} hours • ₦{Number(hire.amount || hire.amountOffered).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">
                    {hire.client?.firstName} {hire.client?.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Pickup Address</p>
                  <p className="font-medium text-gray-800">{hire.address}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Scheduled Date & Time</p>
                  <p className="font-medium">
                    {hire.date ? new Date(hire.date).toLocaleDateString('en-NG') : 'N/A'} 
                    {hire.time && ` • ${hire.time}`}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Accommodation</p>
                  <p className={`font-medium ${hire.accommodation ? 'text-green-600' : 'text-gray-500'}`}>
                    {hire.accommodation ? '✅ Provided' : '❌ Not Provided'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className={`font-medium capitalize ${
                    hire.paymentStatus === 'success' || hire.paymentStatus === 'paid' 
                      ? 'text-green-600' 
                      : hire.paymentStatus === 'pending' 
                        ? 'text-amber-600' 
                        : 'text-blue-600'
                  }`}>
                    {hire.paymentStatus}
                  </p>
                </div>
              </div>

              {/* Benefits */}
              {hire.benefits && (
                <div className="mt-6 pt-5 border-t">
                  <p className="text-sm text-gray-500 mb-1">Additional Benefits</p>
                  <p className="text-gray-700">{hire.benefits}</p>
                </div>
              )}

              {/* Timeline & Admin Info */}
              <div className="mt-6 pt-5 border-t grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {hire.acceptedAt && (
                  <div>
                    <span className="text-gray-500">Accepted On:</span>
                    <span className="ml-2 font-medium">
                      {new Date(hire.acceptedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {hire.endedAt && (
                  <div>
                    <span className="text-gray-500">Ended On:</span>
                    <span className="ml-2 font-medium">
                      {new Date(hire.endedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {hire.endedEarly && (
                  <div className="col-span-full">
                    <span className="text-blue-600 font-medium">Ended Early</span>
                    {hire.endReason && <p className="text-gray-600 mt-1">{hire.endReason}</p>}
                  </div>
                )}

                {hire.adminApprovedAt && (
                  <div>
                    <span className="text-gray-500">Admin Approved:</span>
                    <span className="ml-2 font-medium">
                      {new Date(hire.adminApprovedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Reference */}
              {hire.paymentReference && (
                <div className="mt-5 pt-4 border-t text-xs">
                  <span className="text-gray-500">Payment Reference: </span>
                  <span className="font-mono text-gray-700">{hire.paymentReference}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t bg-gray-50 rounded-b-3xl">
        <button
          onClick={() => setShowHistoryModal(false)}
          className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-semibold transition"
        >
          Close History
        </button>
      </div>
    </motion.div>
  </div>
)}
    </div>
  );
};

export default DriversList;





















































































































