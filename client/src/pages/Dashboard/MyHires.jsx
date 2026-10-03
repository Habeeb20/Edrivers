/* eslint-disable no-unused-vars */
// src/pages/Driver/MyHires.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  CheckCircle, XCircle, Clock, DollarSign, MapPin, User, Phone, Mail, Home,Ban,
  Eye, X, Star, MessageSquare, Send, Paperclip, Flag, ShieldAlert, Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import HireRequestDetails from "../subPages/HireRequestDetails"
import CancelHireModal from "../subPages/CancelHireModal"

import WhatsAppButton from '../subPages/whatsappButton';

const STATUS_META = {
  pending:                 { label: 'Pending',           bg: 'bg-amber-100',   text: 'text-amber-800' },
  pending_approval:        { label: 'Pending Approval',  bg: 'bg-amber-100',   text: 'text-amber-800' },
  awaiting_admin_approval: { label: 'Awaiting Admin',     bg: 'bg-orange-100',  text: 'text-orange-800' },
  accepted:                { label: 'Accepted',          bg: 'bg-blue-100',    text: 'text-blue-800' },
  active:                  { label: 'Active',             bg: 'bg-emerald-100', text: 'text-emerald-800' },
  ended:                   { label: 'Ended',              bg: 'bg-gray-100',    text: 'text-gray-600' },
  declined:                { label: 'Declined',           bg: 'bg-red-100',     text: 'text-red-700' },
  cancelled:               { label: 'Cancelled',          bg: 'bg-red-100',     text: 'text-red-700' },
  rejected:                { label: 'Rejected',           bg: 'bg-red-100',     text: 'text-red-700' },
  
};

const REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'no_show', label: 'No-show' },
  { value: 'unsafe_behavior', label: 'Unsafe behavior' },
  { value: 'payment_issue', label: 'Payment issue' },
  { value: 'inappropriate_conduct', label: 'Inappropriate conduct' },
  { value: 'fraud', label: 'Fraud / scam' },
  { value: 'other', label: 'Other' },
];



const getInitials = (first = '', last = '') => `${first[0] || ''}${last[0] || ''}`.toUpperCase() || '?';

const MyHires = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [endReason, setEndReason] = useState('');
  const [ratingForm, setRatingForm] = useState({ rating: 5, review: '', comment: '' });
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: 'no_show', details: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Chat
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId') || localStorage.getItem('_id') || '';

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  };

  const [ratedRequestIds, setRatedRequestIds] = useState(() => {
  try {
    const stored = localStorage.getItem('ratedHireIds');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
});

  useEffect(() => {
    if (!token) {
      toast.error('Please log in again');
      return;
    }
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hire/my-requests`, axiosConfig);
      setRequests(res.data.requests || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load hire requests');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, action) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/hire/${action}/${requestId}`, {}, axiosConfig);
      toast.success(`Hire ${action === 'accept' ? 'accepted' : 'declined'} successfully!`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleEndHire = async () => {
    if (!selectedRequest) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire/end/${selectedRequest._id}`,
        { endReason },
        axiosConfig
      );
      toast.success('Hire ended successfully');
      setShowEndModal(false);
      setEndReason('');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to end hire');
    }
  };

  // const handleRating = async () => {
  //   try {
  //     await axios.post(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/hire/rate`,
  //       { hireId: selectedRequest._id, ...ratingForm },
  //       axiosConfig
  //     );
  //     toast.success('Thank you for your review!');
  //     setShowRateModal(false);
  //     fetchRequests();
  //   } catch (err) {
  //     toast.error('Failed to submit review');
  //   }
  // };

const handleRating = async () => {
  if (ratingSubmitting || !selectedRequest) return;
  setRatingSubmitting(true);
  try {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/hire/rate`,
      { hireId: selectedRequest._id, ...ratingForm },
      axiosConfig
    );
    toast.success('Thank you for your review!');

    // Persist the rated hire ID locally — this is the source of truth for
    // disabling the button, independent of whether the backend's
    // /my-requests response includes a "rated" field
    setRatedRequestIds((prev) => {
      const next = new Set(prev);
      next.add(selectedRequest._id);
      try {
        localStorage.setItem('ratedHireIds', JSON.stringify([...next]));
      } catch {
        // localStorage unavailable — button state just won't survive a reload
      }
      return next;
    });

    setShowRateModal(false);
    setRatingForm({ rating: 5, review: '', comment: '' });
    fetchRequests();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to submit review');
  } finally {
    setRatingSubmitting(false);
  }
};

  const handleReportSubmit = async () => {
    if (!selectedRequest) return;
    if (!reportForm.details.trim()) {
      toast.error('Please describe what happened');
      return;
    }
    setReportSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire/report`,
        { hireId: selectedRequest._id, reason: reportForm.reason, details: reportForm.details.trim() },
        axiosConfig
      );
      toast.success('Report submitted. Our team will review it shortly.');
      setShowReportModal(false);
      setReportForm({ reason: 'no_show', details: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  const openDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const openChatModal = async (req) => {
    const convId = req.conversationId;
    if (!convId) {
      toast.error('No chat available for this hire');
      return;
    }

    setSelectedRequest(req);
    setCurrentConvId(convId);
    setShowChatModal(true);
    setChatLoading(true);
    setChatMessages([]);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversations/${convId}/messages`,
        axiosConfig
      );

      const rawMessages = res.data.messages || [];
      const validMessages = rawMessages.filter((msg) => {
        if (!msg || typeof msg !== 'object') return false;
        if (!msg._id) return false;
        if (!msg.content && !msg.text) return false;
        return true;
      });

      setChatMessages(validMessages);
    } catch (err) {
      console.error('Chat fetch failed:', err);
      toast.error('Failed to load messages');
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentConvId) return;

    const messageText = chatInput.trim();
    const tempId = `temp-${Date.now()}`;

    const optimisticMsg = {
      _id: tempId,
      sender: currentUserId,
      content: messageText,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setChatMessages((prev) => [...prev, optimisticMsg]);
    setChatInput('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversations/${currentConvId}/messages`,
        { content: messageText },
        axiosConfig
      );

      if (res.data?.status === 'success') {
        setChatMessages((prev) => prev.map((msg) => (msg._id === tempId ? res.data.data : msg)));
      }
    } catch (err) {
      toast.error('Failed to send message');
      setChatMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isMyMessage = (sender) => {
    if (!sender || !currentUserId) return false;
    const myId = currentUserId.toString().trim();
    let senderId;
    if (typeof sender === 'string') senderId = sender.trim();
    else if (typeof sender === 'object' && sender !== null) senderId = (sender._id || sender.id)?.toString().trim();
    else return false;
    return senderId === myId;
  };


  const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'active', label: 'Active' },
  { value: 'ended', label: 'Ended' },
  { value: 'declined', label: 'Declined' },
  { value: 'cancelled', label: 'Cancelled' },
];

// "pending" tab also catches pending_approval / awaiting_admin_approval so
// clients don't need to know your internal status names to find their requests
const filteredRequests = requests.filter((req) => {
  if (statusFilter === 'all') return true;
  if (statusFilter === 'pending') {
    return ['pending', 'pending_approval', 'awaiting_admin_approval'].includes(req.status);
  }
  return req.status === statusFilter;
});

const statusCounts = requests.reduce((acc, req) => {
  const key =
    req.status === 'pending_approval' || req.status === 'awaiting_admin_approval'
      ? 'pending'
      : req.status;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10 text-center"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase mb-2">Driver dashboard</p>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">My Hire Requests</h1>
          {/* <p className="text-sm sm:text-base text-gray-500 mt-2">Everyone who's requested to hire you, in one place.</p> */}
        {/* </motion.div>

        {loading ? ( */}
        <p className="text-sm sm:text-base text-gray-500 mt-2">Everyone who's requested to hire you, in one place.</p>
</motion.div>

{!loading && requests.length > 0 && (
  <div className="mb-6 sm:mb-8 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
    <div className="flex gap-2 min-w-max sm:flex-wrap sm:min-w-0">
      {STATUS_TABS.map((tab) => {
        const count = tab.value === 'all' ? requests.length : statusCounts[tab.value] || 0;
        const isActive = statusFilter === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  </div>
)}

{loading ? (
          <div className="text-center py-16 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
            <p className="mt-4 text-gray-500 text-sm">Loading requests...</p>
          </div>
        // ) : requests.length === 0 ? (
        //   <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-gray-100">
        //     <div className="text-5xl mb-4">📭</div>
        //     <p className="text-lg sm:text-xl font-semibold text-gray-700">No hire requests yet</p>
        //     <p className="text-gray-400 text-sm mt-1">Clients will appear here when they want to hire you</p>
        //   </div>
        // ) : (
        //   <div className="space-y-4 sm:space-y-6">
        //     {requests.map((req) => {

          ) : requests.length === 0 ? (
  <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-gray-100">
    <div className="text-5xl mb-4">📭</div>
    <p className="text-lg sm:text-xl font-semibold text-gray-700">No hire requests yet</p>
    <p className="text-gray-400 text-sm mt-1">Clients will appear here when they want to hire you</p>
  </div>
) : filteredRequests.length === 0 ? (
  <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-gray-100">
    <div className="text-5xl mb-4">🔍</div>
    <p className="text-lg sm:text-xl font-semibold text-gray-700">
      No {STATUS_TABS.find((t) => t.value === statusFilter)?.label.toLowerCase()} requests
    </p>
    <p className="text-gray-400 text-sm mt-1">Try a different filter above</p>
  </div>
) : (
  <div className="space-y-4 sm:space-y-6">
    {filteredRequests.map((req) => {
              const meta = STATUS_META[req.status] || { label: req.status, bg: 'bg-gray-100', text: 'text-gray-600' };
              const canRespond = req.status === 'pending' || req.status === 'pending_approval';
              const canChat = ['active', 'accepted', 'awaiting_admin_approval'].includes(req.status);
              const canEnd = req.status === 'active' || req.status === 'accepted';
              const canRate = req.status === 'ended';
              const canCancel = ['accepted', 'active', 'awaiting_admin_approval'].includes(req.status);
              // const canRate = req.status === 'ended' && !req.rated;
              const canReport = ['active', 'accepted', 'ended', 'awaiting_admin_approval'].includes(req.status);

              return (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-7"
                >
                  {/* Header row */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shrink-0">
                      {getInitials(req.client?.firstName, req.client?.lastName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                          {req.client?.firstName} {req.client?.lastName}
                        </h3>
                        <span className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">Client · {req.category}</p>
                    </div>
                    <button
                      onClick={() => openDetails(req)}
                      className="shrink-0 p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5 text-gray-600"
                    >
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline text-sm font-medium">Details</span>
                    </button>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mt-5 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                      <span><strong className="font-medium text-gray-800">{req.durationHours}h</strong> duration</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Offer: <strong className="font-medium text-gray-800">₦{req.amountOffered?.toLocaleString()}</strong></span>
                    </p>
                    <p className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                      <span className="truncate">{req.address}</span>
                    </p>
                    {(req.date || req.time) && (
                      <p className="flex items-center gap-2 sm:col-span-2">
                        <Calendar className="h-4 w-4 text-purple-500 shrink-0" />
                        <span>{req.date ? new Date(req.date).toLocaleDateString() : ''} {req.time}</span>
                      </p>
                    )}
                    {req.accommodation && (
                      <p className="flex items-center gap-2 text-emerald-700 sm:col-span-2">
                        <CheckCircle className="h-4 w-4 shrink-0" /> Accommodation provided
                      </p>
                    )}
                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    Requested {new Date(req.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-5 pt-5 border-t border-gray-100">
                    {canRespond && (
                      <>
                        <button
                          onClick={() => handleResponse(req._id, 'accept')}
                          className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" /> Accept
                        </button>
                        <button
                          onClick={() => handleResponse(req._id, 'decline')}
                          className="flex-1 sm:flex-none px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="h-4 w-4" /> Decline
                        </button>
                      </>
                    )}

                    {['accepted', 'active', 'ended'].includes(req.status) && (
  <WhatsAppButton
    phone={req.client?.phone}
    message={`Hello ${req.client?.firstName || ''}, this is your driver regarding our hire${req.hireReference ? ` (${req.hireReference})` : ''}.`}
  />
)}

                    {canChat && (
                      <button
                        onClick={() => openChatModal(req)}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" /> Chat
                      </button>
                    )}

                    {canEnd && (
                      <button
                        onClick={() => { setSelectedRequest(req); setShowEndModal(true); }}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        End Hire
                      </button>
                    )}

                    {canCancel && (
  <button
    onClick={() => { setSelectedRequest(req); setShowCancelModal(true); }}
    className="flex-1 sm:flex-none px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
  >
    <Ban className="h-4 w-4" /> Cancel
  </button>
)}

                    {/* {canRate && (
                      <button
                        onClick={() => { setSelectedRequest(req); setShowRateModal(true); }}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Star className="h-4 w-4" /> Rate Client
                      </button>
                    )} */}

{canRate && (() => {
  const isRated = req.rated || ratedRequestIds.has(req._id);
  return (
    <button
      onClick={() => { if (!isRated) { setSelectedRequest(req); setShowRateModal(true); } }}
      disabled={isRated}
      className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
        isRated
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-purple-600 hover:bg-purple-700 text-white'
      }`}
    >
      <Star className={`h-4 w-4 ${isRated ? 'fill-gray-300 text-gray-300' : ''}`} />
      {isRated ? 'Rated' : 'Rate Client'}
    </button>
  );
})()}
                    {canReport && (
                      <button
                        onClick={() => { setSelectedRequest(req); setShowReportModal(true); }}
                        className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Flag className="h-4 w-4" /> Report
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Client Details Modal ─────────────────────────────────────── */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative"
          >
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                {getInitials(selectedRequest.client?.firstName, selectedRequest.client?.lastName)}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-4 text-gray-900">
                {selectedRequest.client?.firstName} {selectedRequest.client?.lastName}
              </h2>
              <p className="text-sm text-gray-400 mt-1">Client Profile</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Info</h3>
                <div className="space-y-3 text-sm">
                  <p className="flex items-center gap-2.5 text-gray-700">
                    <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                    {selectedRequest.client?.phone || 'Not provided'}
                    <WhatsAppButton
  phone={selectedRequest.client?.phone}
  label="Chat on WhatsApp"
  className="w-full sm:w-auto"
/>
                  </p>
                  <p className="flex items-center gap-2.5 text-gray-700 break-all">
                    <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                    {selectedRequest.client?.email}
                  </p>
                  <p className="flex items-center gap-2.5 text-gray-700">
                    <Home className="h-4 w-4 text-purple-600 shrink-0" />
                    {selectedRequest.client?.address?.street || 'Address not shared'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Hire Details</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-2xl text-sm text-gray-700">
                  <p><strong className="text-gray-900">Duration:</strong> {selectedRequest.durationHours}h</p>
                  <p><strong className="text-gray-900">Offered:</strong> ₦{selectedRequest.amountOffered?.toLocaleString()}</p>
                  <p><strong className="text-gray-900">Calculated:</strong> ₦{selectedRequest.amount?.toLocaleString()}</p>
                  <p><strong className="text-gray-900">Pickup:</strong> {selectedRequest.address}</p>
                  <p><strong className="text-gray-900">Description:</strong> {selectedRequest.description}</p>
                  <p><strong className="text-gray-900">Accommodation:</strong> {selectedRequest.accommodation ? 'Yes' : 'No'}</p>
                  {selectedRequest.benefits && <p><strong className="text-gray-900">Benefits:</strong> {selectedRequest.benefits}</p>}
                </div>
              </div>
            </div>
            <HireRequestDetails hire={selectedRequest} />

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* ── End Hire Modal ───────────────────────────────────────────── */}
      {showEndModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Close booking?</h3>
            <p className="text-sm text-gray-500 mb-5">Are you sure you want to end this hire?</p>
            <textarea
              value={endReason}
              onChange={(e) => setEndReason(e.target.value)}
              placeholder="Reason for ending (optional)"
              rows={4}
              className="w-full p-3.5 border border-gray-200 rounded-xl mb-5 text-sm focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowEndModal(false); setEndReason(''); }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEndHire}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors"
              >
                End Hire
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Rate Client Modal ────────────────────────────────────────── */}
      {showRateModal && selectedRequest && selectedRequest.status === 'ended' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-5">Rate Your Client</h3>
            <div className="mb-5 text-center">
              <p className="mb-3 text-sm font-medium text-gray-600">Your rating</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRatingForm({ ...ratingForm, rating: n })} className="transition-transform hover:scale-110">
                    <Star className={`h-8 w-8 sm:h-10 sm:w-10 ${n <= ratingForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Review title (optional)"
              value={ratingForm.review}
              onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
              className="w-full p-3.5 border border-gray-200 rounded-xl mb-3 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none"
            />
            <textarea
              placeholder="Your comments (optional)"
              value={ratingForm.comment}
              onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
              rows={4}
              className="w-full p-3.5 border border-gray-200 rounded-xl mb-5 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none"
            />
{/* 
            <button
              onClick={handleRating}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors"
            >
              Submit Review
            </button> */}

            <button
  onClick={handleRating}
  disabled={ratingSubmitting}
  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
>
  {ratingSubmitting ? (
    <>
      <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      Submitting...
    </>
  ) : (
    'Submit Review'
  )}
</button>




          </motion.div>
        </div>
      )}

      {/* ── Report Client Modal ──────────────────────────────────────── */}
      {showReportModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Report Client</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Reporting {selectedRequest.client?.firstName} {selectedRequest.client?.lastName} — our team reviews every report.
            </p>

            <label className="block text-sm font-semibold text-gray-700 mb-2">What happened?</label>
            <select
              value={reportForm.reason}
              onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
              className="w-full p-3.5 border border-gray-200 rounded-xl mb-4 text-sm bg-white focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <label className="block text-sm font-semibold text-gray-700 mb-2">Details</label>
            <textarea
              value={reportForm.details}
              onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })}
              placeholder="Describe what happened, with as much detail as you can..."
              rows={4}
              maxLength={1000}
              className="w-full p-3.5 border border-gray-200 rounded-xl mb-5 text-sm focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowReportModal(false); setReportForm({ reason: 'no_show', details: '' }); }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={reportSubmitting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {reportSubmitting ? 'Submitting...' : (<><Flag className="h-4 w-4" /> Submit Report</>)}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Chat Modal ───────────────────────────────────────────────── */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white sm:rounded-3xl shadow-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0 text-sm">
                  {getInitials(selectedRequest?.client?.firstName, selectedRequest?.client?.lastName)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-lg truncate">
                    {selectedRequest?.client?.firstName} {selectedRequest?.client?.lastName}
                  </h3>
                  <p className="text-xs sm:text-sm opacity-90">Active hire</p>
                </div>
              </div>
              <button onClick={() => setShowChatModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors shrink-0">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50">
              {chatLoading && chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
                  <p className="text-gray-500 text-sm">Loading messages...</p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare size={48} className="mb-4 opacity-40" />
                  <p className="text-base font-medium">No messages yet</p>
                  <p className="mt-1 text-sm">Start the conversation</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => {
                  if (!msg || typeof msg !== 'object') return null;
                  const sender = msg.sender || null;
                  const content = msg.content || msg.text || '(Message missing content)';
                  const createdAt = msg.createdAt || new Date().toISOString();
                  const isMe = isMyMessage(sender);

                  return (
                    <div key={msg._id || `msg-${index}-${createdAt}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                        }`}
                      >
                        <p className="break-words leading-relaxed">{content}</p>
                        <span className="text-[10px] opacity-70 mt-1 block text-right">
                          {formatTime(createdAt)}{isMe && <span className="ml-1">✓✓</span>}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-3 sm:p-4 bg-white shrink-0">
              <form onSubmit={handleChatSend} className="flex items-center gap-2 sm:gap-3">
                <button type="button" className="p-2.5 sm:p-3 rounded-full hover:bg-gray-100 shrink-0">
                  <Paperclip size={18} className="text-gray-500" />
                </button>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-w-0 px-4 py-2.5 sm:py-3 rounded-full bg-gray-100 border border-gray-200 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/50"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className={`p-2.5 sm:p-3 rounded-full shrink-0 ${
                    chatInput.trim() && !chatLoading ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}


      {showCancelModal && selectedRequest && (
  <CancelHireModal
    hire={selectedRequest}
    token={token}
    onClose={() => setShowCancelModal(false)}
    onCancelled={fetchRequests}
  />
)}
    </div>
  );
};

export default MyHires;