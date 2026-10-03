// src/components/drivers/HireModal.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Car, Clock, DollarSign, Home, List, MapPin, Loader2, X, User, Users, Truck, Wallet,
  Calendar1, CalendarIcon, Clock1,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Autocomplete } from '@react-google-maps/api';
import CloudinaryUpload from '../../CloudinaryUpload'; // adjust path if needed

// ─── Constants ─────────────────────────────────────────────────────────
// Flat call-out charge (₦). Keep in sync with CALL_OUT_CHARGE in the Hire model.
export const CALL_OUT_CHARGE = 5000;
const MIN_OFFER_RATIO = 0.75;
const AMOUNT_STEP = 500;
const MAX_PASSENGER_PICTURES = 10;

const VEHICLE_TYPES = [
  { value: 'car', label: 'Car' },
  { value: 'suv', label: 'SUV' },
  { value: 'jeep', label: 'Jeep' },
  { value: 'van', label: 'Van' },
  { value: 'minibus', label: 'Minibus' },
  { value: 'bus', label: 'Bus' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'truck', label: 'Truck' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'tricycle', label: 'Tricycle' },
  { value: 'other', label: 'Other (specify)' },
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const MARITAL_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'widowed', label: 'Widowed' },
];

const SELF_OR_OTHERS = [
  { value: 'self', label: 'Me' },
  { value: 'others', label: 'Someone else' },
];

// ─── Pure helpers ──────────────────────────────────────────────────────
const formatCategory = (cat = '') =>
  cat.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

// Tolerant matching: handles invisible characters, spaces and different dash types
const cleanKey = (str) =>
  (str || '')
    .trim()
    .toLowerCase()
    .replace(/[\s\u200B-\u200D\uFEFF\u00A0]+/g, '-')
    .replace(/[-–—−]+/g, '-');

const findPricingConfig = (configs, category) => {
  if (!category || !configs?.length) return null;
  const key = cleanKey(category);
  return configs.find((c) => cleanKey(c.category) === key) || null;
};

const calculateSuggestedAmount = (config, durationHours) => {
  const hours = Number(durationHours);
  if (!config || isNaN(hours) || hours <= 0) return 0;

  let suggested;
  if (hours >= 720) suggested = config.monthlyRate || 0;
  else if (hours >= 168) suggested = config.weeklyRate || 0;
  else if (hours >= 24) suggested = (config.dailyRate || 0) * Math.ceil(hours / 24);
  else suggested = (config.hourlyRate || 0) * hours;

  return Math.round(suggested);
};

const createEmptyHireData = (category = '') => ({
  // Core hire details
  category,
  durationHours: '',
  amountOffered: '',
  address: '',
  description: '',
  date: '',
  time: '',
  accommodation: false,
  benefits: '',

  // Vehicle the client wants driven
  vehicleType: '',
  vehicleTypeOther: '',

  // Client info
  clientInfo: { age: '', gender: '', maritalStatus: '' },

  // Passengers
  passengerInfo: {
    passengerType: '', // 'self' | 'others'
    passengerDetails: '',
    numberOfPassengers: '1',
    pictures: [], // Cloudinary URLs
  },

  // Vehicle ownership
  vehicleInfo: {
    ownership: '', // 'self' | 'others'
    owner: { name: '', relationship: '', contact: '', picture: '' },
    vehiclePicture: '', // Cloudinary URL
  },
});

/** Returns an error message, or null when all required fields are filled in. */
const validateHireData = (v) => {
  if (!v.category || !v.durationHours || !v.amountOffered || !v.address) {
    return 'Please complete all required fields';
  }

  if (!v.vehicleType) return 'Please select the type of vehicle you want the driver to drive';
  if (v.vehicleType === 'other' && !v.vehicleTypeOther.trim()) {
    return 'Please specify the vehicle type';
  }

  const age = Number(v.clientInfo.age);
  if (!Number.isFinite(age) || age < 18 || age > 100) return 'Please enter a valid age (18–100)';
  if (!v.clientInfo.gender) return 'Please select your gender';
  if (!v.clientInfo.maritalStatus) return 'Please select your marital status';

  const p = v.passengerInfo;
  if (!p.passengerType) return 'Please tell us who the driver will be driving';
  if (p.passengerType === 'others' && !p.passengerDetails.trim()) {
    return 'Please specify who the driver will be driving';
  }
  const count = Number(p.numberOfPassengers);
  if (!Number.isInteger(count) || count < 1 || count > 60) {
    return 'Number of passengers must be between 1 and 60';
  }

  const vi = v.vehicleInfo;
  if (!vi.ownership) return 'Please tell us who owns the vehicle';
  if (vi.ownership === 'others') {
    if (!vi.owner.name.trim()) return "Please enter the vehicle owner's name";
    if (!vi.owner.relationship.trim()) return 'Please enter your relationship with the vehicle owner';
    if (!vi.owner.contact.trim()) return "Please enter the vehicle owner's contact";
  }
  return null;
};

/** Shapes the form state into the request body (images are Cloudinary URL strings). */
const buildHirePayload = (v) => {
  const { passengerInfo: p, vehicleInfo: vi } = v;
  return {
    category: v.category,
    durationHours: v.durationHours,
    amountOffered: v.amountOffered,
    address: v.address,
    description: v.description,
    date: v.date,
    time: v.time,
    accommodation: v.accommodation,
    benefits: v.benefits,

    vehicleType: v.vehicleType,
    vehicleTypeOther: v.vehicleType === 'other' ? v.vehicleTypeOther.trim() : undefined,
    clientInfo: {
      age: Number(v.clientInfo.age),
      gender: v.clientInfo.gender,
      maritalStatus: v.clientInfo.maritalStatus,
    },
    passengerInfo: {
      passengerType: p.passengerType,
      passengerDetails: p.passengerType === 'others' ? p.passengerDetails.trim() : undefined,
      numberOfPassengers: Number(p.numberOfPassengers),
      pictures: p.pictures,
    },
    vehicleInfo: {
      ownership: vi.ownership,
      owner:
        vi.ownership === 'others'
          ? {
              name: vi.owner.name.trim(),
              relationship: vi.owner.relationship.trim(),
              contact: vi.owner.contact.trim(),
              picture: vi.owner.picture || undefined,
            }
          : undefined,
      vehiclePicture: vi.vehiclePicture || undefined,
    },
  };
};

// ─── Small UI pieces ───────────────────────────────────────────────────
const inputClass =
  'w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition text-base bg-white';

// Top-level field label (matches the original hire modal style)
const BaseLabel = ({ icon: Icon, children }) => (
  <label className="block text-lg font-semibold mb-3 flex items-center gap-2">
    {Icon && <Icon className="h-6 w-6 text-blue-600" />}
    {children}
  </label>
);

// Label used inside the grouped sections
const Field = ({ label, optional, children }) => (
  <div>
    <label className="block text-base font-semibold mb-2 text-gray-800">
      {label}
      {optional && <span className="ml-2 text-sm font-normal text-gray-400">(optional)</span>}
    </label>
    {children}
  </div>
);

const Section = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-5 bg-gray-50/50">
    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
      <Icon className="h-5 w-5 text-blue-600" />
      {title}
    </h3>
    {children}
  </div>
);

const ChoiceButtons = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-3">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        aria-pressed={value === o.value}
        className={`px-5 py-3 rounded-xl border-2 text-sm sm:text-base transition-all ${
          value === o.value
            ? 'border-blue-500 bg-blue-50 font-semibold text-blue-800'
            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const ImageThumb = ({ url, onRemove, alt }) => (
  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-white shrink-0">
    <img src={url} alt={alt} className="w-full h-full object-cover" />
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-black/90 transition"
      aria-label="Remove image"
    >
      <X size={14} />
    </button>
  </div>
);

// One image: uploader until a URL exists, then a removable thumbnail
const SingleImageField = ({ label, value, onChange, folder }) => (
  <Field label={label} optional>
    {value ? (
      <ImageThumb url={value} alt={label} onRemove={() => onChange('')} />
    ) : (
      <CloudinaryUpload
        label=""
        folder={folder}
        accept="image/*"
        maxSizeMB={5}
        onUploadComplete={(url) => onChange(url)}
      />
    )}
  </Field>
);

// Several images: thumbnails + an uploader that resets after every upload
const MultiImageField = ({ label, values, onChange, folder, max }) => (
  <Field label={label} optional>
    {values.length > 0 && (
      <div className="flex flex-wrap gap-3 mb-3">
        {values.map((url) => (
          <ImageThumb
            key={url}
            url={url}
            alt={label}
            onRemove={() => onChange((prev) => prev.filter((u) => u !== url))}
          />
        ))}
      </div>
    )}
    {values.length < max ? (
      <CloudinaryUpload
        key={values.length}
        label=""
        folder={folder}
        accept="image/*"
        maxSizeMB={5}
        onUploadComplete={(url) => onChange((prev) => [...prev, url])}
      />
    ) : (
      <p className="text-sm text-gray-500">Maximum of {max} pictures reached.</p>
    )}
  </Field>
);

// ─── Main component ────────────────────────────────────────────────────
/**
 * The complete hire flow in one component: form, extra details,
 * confirmation step and request submission.
 *
 * Render it only while the modal is open, e.g.
 *   {showHireModal && selectedDriver && <HireModal ... />}
 */
const HireModal = ({
  driver,
  token,
  onClose,
  onSuccess = () => {},
  pricingConfigs = [],
  driverCategories = [],
  initialCategory = '',
  isLoaded = false, // Google Maps script loaded?
}) => {
  const [data, setData] = useState(() => createEmptyHireData(initialCategory));
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const autocompleteRef = useRef(null);

  // ── Updaters (functional, so async upload callbacks never use stale state) ──
  const set = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const setNested = (key, patch) =>
    setData((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...(typeof patch === 'function' ? patch(prev[key]) : patch) },
    }));
  const setOwner = (patch) =>
    setData((prev) => ({
      ...prev,
      vehicleInfo: {
        ...prev.vehicleInfo,
        owner: { ...prev.vehicleInfo.owner, ...patch },
      },
    }));

  // ── Pricing (derived from category + duration) ──
  const pricing = useMemo(
    () => findPricingConfig(pricingConfigs, data.category),
    [pricingConfigs, data.category]
  );
  const calculatedAmount = useMemo(
    () => calculateSuggestedAmount(pricing, data.durationHours),
    [pricing, data.durationHours]
  );

  // Keep the offer in sync with the suggested amount when category/duration change
  useEffect(() => {
    let next;
    if (!data.category || !pricing) next = '';
    else if (calculatedAmount > 0) next = String(calculatedAmount);
    else return;

    setData((prev) => (prev.amountOffered === next ? prev : { ...prev, amountOffered: next }));
  }, [data.category, pricing, calculatedAmount]);

  // ── Offer handling: minimum is 75% of the suggested amount ──
  const minAllowed = calculatedAmount * MIN_OFFER_RATIO;

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (calculatedAmount > 0 && Number(value) > 0 && Number(value) < minAllowed) {
      toast.error(
        `Your offer must be at least 75% of the suggested amount (₦${Math.round(minAllowed).toLocaleString()}). ` +
          `This helps ensure fair compensation for drivers while still giving you flexibility.`
      );
      return; // block input below the minimum
    }
    set({ amountOffered: value });
  };

  const handleAmountKeyDown = (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();

    const current = Number(data.amountOffered) || calculatedAmount || 0;
    const newValue =
      e.key === 'ArrowUp' ? current + AMOUNT_STEP : Math.max(0, current - AMOUNT_STEP);

    if (calculatedAmount > 0 && newValue < minAllowed) {
      toast.error(
        `Amount cannot go below 75% of suggested price (₦${Math.round(minAllowed).toLocaleString()}).`
      );
      return;
    }
    set({ amountOffered: newValue.toString() });
  };

  // ── Address autocomplete ──
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const picked = place?.formatted_address || place?.name;
    if (picked) set({ address: picked });
  };

  // ── Flow ──
  const handleProceed = () => {
    const error = validateHireData(data);
    if (error) {
      toast.error(error);
      return;
    }
    setShowConfirm(true);
  };

  const handleSend = async () => {
    if (submitting) return;

    if (calculatedAmount <= 0) {
      toast.error('Could not calculate suggested amount');
      setShowConfirm(false);
      return;
    }

    setSubmitting(true);
    setShowConfirm(false);

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire/request/${driver.user?.id}`,
        {
          driverId: driver.user?.id,
          ...buildHirePayload(data),
          amount: calculatedAmount.toString(), // system suggested amount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Hire request sent successfully 🚀');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
      setSubmitting(false);
    }
  };

  const { clientInfo, passengerInfo, vehicleInfo } = data;
  const offered = Number(data.amountOffered) || 0;
  const vehicleLabel = data.vehicleType === 'other' ? data.vehicleTypeOther : data.vehicleType;

  const addressInput = (
    <input
      type="text"
      placeholder="Enter pickup address"
      className={inputClass}
      value={data.address}
      onChange={(e) => set({ address: e.target.value })}
      required
    />
  );

  return (
    <>
      {/* ═════════════ HIRE FORM MODAL ═════════════ */}
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <h2 className="text-3xl font-bold text-center mb-8">
            Hire {driver.user?.firstName} {driver.user?.lastName}
          </h2>

          <div className="space-y-6">
            {/* Category */}
            <div>
              <BaseLabel icon={List}>Service Category</BaseLabel>
              <select
                value={data.category}
                onChange={(e) => set({ category: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Select service type...</option>
                {driverCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {formatCategory(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Category price grid */}
            {pricing ? (
              <div className="mt-5 p-6 bg-white rounded-2xl shadow-md border border-blue-100">
                <h4 className="text-lg font-bold text-blue-700 mb-5 text-center">
                  Current Rates – {formatCategory(data.category)}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl">
                    <Clock className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="text-xs text-gray-600">per hour</span>
                    <span className="text-xl font-bold text-blue-800 mt-1">
                      ₦{(pricing.hourlyRate || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl">
                    <CalendarIcon className="h-6 w-6 text-green-600 mb-2" />
                    <span className="text-xs text-gray-600">per day</span>
                    <span className="text-xl font-bold text-green-800 mt-1">
                      ₦{(pricing.dailyRate || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl">
                    <CalendarIcon className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="text-xs text-gray-600">per week</span>
                    <span className="text-xl font-bold text-blue-800 mt-1">
                      ₦{(pricing.weeklyRate || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-amber-50 rounded-xl">
                    <CalendarIcon className="h-6 w-6 text-amber-600 mb-2" />
                    <span className="text-xs text-gray-600">per month</span>
                    <span className="text-xl font-bold text-amber-800 mt-1">
                      ₦{(pricing.monthlyRate || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <h4 className="pt-5 ml-5 font-bold text-black">
                  call out charge:
                  <span className="text-blue-600 pl-2 text-2xl">
                    ₦{CALL_OUT_CHARGE.toLocaleString()}
                  </span>
                </h4>

                {pricing.description && (
                  <p className="mt-4 text-sm text-gray-600 text-center italic">{pricing.description}</p>
                )}
              </div>
            ) : data.category ? (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm text-center">
                No pricing found for "{data.category}"
              </div>
            ) : null}

            {/* Duration */}
            <div>
              <BaseLabel icon={Clock}>Duration (hours)</BaseLabel>
              <input
                type="number"
                value={data.durationHours}
                onChange={(e) => set({ durationHours: e.target.value })}
                className={inputClass}
                placeholder="e.g. 4"
                min="1"
                required
              />
            </div>

            {/* Negotiate */}
            <div>
              <BaseLabel icon={DollarSign}>Negotiate (₦)</BaseLabel>
              <input
                type="number"
                value={data.amountOffered}
                onChange={handleAmountChange}
                onKeyDown={handleAmountKeyDown}
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition text-base"
                placeholder="Enter your offer"
                min="1000"
                step={AMOUNT_STEP}
                required
              />
              {calculatedAmount > 0 && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Suggested amount:{' '}
                  <strong className="text-green-800 text-3xl">₦{calculatedAmount.toLocaleString()}</strong>
                  <br />
                  You can adjust using ↑ / ↓ arrow keys (changes by ₦{AMOUNT_STEP}). Your final offer must be at
                  least 75% of the suggested amount to ensure fair driver compensation.
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <BaseLabel icon={MapPin}>Pickup Address</BaseLabel>
              {isLoaded ? (
                <Autocomplete
                  onLoad={(ac) => {
                    autocompleteRef.current = ac;
                  }}
                  onPlaceChanged={handlePlaceChanged}
                  options={{
                    types: ['geocode'],
                    componentRestrictions: { country: 'ng' },
                  }}
                >
                  {addressInput}
                </Autocomplete>
              ) : (
                addressInput
              )}
            </div>

            {/* Description */}
            <div>
              <BaseLabel icon={Calendar1}>Description (Why do you want to hire a driver)</BaseLabel>
              <input
                type="text"
                value={data.description}
                onChange={(e) => set({ description: e.target.value })}
                className={inputClass}
                placeholder="e.g. Airport pickup and a day of meetings"
                required
              />
            </div>

            {/* Date */}
            <div>
              <BaseLabel icon={Calendar1}>Date</BaseLabel>
              <input
                type="date"
                value={data.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => set({ date: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            {/* Time */}
            <div>
              <BaseLabel icon={Clock1}>Time</BaseLabel>
              <input
                type="time"
                value={data.time}
                onChange={(e) => set({ time: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            {/* ── Vehicle wanted ── */}
            <Section icon={Car} title="Vehicle You Want Driven">
              <Field label="Type of vehicle">
                <select
                  value={data.vehicleType}
                  onChange={(e) => set({ vehicleType: e.target.value })}
                  className={inputClass}
                  required
                >
                  <option value="">Select vehicle type...</option>
                  {VEHICLE_TYPES.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </Field>

              {data.vehicleType === 'other' && (
                <Field label="Specify vehicle type">
                  <input
                    type="text"
                    value={data.vehicleTypeOther}
                    onChange={(e) => set({ vehicleTypeOther: e.target.value })}
                    maxLength={100}
                    className={inputClass}
                    placeholder="e.g. Hearse, Ambulance, Crane"
                  />
                </Field>
              )}
            </Section>

            {/* ── About the client ── */}
            <Section icon={User} title="About You">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Age">
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={clientInfo.age}
                    onChange={(e) => setNested('clientInfo', { age: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 35"
                  />
                </Field>
                <Field label="Marital status">
                  <select
                    value={clientInfo.maritalStatus}
                    onChange={(e) => setNested('clientInfo', { maritalStatus: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    {MARITAL_STATUSES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Gender">
                <ChoiceButtons
                  options={GENDERS}
                  value={clientInfo.gender}
                  onChange={(v) => setNested('clientInfo', { gender: v })}
                />
              </Field>
            </Section>

            {/* ── Passengers ── */}
            <Section icon={Users} title="Passenger Information">
              <Field label="Who will the driver be driving?">
                <ChoiceButtons
                  options={SELF_OR_OTHERS}
                  value={passengerInfo.passengerType}
                  onChange={(v) => setNested('passengerInfo', { passengerType: v })}
                />
              </Field>

              {passengerInfo.passengerType === 'others' && (
                <Field label="Specify who">
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={passengerInfo.passengerDetails}
                    onChange={(e) => setNested('passengerInfo', { passengerDetails: e.target.value })}
                    className={`${inputClass} resize-none`}
                    placeholder="e.g. My wife and two children, my boss, my elderly mother"
                  />
                </Field>
              )}

              <Field label="Number of passengers">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={passengerInfo.numberOfPassengers}
                  onChange={(e) => setNested('passengerInfo', { numberOfPassengers: e.target.value })}
                  className={`${inputClass} max-w-xs`}
                />
              </Field>

              <MultiImageField
                label="Pictures of the passengers"
                values={passengerInfo.pictures}
                onChange={(next) =>
                  setNested('passengerInfo', (cur) => ({
                    pictures: typeof next === 'function' ? next(cur.pictures) : next,
                  }))
                }
                folder="hire/passengers"
                max={MAX_PASSENGER_PICTURES}
              />
            </Section>

            {/* ── Vehicle ownership ── */}
            <Section icon={Truck} title="Vehicle Information">
              <Field label="Who owns the vehicle?">
                <ChoiceButtons
                  options={SELF_OR_OTHERS}
                  value={vehicleInfo.ownership}
                  onChange={(v) => setNested('vehicleInfo', { ownership: v })}
                />
              </Field>

              {vehicleInfo.ownership === 'others' && (
                <div className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
                  <p className="text-sm font-semibold text-blue-800">Vehicle owner's details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Owner's name">
                      <input
                        type="text"
                        maxLength={100}
                        value={vehicleInfo.owner.name}
                        onChange={(e) => setOwner({ name: e.target.value })}
                        className={inputClass}
                        placeholder="Full name"
                      />
                    </Field>
                    <Field label="Your relationship with the owner">
                      <input
                        type="text"
                        maxLength={100}
                        value={vehicleInfo.owner.relationship}
                        onChange={(e) => setOwner({ relationship: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Brother, employer, friend"
                      />
                    </Field>
                    <Field label="Owner's phone number">
                      <input
                        type="tel"
                        maxLength={30}
                        value={vehicleInfo.owner.contact}
                        onChange={(e) => setOwner({ contact: e.target.value })}
                        className={inputClass}
                        placeholder="08012345678"
                      />
                    </Field>
                  </div>

                  <SingleImageField
                    label="Owner's picture"
                    value={vehicleInfo.owner.picture}
                    onChange={(url) => setOwner({ picture: url })}
                    folder="hire/owners"
                  />
                </div>
              )}

              <SingleImageField
                label="Picture of the vehicle"
                value={vehicleInfo.vehiclePicture}
                onChange={(url) => setNested('vehicleInfo', { vehiclePicture: url })}
                folder="hire/vehicles"
              />
            </Section>

            {/* Accommodation */}
            <div className="flex items-center gap-4 py-4">
              <input
                type="checkbox"
                id="accommodation"
                checked={data.accommodation}
                onChange={(e) => set({ accommodation: e.target.checked })}
                className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="accommodation" className="text-lg font-medium flex items-center gap-3 cursor-pointer">
                <Home className="h-6 w-6 text-blue-600" />
                Provide Accommodation
              </label>
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-lg font-semibold mb-3">Additional Benefits (optional)</label>
              <textarea
                value={data.benefits}
                onChange={(e) => set({ benefits: e.target.value })}
                rows="4"
                className={inputClass}
                placeholder="Meals, fuel allowance, weekend off, etc."
              />
            </div>

            {/* Call-out charge */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
              <Wallet className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">
                  Call-out charge: ₦{CALL_OUT_CHARGE.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  A flat call-out charge applies to every hire and is added to the amount you offer.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              disabled={submitting}
              className="w-full py-6 bg-gradient-to-r from-green-600 to-teal-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Send Request'
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* ═════════════ CONFIRM MODAL ═════════════ */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
          >
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-2xl font-bold text-center mb-6">Confirm Hire Request</h3>

            <div className="space-y-6">
              <p className="text-center text-gray-700">
                You are about to send a hire request to{' '}
                <strong className="text-gray-900">
                  {driver.user?.firstName} {driver.user?.lastName}
                </strong>
              </p>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex justify-between gap-4">
                    <span className="font-medium">Category:</span>
                    <span>{formatCategory(data.category)}</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="font-medium">Duration:</span>
                    <span>{data.durationHours} hours</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="font-medium">Description:</span>
                    <span className="text-right">{data.description}</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="font-medium">Vehicle:</span>
                    <span className="capitalize">{vehicleLabel}</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="font-medium">Passengers:</span>
                    <span>
                      {passengerInfo.numberOfPassengers} (
                      {passengerInfo.passengerType === 'self' ? 'Me' : 'Someone else'})
                    </span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="font-medium">Vehicle owner:</span>
                    <span>
                      {vehicleInfo.ownership === 'self' ? 'Me' : vehicleInfo.owner.name || 'Someone else'}
                    </span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="font-medium">Address:</span>
                    <span className="text-right">
                      {data.address.substring(0, 60)}
                      {data.address.length > 60 ? '...' : ''}
                    </span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="font-medium">Your Offer:</span>
                    <span className="font-bold">₦{offered.toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="font-medium">Call-out charge:</span>
                    <span className="font-bold">₦{CALL_OUT_CHARGE.toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between gap-4 pt-3 border-t border-gray-200">
                    <span className="font-semibold">Estimated total:</span>
                    <span className="font-bold text-lg text-gray-900">
                      ₦{(offered + CALL_OUT_CHARGE).toLocaleString()}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="text-sm text-gray-600 border-t pt-5">
                <p className="font-semibold mb-3">Important Terms:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Payment will be required after driver acceptance</li>
                  <li>A flat call-out charge of ₦{CALL_OUT_CHARGE.toLocaleString()} applies to every hire</li>
                  <li>Cancellation after acceptance may incur fees</li>
                  <li>
                    Most importantly, if your offer is below 75% of the suggested amount, your request will be
                    delayed until admin approves it
                  </li>
                  <li>Both parties agree to communicate respectfully</li>
                  <li>Platform fee may apply (shown during payment)</li>
                  <li>By proceeding you agree to our Terms of Service</li>
                </ul>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={submitting}
                  className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={submitting}
                  className="flex-1 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
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
    </>
  );
};

export default HireModal;