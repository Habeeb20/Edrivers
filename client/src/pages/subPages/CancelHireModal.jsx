// // src/pages/Driver/CancelHireModal.jsx
// import React, { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'sonner';
// import { motion } from 'framer-motion';
// import { Ban, Loader2 } from 'lucide-react';

// const MIN_REASON_LENGTH = 5;
// const MAX_REASON_LENGTH = 500;

// /**
//  * Lets the driver cancel a hire with a required reason.
//  * Render only while open: {showCancelModal && selectedRequest && <CancelHireModal ... />}
//  */
// const CancelHireModal = ({ hire, token, onClose, onCancelled = () => {} }) => {
//   const [reason, setReason] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const trimmed = reason.trim();
//   const isValid = trimmed.length >= MIN_REASON_LENGTH;

//   const handleCancel = async () => {
//     if (submitting) return;

//     if (!isValid) {
//       toast.error(`Please give a reason (at least ${MIN_REASON_LENGTH} characters)`);
//       return;
//     }

//     setSubmitting(true);
//     try {
//       await axios.put(
//         `${import.meta.env.VITE_BACKEND_URL}/api/hire/cancel/${hire._id}`,
//         { reason: trimmed },
//         { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
//       );
//       toast.success('Hire cancelled');
//       onCancelled();
//       onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to cancel hire');
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//       <motion.div
//         initial={{ scale: 0.96, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full"
//       >
//         <div className="flex items-center gap-3 mb-1">
//           <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
//             <Ban className="h-5 w-5 text-red-600" />
//           </div>
//           <h3 className="text-xl font-bold text-gray-900">Cancel this hire?</h3>
//         </div>

//         <p className="text-sm text-gray-500 mb-5">
//           {hire.client?.firstName} {hire.client?.lastName} will be notified with your reason. Use{' '}
//           <strong className="font-semibold text-gray-700">End Hire</strong> instead if the job was completed.
//         </p>

//         <label className="block text-sm font-semibold text-gray-700 mb-2">
//           Reason for cancelling <span className="text-red-500">*</span>
//         </label>
//         <textarea
//           value={reason}
//           onChange={(e) => setReason(e.target.value)}
//           maxLength={MAX_REASON_LENGTH}
//           rows={4}
//           placeholder="e.g. Vehicle breakdown, emergency, schedule conflict..."
//           className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none resize-none"
//         />
//         <p className="text-xs text-gray-400 mt-1.5 mb-5 text-right">
//           {reason.length}/{MAX_REASON_LENGTH}
//         </p>

//         <div className="flex gap-3">
//           <button
//             type="button"
//             onClick={onClose}
//             disabled={submitting}
//             className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm text-gray-700 transition-colors disabled:opacity-50"
//           >
//             Keep hire
//           </button>
//           <button
//             type="button"
//             onClick={handleCancel}
//             disabled={submitting || !isValid}
//             className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
//           >
//             {submitting ? (
//               <>
//                 <Loader2 className="h-4 w-4 animate-spin" /> Cancelling...
//               </>
//             ) : (
//               'Cancel hire'
//             )}
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default CancelHireModal;




// src/pages/Driver/CancelHireModal.jsx  (shared by driver and client screens)
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Ban, Loader2 } from 'lucide-react';

const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 500;

// Keep in sync with CANCELLABLE_STATUSES in the backend cancelHire controller
const DRIVER_CANCELLABLE = ['accepted', 'awaiting_admin_approval', 'active'];
const CLIENT_CANCELLABLE = ['pending', 'pending_approval', 'awaiting_admin_approval', 'accepted'];

export const canCancelHire = (status, role = 'driver') =>
  (role === 'client' ? CLIENT_CANCELLABLE : DRIVER_CANCELLABLE).includes(status);

/**
 * Cancel a hire with a required reason.
 * Render only while open: {show && selected && <CancelHireModal ... />}
 *
 * role: 'driver' | 'client'  (whoever is cancelling)
 */
const CancelHireModal = ({ hire, token, role = 'driver', onClose, onCancelled = () => {} }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const trimmed = reason.trim();
  const isValid = trimmed.length >= MIN_REASON_LENGTH;

  // The person who will be notified
  const other = role === 'client' ? hire.driver : hire.client;
  const otherName = [other?.firstName, other?.lastName].filter(Boolean).join(' ') || 'The other party';

  const handleCancel = async () => {
    if (submitting) return;

    if (!isValid) {
      toast.error(`Please give a reason (at least ${MIN_REASON_LENGTH} characters)`);
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire/cancel/${hire._id}`,
        { reason: trimmed },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      toast.success('Hire cancelled');
      onCancelled();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel hire');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Ban className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Cancel this hire?</h3>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          {otherName} will be notified with your reason.
          {role === 'driver' && (
            <>
              {' '}Use <strong className="font-semibold text-gray-700">End Hire</strong> instead if the job was
              completed.
            </>
          )}
        </p>

        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Reason for cancelling <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={MAX_REASON_LENGTH}
          rows={4}
          placeholder={
            role === 'client'
              ? 'e.g. Change of plans, found another driver, trip postponed...'
              : 'e.g. Vehicle breakdown, emergency, schedule conflict...'
          }
          className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none resize-none"
        />
        <p className="text-xs text-gray-400 mt-1.5 mb-5 text-right">
          {reason.length}/{MAX_REASON_LENGTH}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm text-gray-700 transition-colors disabled:opacity-50"
          >
            Keep hire
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting || !isValid}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Cancelling...
              </>
            ) : (
              'Cancel hire'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CancelHireModal;