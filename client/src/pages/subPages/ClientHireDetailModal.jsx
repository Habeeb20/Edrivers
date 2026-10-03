











// src/pages/Client/ClientHireDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  X, MapPin, Languages, Globe, Calendar, Wallet, Car, Phone, Mail, Star,
  CheckCircle, Ban, Clock, DollarSign, Home, Loader2, ClipboardList,
} from 'lucide-react';

import DriverProfileDetails from "./DriverProfileModalDetail"
// Adjust these paths to match your project structur
import HireRequestDetails from './HireRequestDetails';
import CancelHireModal, { canCancelHire } from './CancelHireModal';

const getInitials = (first = '', last = '') => `${first[0] || ''}${last[0] || ''}`.toUpperCase() || '?';

const formatCategory = (cat = '') =>
  cat.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

const Card = ({ icon: Icon, iconColor = 'text-blue-600', title, children }) => (
  <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100">
    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-900">
      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} /> {title}
    </h3>
    <div className="space-y-1.5 text-sm text-gray-700">{children}</div>
  </div>
);

const Row = ({ label, value, children }) => (
  <p>
    <span className="text-gray-500">{label}: </span>
    {children ?? (value || <span className="text-gray-400">Not provided</span>)}
  </p>
);

/**
 * Everything a client needs to see about a hire, for every status:
 * the driver (account + full profile), the booking, the extra hire data,
 * the timeline, and a Cancel button when cancelling is allowed.
 *
 * Render only while open:
 *   {showDetails && selectedHire && <ClientHireDetailsModal ... />}
 */
const ClientHireDetailsModal = ({
  hire,
  token,
  meta = { label: '', bg: 'bg-gray-100', text: 'text-gray-600' },
  rating, // optional { averageRating, totalRatings }
  onClose,
  onCancelled = () => {},
}) => {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);

  const driver = hire.driver || {};
  const showContact = ['active', 'ended'].includes(hire.status);
  const cancellable = canCancelHire(hire.status, 'client');

  // Load the driver's full profile
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!driver._id) {
        setProfileLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/driver/profile/${driver._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!cancelled && res.data?.success) setProfile(res.data.profile);
      } catch (err) {
        console.error('Failed to load driver profile:', err);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [driver._id, token]);

  const location = [driver.lga, driver.state].filter(Boolean).join(', ');
  const avg = rating?.averageRating ?? 0;
  const count = rating?.totalRatings ?? 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-md hover:bg-white transition"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>

        {/* ===== Hero ===== */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 pt-10 pb-14 sm:rounded-t-3xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
          <div className="relative text-center">
            {driver.avatar ? (
              <img
                src={driver.avatar}
                alt=""
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto border-4 border-white/80 shadow-xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto border-4 border-white/80 shadow-xl bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
                {getInitials(driver.firstName, driver.lastName)}
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-white">
              {driver.firstName} {driver.lastName}
            </h2>

            {location && (
              <p className="flex items-center justify-center gap-1.5 text-white/80 text-sm mt-1">
                <MapPin className="h-4 w-4" /> {location}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${meta.bg} ${meta.text}`}>
                {meta.label}
              </span>
              {driver.isCertified && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">
                  Certified
                </span>
              )}
              {count > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-white/15 text-white">
                  <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
                  {avg.toFixed(1)} ({count})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ===== Content ===== */}
        <div className="p-4 sm:p-8 space-y-5">
          {/* Contact */}
          <Card icon={Phone} iconColor="text-emerald-600" title="Contact">
            {showContact ? (
              <>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  {driver.phone ? (
                    <a href={`tel:${driver.phone}`} className="text-blue-600 hover:underline">
                      {driver.phone}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
                <p className="flex items-center gap-2 break-all">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  {driver.email || 'Not provided'}
                </p>
              </>
            ) : (
              <p className="text-gray-400">Contact details are shared once the hire is active.</p>
            )}
          </Card>

          {/* Driver profile */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">Driver Profile</h3>

            {profileLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : profile ? (
              <div className="space-y-5">
                {/* Quick facts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Card icon={Calendar} iconColor="text-blue-600" title="Experience">
                    <p>{profile.yearsOfExperience ?? 'N/A'} years of professional driving</p>
                    <p className="flex items-center gap-1.5">
                      {profile.isAvailable ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-600" /> Available for hire
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-gray-400" /> Currently unavailable
                        </>
                      )}
                    </p>
                  </Card>

                  <Card icon={Languages} iconColor="text-teal-600" title="Languages Spoken">
                    <p>
                      {profile.languagesSpoken?.length > 0
                        ? profile.languagesSpoken.join(', ')
                        : 'Not specified'}
                    </p>
                  </Card>

                  <Card icon={Globe} iconColor="text-indigo-600" title="Travel Capabilities">
                    <p className="flex items-center gap-2">
                      {profile.travelCapabilities?.interstate ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <X className="h-4 w-4 text-blue-400" />
                      )}
                      Interstate
                    </p>
                    <p className="flex items-center gap-2">
                      {profile.travelCapabilities?.international ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <X className="h-4 w-4 text-blue-400" />
                      )}
                      International
                    </p>
                    {profile.travelCapabilities?.travelNotes && (
                      <p className="text-xs italic text-gray-500 pt-2 mt-1 border-t border-gray-200">
                        {profile.travelCapabilities.travelNotes}
                      </p>
                    )}
                  </Card>

                  {profile.expectedEarnings && (
                    <Card icon={Wallet} iconColor="text-green-600" title="Expected Earnings">
                      <p className="text-base font-bold text-emerald-700">
                        ₦{profile.expectedEarnings.min?.toLocaleString() || 'N/A'} – ₦
                        {profile.expectedEarnings.max?.toLocaleString() || 'N/A'}
                        <span className="text-xs font-normal text-gray-500"> /month</span>
                      </p>
                      {profile.expectedEarnings.note && (
                        <p className="text-xs text-gray-500">{profile.expectedEarnings.note}</p>
                      )}
                    </Card>
                  )}
                </div>

                {/* Account vehicle */}
                {driver.vehicle && (
                  <Card icon={Car} iconColor="text-blue-600" title="Driver's Own Vehicle">
                    <Row label="Make/Model" value={`${driver.vehicle.make || ''} ${driver.vehicle.model || ''}`.trim()} />
                    <Row label="Year" value={driver.vehicle.year} />
                    <Row label="Color" value={driver.vehicle.color} />
                    <Row label="Plate" value={driver.vehicle.licensePlate} />
                    <Row
                      label="Capacity"
                      value={driver.vehicle.capacity ? `${driver.vehicle.capacity} passengers` : null}
                    />
                  </Card>
                )}

                {profile.bio && (
                  <Card icon={ClipboardList} iconColor="text-gray-500" title="About">
                    <p className="leading-relaxed whitespace-pre-line">{profile.bio}</p>
                  </Card>
                )}

                {/* Specialties, transmission, vehicles, states, personal, education, lifestyle, references, background */}
                <DriverProfileDetails profile={profile} />
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                This driver hasn't completed their professional profile yet.
              </p>
            )}
          </div>

          {/* Booking */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">Your Booking</h3>
            <div className="space-y-4">
              <Card icon={ClipboardList} iconColor="text-blue-600" title="Booking">
                <Row label="Service" value={formatCategory(hire.category)} />
                <Row label="Duration" value={`${hire.durationHours} hours`} />
                <Row label="Pickup address" value={hire.address} />
                <Row
                  label="Date & time"
                  value={
                    hire.date || hire.time
                      ? `${hire.date ? new Date(hire.date).toLocaleDateString('en-NG') : ''} ${hire.time || ''}`.trim()
                      : null
                  }
                />
                {hire.description && <Row label="Description" value={hire.description} />}
                <p className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-400 shrink-0" />
                  Accommodation: {hire.accommodation ? 'Provided' : 'Not provided'}
                </p>
                {hire.benefits && <Row label="Benefits" value={hire.benefits} />}
                {hire.amount != null && hire.status === 'pending_approval' && (
                  <p className="flex items-center gap-2 text-amber-700">
                    <DollarSign className="h-4 w-4 shrink-0" />
                    Suggested amount was ₦{Number(hire.amount).toLocaleString()}
                  </p>
                )}
                {hire.endReason && (
                  <p className="text-red-600">
                    <span className="font-medium">Ended because: </span>
                    {hire.endReason}
                  </p>
                )}
              </Card>

              {/* Pricing, vehicle wanted, you, passengers, ownership, timeline, cancellation */}
              <HireRequestDetails hire={hire} viewer="client" />
            </div>
          </div>
        </div>

        {/* ===== Sticky footer ===== */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 p-4 sm:p-6 flex gap-3">
          {cancellable && (
            <button
              type="button"
              onClick={() => setShowCancel(true)}
              className="flex-1 py-3.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Ban className="h-4 w-4" /> Cancel hire
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>

      {showCancel && (
        <CancelHireModal
          hire={hire}
          role="client"
          token={token}
          onClose={() => setShowCancel(false)}
          onCancelled={() => {
            onCancelled();
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default ClientHireDetailsModal;