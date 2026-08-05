






/* eslint-disable no-unused-vars */
// src/pages/Client/MyHiresClient.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  Car, 
  Phone, 
  Mail, 
  X,
  AlertTriangle,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Paperclip, Send, MessageSquare } from 'lucide-react';

import DistanceInfo  from "../DistanceMap"
const MyHiresClient = () => {
  const [isSending, setIsSending] = useState(false);
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHire, setSelectedHire] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [endReason, setEndReason] = useState('');
  const [ratingForm, setRatingForm] = useState({ rating: 5, review: '', comment: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false); // ← NEW
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  const [selectedHireForChat, setSelectedHireForChat] = useState(null);
  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem('userId') || localStorage.getItem('_id') ||localStorage.getItem('user.id') || '';
  const user = localStorage.getItem('user')
console.log(user)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    fetchHires();
  }, []);

  const fetchHires = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hire/my-hires`, axiosConfig);
      setHires(res.data.hires || []);
      console.log(res.data.hires)
    } catch (err) {
      toast.error('Failed to load your hires');
    } finally {
      setLoading(false);
    }
  };

  const handleEndHire = async () => {
    if (!selectedHire) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire/end/${selectedHire._id}`,
        { endReason },
        axiosConfig
      );
      toast.success('Hire ended successfully');
      setShowEndModal(false);
      setEndReason('');
      fetchHires();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to end hire');
    }
  };

  const handleRating = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire/rate`,
        { hireId: selectedHire._id, ...ratingForm },
        axiosConfig
      );
      toast.success('Review submitted successfully!');
      setShowRateModal(false);
      setRatingForm({ rating: 5, review: '', comment: '' });
      fetchHires();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  // ← NEW: Initialize payment for accepted hire
  const handleInitializePayment = async (hire) => {
    if (!hire._id) return;

    setPaymentLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire/payment/initialize`,
        { hireId: hire._id },
        axiosConfig
      );

      if (res.data.success) {
        setPaymentUrl(res.data.data.authorization_url);
        setShowPaymentModal(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to initialize payment';
      toast.error(msg);
    } finally {
      setPaymentLoading(false);
    }
  };

  // ← NEW: Handle payment redirect (check URL params)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const hireId = urlParams.get('hire');
    const ref = urlParams.get('ref');

    if (status && hireId) {
      if (status === 'paid') {
        toast.success('Payment successful! Hire is now active.');
        fetchHires(); // refresh hires list
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (status === 'failed') {
        toast.error('Payment failed. Please try again.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Chat functions (keep your existing ones)
  // const isMyMessage = (sender) => {
  //   if (!sender) return false;
  //   const currentUserId = localStorage.getItem('userId') || localStorage.getItem('_id') || '';
  //   if (!currentUserId) return false;
  //   const senderId = sender._id || sender;
  //   return senderId?.toString() === currentUserId.toString();
  // };



const isMyMessage = (sender) => {
  if (!sender) return false;

  const myId = currentUserId?.toString().trim();
  if (!myId) {
    console.warn('Current user ID is missing in localStorage');
    return false;
  }

  // Handle different possible sender formats
  let senderId = sender;
  if (typeof sender === 'object' && sender !== null) {
    senderId = sender._id || sender.id || null;
  }

  if (!senderId) return false;

  return senderId.toString().trim() === myId;
};


  // const openChatModal = async (hire) => {
  //   const convId = hire.conversationId;
  //   if (!convId) {
  //     toast.error('No chat available for this hire');
  //     return;
  //   }

  //   setCurrentConvId(convId);
  //   setShowChatModal(true);
  //   setChatLoading(true);
  //   setChatMessages([]);

  //   try {
  //     const res = await axios.get(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversations/${convId}/messages`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     setChatMessages(res.data.messages || []);
  //   } catch (err) {
  //     console.error('Chat fetch failed:', err);
  //     toast.error('Failed to load messages');
  //   } finally {
  //     setChatLoading(false);
  //   }
  // };

  const openChatModal = async (hire) => {
    console.log(hire)
  const convId = hire.conversationId;
  if (!convId) {
    toast.error('No chat available for this hire');
    return;
  }

  setCurrentConvId(convId);
  setShowChatModal(true);
  setChatLoading(true);
  setChatMessages([]); // clear previous

  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversations/${convId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const rawMessages = res.data.messages || [];
    console.log('Raw messages from server:', rawMessages);

    // Filter out invalid entries
    const validMessages = rawMessages.filter(msg => {
      if (!msg || typeof msg !== 'object') return false;
      if (!msg._id) {
        console.warn('Message missing _id:', msg);
        return false;
      }
      if (!msg.content && !msg.text) {
        console.warn('Message missing content/text:', msg);
        return false;
      }
      return true;
    });

    console.log('Valid messages after filter:', validMessages);

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
    };

    setChatMessages((prev) => [...prev, optimisticMsg]);
    setChatInput('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversations/${currentConvId}/messages`,
        { content: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChatMessages((prev) =>
        prev.map((msg) => (msg._id === tempId ? res.data.data : msg))
      );
    } catch (err) {
      toast.error('Failed to send message');
      setChatMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12 text-gray-900"
        >
          My Hired Drivers
        </motion.h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-xl text-gray-600">Loading your hires...</p>
          </div>
        ) : hires.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🚗</div>
            <p className="text-2xl text-gray-600">You haven't hired any drivers yet</p>
            <p className="text-gray-500 mt-2">Go to "Find Drivers" to hire one!</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {hires.map((hire) => (
              <motion.div
                key={hire._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-6 mb-6">
                      <img
                        src={hire.driver.avatar || '/default-avatar.jpg'}
                        alt=""
                        className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                      />
                      <div>
                        <h3 className="text-2xl font-bold">
                          {hire.driver.firstName} {hire.driver.lastName}
                        </h3>
                        <p className="text-lg text-gray-600 flex items-center gap-2 mt-1">
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          {hire.driver.rating?.toFixed(1) || '5.0'} ({hire.driver.ratingsReceived?.length || 0} reviews)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-gray-700">
                      <p className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <strong>Duration:</strong> {hire.durationHours} hours
                      </p>
                      <p className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <strong>Your Offer:</strong> ₦{hire.amountOffered.toLocaleString()}
                      </p>
                      <p className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        {/* <strong>Required Amount:</strong> ₦{hire.amount.toLocaleString()} */}
                      </p>
                      <p className="flex items-center gap-3 col-span-full">
                        <MapPin className="h-5 w-5 text-red-600" />
                        <strong>Address:</strong> {hire.address}
                      </p>
                      {hire.accommodation && (
                        <p className="flex items-center gap-3 text-green-700">
                          ✅ Accommodation provided
                        </p>
                      )}
                      {hire.benefits && <p className="col-span-full"><strong>Benefits:</strong> {hire.benefits}</p>}
                      {hire.endReason && (
                        <p className="col-span-full text-red-600 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          <strong>Ended because:</strong> {hire.endReason}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                      <p className="flex items-center gap-2"><Phone className="h-5 w-5" /> {hire.driver.phone || 'N/A'}</p>
                      <p className="flex items-center gap-2"><Mail className="h-5 w-5" /> {hire.driver.email}</p>
                      {hire.driver.vehicle && (
                        <p className="flex items-center gap-2"><Car className="h-5 w-5" /> {hire.driver.vehicle.make} {hire.driver.vehicle.model}</p>
                      )}
                    </div>
                  </div>
{/* Inside each hire card, replace the <DistanceInfo /> block with this */}




                  <div className="flex flex-col items-end gap-4">
                    {/* Status Badge */}
                    {/* <span className={`px-6 py-3 rounded-full text-lg font-bold shadow-md ${
                      hire.status === 'active' ? 'bg-green-100 text-green-800' :
                      hire.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                      hire.status === 'payment_pending' ? 'bg-blue-100 text-blue-800' :
                      hire.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {hire.status.replace('_', ' ').toUpperCase()}
                    </span> */}

{/*                   
                    {hire.status === 'accepted' && hire.paymentStatus === 'pending' && (
                      <button
                        onClick={() => handleInitializePayment(hire)}
                        disabled={paymentLoading}
                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
                      >
                        <CreditCard className="h-6 w-6" />
                        {paymentLoading ? 'Processing...' : `Pay ₦${hire.amountOffered.toLocaleString()}`}
                      </button>
                    )} */}

                    {/* {hire.status === 'pending_approval' && (
                      <div className="text-center bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                        <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-yellow-800 font-medium">Waiting for Admin Approval</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your offer (₦{hire.amountOffered.toLocaleString()}) is below the required amount (₦{hire.amount.toLocaleString()}). 
                          Admin review needed before payment.
                        </p>
                      </div>
                    )} */}

             
                    {/* {hire.status === 'active' && hire.conversationId && (
                      <button
                        onClick={() => openChatModal(hire)}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
                      >
                        <MessageSquare className="h-6 w-6" />
                        Chat with Driver
                      </button>
                    )} */}

{/*                   
                    {hire.status === 'active' && (
                      <button
                        onClick={() => {
                          setSelectedHire(hire);
                          setShowEndModal(true);
                        }}
                        className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
                      >
                        End Hire Now
                      </button>
                    )} */}

              
                    {/* {hire.status === 'ended' && !hire.rated && (
                      <button
                        onClick={() => {
                          setSelectedHire(hire);
                          setShowRateModal(true);
                        }}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
                      >
                        <Star className="h-6 w-6" />
                        Rate & Review Driver
                      </button>
                    )} */}

          
                    {/* {hire.status === 'ended' && hire.rated && (
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">Already Rated</p>
                      </div>
                    )} */}
                  </div>
                        <div className="mt-6">
  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
    <MapPin className="text-indigo-600" size={20} />
    Route to Driver
  </h4>

  <DistanceInfo
    clientAddressParts={{
      address: user?.clientProfile?.address || user?.address || 'Iyana Ipaja',
      lga: user?.clientProfile?.lga || user?.lga || '',
      state: user?.clientProfile?.state || user?.state || 'Lagos',
      country: 'Nigeria'
    }}
    providerAddressParts={{
      address: hire.driver?.address || '',
      lga: hire.driver?.lga || '',
      state: hire.driver?.state || 'Lagos',
      country: 'Nigeria'
    }}
  />
</div>

                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>



      {/* End Hire Modal */}
      {showEndModal && selectedHire && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
          >
            <h3 className="text-2xl font-bold mb-4 text-center">End Hire Early?</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to end the hire with {selectedHire.driver.firstName}?
            </p>
            <textarea
              value={endReason}
              onChange={(e) => setEndReason(e.target.value)}
              placeholder="Reason for ending (optional)"
              className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-red-500"
              rows="4"
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowEndModal(false);
                  setEndReason('');
                }}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEndHire}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition"
              >
                End Hire
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ← NEW: Payment Modal */}
      {showPaymentModal && paymentUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Complete Payment</h3>
            <p className="text-lg text-gray-600 mb-6">
              Redirecting to Paystack to complete your payment...
            </p>
            <div className="space-y-4 mb-8">
              <p className="text-sm text-gray-500">
                <strong>Amount:</strong> ₦{selectedHire?.amount?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Hire:</strong> {selectedHire?.driver?.firstName}
              </p>
            </div>
            <button
              onClick={() => {
                window.location.href = paymentUrl;
              }}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              Proceed to Paystack
            </button>
          </motion.div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  {selectedHire?.driver?.firstName?.slice(0, 2) || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    Chat with {selectedHire?.driver?.firstName} {selectedHire?.driver?.lastName}
                  </h3>
                  <p className="text-sm opacity-90">Active hire</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Messages */}
            {/* <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">
              {chatLoading && chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4" />
                  <p className="text-gray-600">Loading messages...</p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare size={64} className="mb-6 opacity-40" />
                  <p className="text-xl font-medium">No messages yet</p>
                  <p className="mt-2">Start the conversation</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = isMyMessage(msg?.sender);
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-4 rounded-2xl shadow-md ${
                          isMe
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-br-none ml-auto'
                            : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                        }`}
                      >
                        <p className="break-words leading-relaxed">{msg.content}</p>
                        <span className="text-xs opacity-70 mt-2 block text-right">
                          {new Date(msg.createdAt).toLocaleDateString()}
                          {isMe && <span className="ml-1">✓✓</span>}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div> */}
<div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">
  {chatLoading && chatMessages.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4" />
      <p className="text-gray-600">Loading messages...</p>
    </div>
  ) : chatMessages.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <MessageSquare size={64} className="mb-6 opacity-40" />
      <p className="text-xl font-medium">No messages yet</p>
      <p className="mt-2">Start the conversation</p>
    </div>
  ) : (
    chatMessages.map((msg, index) => {
      // Safeguard: skip completely invalid messages
      if (!msg || typeof msg !== 'object') {
        console.warn(`Invalid message skipped at index ${index}:`, msg);
        return null;
      }

      // Safe defaults for missing fields
      const senderId = msg.sender?._id || msg.sender || null;
      const content = msg.content || msg.text || '(Message content missing)';
      const createdAt = msg.createdAt || new Date().toISOString();

      // Debug log for problematic messages
      if (!senderId) {
        console.warn(`Message missing sender at index ${index}:`, msg);
      }

      const isMe = isMyMessage(senderId);

      return (
        <div
          key={msg._id || `msg-${index}-${createdAt}`} // robust key
          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[75%] p-4 rounded-2xl shadow-md ${
              isMe
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-br-none ml-auto'
                : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
            }`}
          >
            <p className="break-words leading-relaxed">{content}</p>
            <span className="text-xs opacity-70 mt-2 block text-right">
              {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {isMe && <span className="ml-1">✓✓</span>}
            </span>
          </div>
        </div>
      );
    })
  )}
  <div ref={messagesEndRef} />
</div>
            {/* Input */}
            <div className="border-t p-4 bg-white">
              <form onSubmit={handleChatSend} className="flex items-center gap-3">
                <button type="button" className="p-3 rounded-full hover:bg-gray-100">
                  <Paperclip size={20} className="text-gray-600" />
                </button>

                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-5 py-3 rounded-full bg-gray-100 border border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/50"
                  disabled={chatLoading}
                />

                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className={`p-3 rounded-full ${
                    chatInput.trim() && !chatLoading
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rate & Review Modal */}
      {showRateModal && selectedHire && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Rate {selectedHire.driver.firstName}</h3>
              <button onClick={() => setShowRateModal(false)}>
                <X className="h-8 w-8 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="mb-8 text-center">
              <p className="text-lg font-medium mb-4">Your Rating</p>
              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRatingForm({ ...ratingForm, rating: n })}
                    className="transition transform hover:scale-110"
                  >
                    <Star
                      className={`h-12 w-12 ${n <= ratingForm.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Review title (optional)"
              value={ratingForm.review}
              onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              placeholder="Your comments (optional)"
              value={ratingForm.comment}
              onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
              rows="5"
              className="w-full p-4 border border-gray-300 rounded-xl mb-8 focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleRating}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition"
            >
              Submit Review
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyHiresClient;
























































































































































































































