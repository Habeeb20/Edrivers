






// /* eslint-disable no-unused-vars */
// // src/pages/Client/MyHiresClient.jsx
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { toast } from 'sonner';
// import { 
//   Star, 
//   Clock, 
//   DollarSign, 
//   MapPin, 
//   Car, 
//   Phone, 
//   Mail, 
//   X,
//   AlertTriangle,
//   CreditCard,
//   CheckCircle
// } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { useRef } from 'react';
// import { Paperclip, Send, MessageSquare } from 'lucide-react';
// import DistanceInfo from '../DistanceMap';

// const MyHiresClient = () => {
//   const [isSending, setIsSending] = useState(false);
//   const [hires, setHires] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedHire, setSelectedHire] = useState(null);
//   const [showEndModal, setShowEndModal] = useState(false);
//   const [showRateModal, setShowRateModal] = useState(false);
//   const [endReason, setEndReason] = useState('');
//   const [ratingForm, setRatingForm] = useState({ rating: 5, review: '', comment: '' });
//   const [showPaymentModal, setShowPaymentModal] = useState(false); // ← NEW
//   const [paymentLoading, setPaymentLoading] = useState(false);
//   const [paymentUrl, setPaymentUrl] = useState('');

//   const [selectedHireForChat, setSelectedHireForChat] = useState(null);
//   const token = localStorage.getItem('token');
//   const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
//   const [paymentBreakdown, setPaymentBreakdown] = useState(null);

//   const [showChatModal, setShowChatModal] = useState(false);
//   const [chatMessages, setChatMessages] = useState([]);
//   const [chatInput, setChatInput] = useState('');
//   const [chatLoading, setChatLoading] = useState(false);
//   const [currentConvId, setCurrentConvId] = useState(null);
//   const messagesEndRef = useRef(null);
//   const currentUserId = localStorage.getItem('userId') || localStorage.getItem('_id') ||localStorage.getItem('user.id') || '';

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [chatMessages]);

//   useEffect(() => {
//     fetchHires();
//   }, []);

//   const fetchHires = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hire/my-hires`, axiosConfig);
//       setHires(res.data.hires || []);
//       console.log(res.data.hires)
//     } catch (err) {
//       toast.error('Failed to load your hires');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEndHire = async () => {
//     if (!selectedHire) return;

//     try {
//       await axios.put(
//         `${import.meta.env.VITE_BACKEND_URL}/api/hire/end/${selectedHire._id}`,
//         { endReason },
//         axiosConfig
//       );
//       toast.success('Hire ended successfully');
//       setShowEndModal(false);
//       setEndReason('');
//       fetchHires();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to end hire');
//     }
//   };

//   const handleRating = async () => {
//     try {
//       await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/hire/rate`,
//         { hireId: selectedHire._id, ...ratingForm },
//         axiosConfig
//       );
//       toast.success('Review submitted successfully!');
//       setShowRateModal(false);
//       setRatingForm({ rating: 5, review: '', comment: '' });
//       fetchHires();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to submit review');
//     }
//   };

//   // ← NEW: Initialize payment for accepted hire
//   const handleInitializePayment = async (hire) => {
//     if (!hire._id) return;

//     setPaymentLoading(true);
//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/hire/payment/initialize`,
//         { hireId: hire._id },
//         axiosConfig
//       );

//       if (res.data.success) {
//         setPaymentUrl(res.data.data.authorization_url);
//           setPaymentBreakdown(res.data.data.breakdown);
//             setSelectedHire(hire); 
//         setShowPaymentModal(true);
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || 'Failed to initialize payment';
//       toast.error(msg);
//     } finally {
//       setPaymentLoading(false);
//     }
//   };

//   // ← NEW: Handle payment redirect (check URL params)
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const status = urlParams.get('status');
//     const hireId = urlParams.get('hire');
//     const ref = urlParams.get('ref');

//     if (status && hireId) {
//       if (status === 'paid') {
//         toast.success('Payment successful! Hire is now active.');
//         fetchHires(); // refresh hires list
//         // Clear URL params
//         window.history.replaceState({}, document.title, window.location.pathname);
//       } else if (status === 'failed') {
//         toast.error('Payment failed. Please try again.');
//         window.history.replaceState({}, document.title, window.location.pathname);
//       }
//     }
//   }, []);

//   // Chat functions (keep your existing ones)
//   // const isMyMessage = (sender) => {
//   //   if (!sender) return false;
//   //   const currentUserId = localStorage.getItem('userId') || localStorage.getItem('_id') || '';
//   //   if (!currentUserId) return false;
//   //   const senderId = sender._id || sender;
//   //   return senderId?.toString() === currentUserId.toString();
//   // };



// const isMyMessage = (sender) => {
//   if (!sender) return false;

//   const myId = currentUserId?.toString().trim();
//   if (!myId) {
//     console.warn('Current user ID is missing in localStorage');
//     return false;
//   }

//   // Handle different possible sender formats
//   let senderId = sender;
//   if (typeof sender === 'object' && sender !== null) {
//     senderId = sender._id || sender.id || null;
//   }

//   if (!senderId) return false;

//   return senderId.toString().trim() === myId;
// };


//   // const openChatModal = async (hire) => {
//   //   const convId = hire.conversationId;
//   //   if (!convId) {
//   //     toast.error('No chat available for this hire');
//   //     return;
//   //   }

//   //   setCurrentConvId(convId);
//   //   setShowChatModal(true);
//   //   setChatLoading(true);
//   //   setChatMessages([]);

//   //   try {
//   //     const res = await axios.get(
//   //       `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversations/${convId}/messages`,
//   //       { headers: { Authorization: `Bearer ${token}` } }
//   //     );
//   //     setChatMessages(res.data.messages || []);
//   //   } catch (err) {
//   //     console.error('Chat fetch failed:', err);
//   //     toast.error('Failed to load messages');
//   //   } finally {
//   //     setChatLoading(false);
//   //   }
//   // };

//   const openChatModal = async (hire) => {
//     console.log(hire)
//   const convId = hire.conversationId;
//   if (!convId) {
//     toast.error('No chat available for this hire');
//     return;
//   }

//   setCurrentConvId(convId);
//   setShowChatModal(true);
//   setChatLoading(true);
//   setChatMessages([]); // clear previous

//   try {
//     const res = await axios.get(
//       `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversations/${convId}/messages`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     const rawMessages = res.data.messages || [];
//     console.log('Raw messages from server:', rawMessages);

//     // Filter out invalid entries
//     const validMessages = rawMessages.filter(msg => {
//       if (!msg || typeof msg !== 'object') return false;
//       if (!msg._id) {
//         console.warn('Message missing _id:', msg);
//         return false;
//       }
//       if (!msg.content && !msg.text) {
//         console.warn('Message missing content/text:', msg);
//         return false;
//       }
//       return true;
//     });

//     console.log('Valid messages after filter:', validMessages);

//     setChatMessages(validMessages);
//   } catch (err) {
//     console.error('Chat fetch failed:', err);
//     toast.error('Failed to load messages');
//     setChatMessages([]);
//   } finally {
//     setChatLoading(false);
//   }
// };
//   const handleChatSend = async (e) => {
//     e.preventDefault();
//     if (!chatInput.trim() || !currentConvId) return;

//     const messageText = chatInput.trim();
//     const tempId = `temp-${Date.now()}`;

//     const optimisticMsg = {
//       _id: tempId,
//       sender: currentUserId,
//       content: messageText,
//       createdAt: new Date().toISOString(),
//     };

//     setChatMessages((prev) => [...prev, optimisticMsg]);
//     setChatInput('');

//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversations/${currentConvId}/messages`,
//         { content: messageText },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setChatMessages((prev) =>
//         prev.map((msg) => (msg._id === tempId ? res.data.data : msg))
//       );
//     } catch (err) {
//       toast.error('Failed to send message');
//       setChatMessages((prev) => prev.filter((m) => m._id !== tempId));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         <motion.h1
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-4xl font-bold text-center mb-12 text-gray-900"
//         >
//           My Hired Drivers
//         </motion.h1>

//         {loading ? (
//           <div className="text-center py-20">
//             <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
//             <p className="mt-4 text-xl text-gray-600">Loading your hires...</p>
//           </div>
//         ) : hires.length === 0 ? (
//           <div className="text-center py-20">
//             <div className="text-6xl mb-6">🚗</div>
//             <p className="text-2xl text-gray-600">You haven't hired any drivers yet</p>
//             <p className="text-gray-500 mt-2">Go to "Find Drivers" to hire one!</p>
//           </div>
//         ) : (
//           <div className="grid gap-8">
//             {hires.map((hire) => (
//               <motion.div
//                 key={hire._id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 whileHover={{ y: -4 }}
//                 className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
//               >
//                 <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-6 mb-6">
//                       <img
//                         src={hire.driver.avatar || '/default-avatar.jpg'}
//                         alt=""
//                         className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 shadow-lg"
//                       />
//                       <div>
//                         <h3 className="text-2xl font-bold">
//                           {hire.driver.firstName} {hire.driver.lastName}
//                         </h3>
//                         {/* <h3 className="text-2xl font-bold">
//                           {hire.driver.state} {hire.driver.lga}
//                         </h3> */}
                       
//                         <p className="text-lg text-gray-600 flex items-center gap-2 mt-1">
//                           <Star className="h-5 w-5 text-yellow-500 fill-current" />
//                           {hire.driver.rating?.toFixed(1) || '5.0'} ({hire.driver.ratingsReceived?.length || 0} reviews)
//                         </p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-gray-700">
//                       <p className="flex items-center gap-3">
//                         <Clock className="h-5 w-5 text-blue-600" />
//                         <strong>Duration:</strong> {hire.durationHours} hours
//                       </p>
//                       <p className="flex items-center gap-3">
//                         <DollarSign className="h-5 w-5 text-green-600" />
//                         <strong>Your Offer:</strong> ₦{hire.amountOffered.toLocaleString()}
//                       </p>
       
//                       <p className="flex items-center gap-3">
//                         <DollarSign className="h-5 w-5 text-green-600" />
//                         {/* <strong>Required Amount:</strong> ₦{hire.amount.toLocaleString()} */}
//                       </p>
//                       <p className="flex items-center gap-3 col-span-full">
//                         <MapPin className="h-5 w-5 text-red-600" />
//                         <strong>Address:</strong> {hire.address}
//                       </p>
//                       {hire.accommodation && (
//                         <p className="flex items-center gap-3 text-green-700">
//                           ✅ Accommodation provided
//                         </p>
//                       )}
//                       {hire.benefits && <p className="col-span-full"><strong>Benefits:</strong> {hire.benefits}</p>}
//                       {hire.endReason && (
//                         <p className="col-span-full text-red-600 flex items-center gap-2">
//                           <AlertTriangle className="h-5 w-5" />
//                           <strong>Ended because:</strong> {hire.endReason}
//                         </p>
//                       )}
//                     </div>

//                     <div className="mt-6 flex flex-wrap gap-3 text-sm">

//                       {/* <p className="flex items-center gap-2"><Phone className="h-5 w-5" /> {hire.driver.phone || 'N/A'}</p>
//                       <p className="flex items-center gap-2"><Mail className="h-5 w-5" /> {hire.driver.email}</p> */}
//                       {hire.driver.vehicle && (
//                         <p className="flex items-center gap-2"><Car className="h-5 w-5" /> {hire.driver.vehicle.make} {hire.driver.vehicle.model}</p>
//                       )}
//                     </div>

//                                           <div className="mt-6">
//                       <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
//                         <MapPin className="text-indigo-600" size={20} />
//                         Route to Driver
//                       </h4>
                    
//                       <DistanceInfo
                       
//                         providerAddressParts={{
//                           address: hire.driver?.address || '',
//                           lga: hire.driver?.lga || '',
//                           state: hire.driver?.state || 'Lagos',
//                           country: 'Nigeria'
//                         }}
//                       />
//                     </div>
//                   </div>

//                   <div className="flex flex-col items-end gap-4">
//                     {/* Status Badge */}
//                     <span className={`px-6 py-3 rounded-full text-lg font-bold shadow-md ${
//                       hire.status === 'active' ? 'bg-green-100 text-green-800' :
//                       hire.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
//                       hire.status === 'payment_pending' ? 'bg-blue-100 text-blue-800' :
//                       hire.status === 'ended' ? 'bg-gray-100 text-gray-800' :
//                       'bg-orange-100 text-orange-800'
//                     }`}>
//                       {hire.status.replace('_', ' ').toUpperCase()}
//                     </span>

//                     {/* Payment Button - Only for accepted hires that need payment */}
//                     {hire.status === 'accepted' && hire.paymentStatus === 'pending' && (
//                       <button
//                         onClick={() => handleInitializePayment(hire)}
//                         disabled={paymentLoading}
//                         className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
//                       >
//                         <CreditCard className="h-6 w-6" />
//                         {paymentLoading ? 'Processing...' : 'Pay Now'}
//                         {/* {paymentLoading ? 'Processing...' : `Pay ₦${hire.amountOffered.toLocaleString()}`} */}
//                       </button>
//                     )}

//                     {/* Admin Approval Pending - Show message for low offers */}
//                     {hire.status === 'pending_approval' && (
//                       <div className="text-center bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
//                         <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
//                         <p className="text-yellow-800 font-medium">Waiting for Admin Approval</p>
//                         <p className="text-sm text-yellow-700 mt-1">
//                           Your offer (₦{hire.amountOffered.toLocaleString()}) is below the required amount (₦{hire.amount.toLocaleString()}). 
//                           Admin review needed before payment.
//                         </p>
//                       </div>
//                     )}

//                     {/* Chat Button - Only for active hires */}
//                     {hire.status === 'active' && hire.conversationId && (
//                       <>
//                                             <p className="flex items-center gap-2"><Phone className="h-5 w-5" /> {hire.driver.phone || 'N/A'}</p>
//                       <p className="flex items-center gap-2"><Mail className="h-5 w-5" /> {hire.driver.email} </p>
//                            <button
//                         onClick={() => openChatModal(hire)}
//                         className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
//                       >
//                         <MessageSquare className="h-6 w-6" />
//                         Chat with Driver
//                       </button>
//                       </>
                 
//                     )}

//                     {/* End Hire Button - Only for active hires */}
//                     {hire.status === 'active' && (
//                       <>

//                          <button
//                         onClick={() => {
//                           setSelectedHire(hire);
//                           setShowEndModal(true);
//                         }}
//                         className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
//                       >
//                         End Hire Now
//                       </button>
//                       </>
                   
//                     )}

//                     {/* Rate & Review - Only after ended and not rated */}
//                     {hire.status === 'ended' && !hire.rated && (
//                       <>

//                          <button
//                         onClick={() => {
//                           setSelectedHire(hire);
//                           setShowRateModal(true);
//                         }}
//                         className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
//                       >
//                         <Star className="h-6 w-6" />
//                         Rate & Review Driver
//                       </button>
//                       </>
                   
//                     )}

//                     {/* Already Rated */}
//                     {hire.status === 'ended' && hire.rated && (
//                       <>
//                                                                                                               <p className="flex items-center gap-2"><Phone className="h-5 w-5" /> {hire.driver.phone || 'N/A'}</p>
//                       <p className="flex items-center gap-2"><Mail className="h-5 w-5" /> {hire.driver.email} </p>
//                           <div className="text-center">
//                         <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
//                         <p className="text-green-700 font-medium">Already Rated</p>
//                       </div>
//                       </>
                  
//                     )}


//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* End Hire Modal */}
//       {showEndModal && selectedHire && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <motion.div
//             initial={{ scale: 0.9 }}
//             animate={{ scale: 1 }}
//             className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
//           >
//             <h3 className="text-2xl font-bold mb-4 text-center">End Hire Early?</h3>
//             <p className="text-gray-600 text-center mb-6">
//               Are you sure you want to end the hire with {selectedHire.driver.firstName}?
//             </p>
//             <textarea
//               value={endReason}
//               onChange={(e) => setEndReason(e.target.value)}
//               placeholder="Reason for ending (optional)"
//               className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-red-500"
//               rows="4"
//             />
//             <div className="flex gap-4">
//               <button
//                 onClick={() => {
//                   setShowEndModal(false);
//                   setEndReason('');
//                 }}
//                 className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleEndHire}
//                 className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition"
//               >
//                 End Hire
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* ← NEW: Payment Modal */}
//       {showPaymentModal && paymentUrl && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//           <motion.div
//             initial={{ scale: 0.9 }}
//             animate={{ scale: 1 }}
//             className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
//           >
//             <h3 className="text-2xl font-bold mb-4">Complete Payment</h3>
//             <p className="text-lg text-gray-600 mb-6">
//               Redirecting to Paystack to complete your payment...
//             </p>
//             <p className="text-xs text-gray-500 mt-2">
//   Callout charge covers driver mobilization and service readiness.
// </p>
//            <div className="space-y-4 mb-8 text-left">
//   <div className="flex justify-between text-gray-600">
//     <span>Hire Amount:</span>
//     <span>₦{paymentBreakdown?.amountOffered?.toLocaleString()}</span>
//   </div>

//   <div className="flex justify-between text-gray-600">
//     <span>Callout Charge:</span>
//     <span>₦{paymentBreakdown?.callOutCharge?.toLocaleString()}</span>
//   </div>

//   <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
//     <span>Total:</span>
//     <span>₦{paymentBreakdown?.totalAmount?.toLocaleString()}</span>
//   </div>

//   <p className="text-sm text-gray-500 mt-2">
//     <strong>Driver:</strong> {selectedHire?.driver?.firstName}
//   </p>
// </div>
//             <button
//               onClick={() => {
//                 window.location.href = paymentUrl;
//               }}
//               className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition"
//             >
//               Proceed to Paystack
//             </button>
//           </motion.div>
//         </div>
//       )}

//       {/* Chat Modal */}
//       {showChatModal && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
//             {/* Header */}
//             <div className="p-5 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
//                   {selectedHire?.driver?.firstName?.slice(0, 2) || '?'}
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-lg">
//                     Chat with {selectedHire?.driver?.firstName} {selectedHire?.driver?.lastName}
//                   </h3>
//                   <p className="text-sm opacity-90">Active hire</p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setShowChatModal(false)}
//                 className="p-2 hover:bg-white/20 rounded-full transition"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             {/* Messages */}
//             {/* <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">
//               {chatLoading && chatMessages.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full">
//                   <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4" />
//                   <p className="text-gray-600">Loading messages...</p>
//                 </div>
//               ) : chatMessages.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full text-gray-500">
//                   <MessageSquare size={64} className="mb-6 opacity-40" />
//                   <p className="text-xl font-medium">No messages yet</p>
//                   <p className="mt-2">Start the conversation</p>
//                 </div>
//               ) : (
//                 chatMessages.map((msg) => {
//                   const isMe = isMyMessage(msg?.sender);
//                   return (
//                     <div
//                       key={msg._id}
//                       className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
//                     >
//                       <div
//                         className={`max-w-[75%] p-4 rounded-2xl shadow-md ${
//                           isMe
//                             ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-br-none ml-auto'
//                             : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
//                         }`}
//                       >
//                         <p className="break-words leading-relaxed">{msg.content}</p>
//                         <span className="text-xs opacity-70 mt-2 block text-right">
//                           {new Date(msg.createdAt).toLocaleDateString()}
//                           {isMe && <span className="ml-1">✓✓</span>}
//                         </span>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//               <div ref={messagesEndRef} />
//             </div> */}
// <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">
//   {chatLoading && chatMessages.length === 0 ? (
//     <div className="flex flex-col items-center justify-center h-full">
//       <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4" />
//       <p className="text-gray-600">Loading messages...</p>
//     </div>
//   ) : chatMessages.length === 0 ? (
//     <div className="flex flex-col items-center justify-center h-full text-gray-500">
//       <MessageSquare size={64} className="mb-6 opacity-40" />
//       <p className="text-xl font-medium">No messages yet</p>
//       <p className="mt-2">Start the conversation</p>
//     </div>
//   ) : (
//     chatMessages.map((msg, index) => {
//       // Safeguard: skip completely invalid messages
//       if (!msg || typeof msg !== 'object') {
//         console.warn(`Invalid message skipped at index ${index}:`, msg);
//         return null;
//       }

//       // Safe defaults for missing fields
//       const senderId = msg.sender?._id || msg.sender || null;
//       const content = msg.content || msg.text || '(Message content missing)';
//       const createdAt = msg.createdAt || new Date().toISOString();

//       // Debug log for problematic messages
//       if (!senderId) {
//         console.warn(`Message missing sender at index ${index}:`, msg);
//       }

//       const isMe = isMyMessage(senderId);

//       return (
//         <div
//           key={msg._id || `msg-${index}-${createdAt}`} // robust key
//           className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
//         >
//           <div
//             className={`max-w-[75%] p-4 rounded-2xl shadow-md ${
//               isMe
//                 ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-br-none ml-auto'
//                 : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
//             }`}
//           >
//             <p className="break-words leading-relaxed">{content}</p>
//             <span className="text-xs opacity-70 mt-2 block text-right">
//               {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               {isMe && <span className="ml-1">✓✓</span>}
//             </span>
//           </div>
//         </div>
//       );
//     })
//   )}
//   <div ref={messagesEndRef} />
// </div>
//             {/* Input */}
//             <div className="border-t p-4 bg-white">
//               <form onSubmit={handleChatSend} className="flex items-center gap-3">
//                 <button type="button" className="p-3 rounded-full hover:bg-gray-100">
//                   <Paperclip size={20} className="text-gray-600" />
//                 </button>

//                 <input
//                   value={chatInput}
//                   onChange={(e) => setChatInput(e.target.value)}
//                   placeholder="Type your message..."
//                   className="flex-1 px-5 py-3 rounded-full bg-gray-100 border border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/50"
//                   disabled={chatLoading}
//                 />

//                 <button
//                   type="submit"
//                   disabled={!chatInput.trim() || chatLoading}
//                   className={`p-3 rounded-full ${
//                     chatInput.trim() && !chatLoading
//                       ? 'bg-indigo-600 text-white hover:bg-indigo-700'
//                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                   }`}
//                 >
//                   <Send size={20} />
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Rate & Review Modal */}
//       {showRateModal && selectedHire && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <motion.div
//             initial={{ scale: 0.9 }}
//             animate={{ scale: 1 }}
//             className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8"
//           >
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-2xl font-bold">Rate {selectedHire.driver.firstName}</h3>
//               <button onClick={() => setShowRateModal(false)}>
//                 <X className="h-8 w-8 text-gray-500 hover:text-gray-700" />
//               </button>
//             </div>

//             <div className="mb-8 text-center">
//               <p className="text-lg font-medium mb-4">Your Rating</p>
//               <div className="flex justify-center gap-4">
//                 {[1, 2, 3, 4, 5].map((n) => (
//                   <button
//                     key={n}
//                     onClick={() => setRatingForm({ ...ratingForm, rating: n })}
//                     className="transition transform hover:scale-110"
//                   >
//                     <Star
//                       className={`h-12 w-12 ${n <= ratingForm.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
//                     />
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <input
//               type="text"
//               placeholder="Review title (optional)"
//               value={ratingForm.review}
//               onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
//               className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500"
//             />

//             <textarea
//               placeholder="Your comments (optional)"
//               value={ratingForm.comment}
//               onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
//               rows="5"
//               className="w-full p-4 border border-gray-300 rounded-xl mb-8 focus:ring-2 focus:ring-blue-500"
//             />

//             <button
//               onClick={handleRating}
//               className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition"
//             >
//               Submit Review
//             </button>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyHiresClient;








/* eslint-disable no-unused-vars */
// src/pages/Client/MyHiresClient.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Star, Clock, DollarSign, MapPin, Car, Phone, Mail, X,
  AlertTriangle, CreditCard, CheckCircle, Paperclip, Send, MessageSquare,
  Flag, ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';
import DistanceInfo from '../DistanceMap';

const STATUS_META = {
  active:            { label: 'Active',            bg: 'bg-emerald-100', text: 'text-emerald-800' },
  pending_approval:  { label: 'Pending Approval',   bg: 'bg-amber-100',   text: 'text-amber-800' },
  payment_pending:   { label: 'Payment Pending',    bg: 'bg-blue-100',    text: 'text-blue-800' },
  ended:             { label: 'Ended',              bg: 'bg-gray-100',    text: 'text-gray-600' },
  accepted:          { label: 'Accepted',           bg: 'bg-blue-100',    text: 'text-blue-800' },
  declined:          { label: 'Declined',           bg: 'bg-red-100',     text: 'text-red-700' },
  cancelled:         { label: 'Cancelled',          bg: 'bg-red-100',     text: 'text-red-700' },
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

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'ended', label: 'Ended' },
  { id: 'completed', label: 'Completed' },
];

const getInitials = (first = '', last = '') => `${first[0] || ''}${last[0] || ''}`.toUpperCase() || '?';

// "Pending" groups every pre-active state; "Ended" is any hire that stopped
// running; "Completed" narrows that down to ended hires you've already
// rated — i.e. hires with nothing left to do.
const matchesFilter = (hire, filter) => {
  switch (filter) {
    case 'active':
      return hire.status === 'active';
    case 'pending':
      return ['pending_approval', 'payment_pending', 'accepted'].includes(hire.status);
    case 'ended':
      return hire.status === 'ended';
    case 'completed':
      return hire.status === 'ended' && !!hire.rated;
    default:
      return true;
  }
};

const MyHiresClient = () => {
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHire, setSelectedHire] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const [showEndModal, setShowEndModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [endReason, setEndReason] = useState('');
  const [ratingForm, setRatingForm] = useState({ rating: 5, review: '', comment: '' });
  const [reportForm, setReportForm] = useState({ reason: 'no_show', details: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);

  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(null);
  const messagesEndRef = useRef(null);
const [driverRatingsCache, setDriverRatingsCache] = useState({}); // { [driverId]: { summary, reviews, loading, loaded } }
const [showReviewsModal, setShowReviewsModal] = useState(false);
const [reviewsDriver, setReviewsDriver] = useState(null);
  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const currentUserId = localStorage.getItem('userId') || localStorage.getItem('_id') || localStorage.getItem('user.id') || '';

  const filteredHires = hires.filter((h) => matchesFilter(h, statusFilter));
  const filterCount = (filter) => hires.filter((h) => matchesFilter(h, filter)).length;


  const fetchDriverRating = async (driverId) => {
  if (!driverId || driverRatingsCache[driverId]?.loaded) return;

  setDriverRatingsCache((prev) => ({
    ...prev,
    [driverId]: { ...(prev[driverId] || {}), loading: true },
  }));

  try {
    const [summaryRes, reviewsRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hire/user/${driverId}/summary`, axiosConfig),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hire/user/${driverId}?limit=20`, axiosConfig),
    ]);
console.log(summaryRes.data.summary)
console.log(reviewsRes.data.ratings)
    setDriverRatingsCache((prev) => ({
      ...prev,
      [driverId]: {
        summary: summaryRes.data.summary,
        reviews: reviewsRes.data.ratings || [],
        loading: false,
        loaded: true,
      },
    }));
  } catch (err) {
    console.error('Failed to fetch driver ratings:', err);
    setDriverRatingsCache((prev) => ({
      ...prev,
      [driverId]: { ...(prev[driverId] || {}), loading: false, loaded: true, error: true },
    }));
  }
};

useEffect(() => {
  hires.forEach((hire) => {
    if (hire.driver?._id) fetchDriverRating(hire.driver._id);
  });
}, [hires]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    fetchHires();
  }, []);

  const fetchHires = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hire/my-hires`, axiosConfig);
      setHires(res.data.hires || []);
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

  const handleReportSubmit = async () => {
    if (!selectedHire) return;
    if (!reportForm.details.trim()) {
      toast.error('Please describe what happened');
      return;
    }
    setReportSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/hire/report`,
        { hireId: selectedHire._id, reason: reportForm.reason, details: reportForm.details.trim() },
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
        setPaymentBreakdown(res.data.data.breakdown);
        setSelectedHire(hire);
        setShowPaymentModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const hireId = urlParams.get('hire');

    if (status && hireId) {
      if (status === 'paid') {
        toast.success('Payment successful! Hire is now active.');
        fetchHires();
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (status === 'failed') {
        toast.error('Payment failed. Please try again.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const isMyMessage = (sender) => {
    if (!sender) return false;
    const myId = currentUserId?.toString().trim();
    if (!myId) return false;
    let senderId = sender;
    if (typeof sender === 'object' && sender !== null) senderId = sender._id || sender.id || null;
    if (!senderId) return false;
    return senderId.toString().trim() === myId;
  };

  const openChatModal = async (hire) => {
    const convId = hire.conversationId;
    if (!convId) {
      toast.error('No chat available for this hire');
      return;
    }

    setSelectedHire(hire);
    setCurrentConvId(convId);
    setShowChatModal(true);
    setChatLoading(true);
    setChatMessages([]);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversations/${convId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
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

    const optimisticMsg = { _id: tempId, sender: currentUserId, content: messageText, createdAt: new Date().toISOString() };
    setChatMessages((prev) => [...prev, optimisticMsg]);
    setChatInput('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages/conversations/${currentConvId}/messages`,
        { content: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatMessages((prev) => prev.map((msg) => (msg._id === tempId ? res.data.data : msg)));
    } catch (err) {
      toast.error('Failed to send message');
      setChatMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-10 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase mb-2">Client dashboard</p>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">My Hired Drivers</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-2">Every driver you've hired, with live status.</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-16 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
            <p className="mt-4 text-gray-500 text-sm">Loading your hires...</p>
          </div>
        ) : hires.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-gray-100">
            <div className="text-5xl mb-4">🚗</div>
            <p className="text-lg sm:text-xl font-semibold text-gray-700">You haven't hired any drivers yet</p>
            <p className="text-gray-400 text-sm mt-1">Go to "Find Drivers" to hire one!</p>
          </div>
        ) : (
          <>
            {/* ── Status Filter Tabs ─────────────────────────────────── */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              {FILTERS.map((filter) => {
                const isActive = statusFilter === filter.id;
                const count = filterCount(filter.id);
                return (
                  <button
                    key={filter.id}
                    onClick={() => setStatusFilter(filter.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                  >
                    {filter.label}
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

            {/* ── Filtered Results ───────────────────────────────────── */}
            {filteredHires.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500 font-medium">No hires match this filter</p>
                <p className="text-gray-400 text-sm mt-1">Try a different tab above.</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {filteredHires.map((hire) => {
                  const meta = STATUS_META[hire.status] || { label: hire.status?.replace(/_/g, ' '), bg: 'bg-gray-100', text: 'text-gray-600' };
                  const needsPayment = hire.status === 'accepted' && hire.paymentStatus === 'pending';
                  const canChat = hire.status === 'active' && hire.conversationId;
                  const canEnd = hire.status === 'active';
                  const canRate = hire.status === 'ended' && !hire.rated;
                  const canReport = ['active', 'accepted', 'ended'].includes(hire.status);

                  return (
                    <motion.div
                      key={hire._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-7"
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 sm:gap-4">
                        {hire.driver?.avatar ? (
                          <img
                            src={hire.driver.avatar}
                            alt=""
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-blue-100 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                            {getInitials(hire.driver?.firstName, hire.driver?.lastName)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                              {hire.driver?.firstName} {hire.driver?.lastName}
                            </h3>
                            <span className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
                              {meta.label}
                            </span>
                          </div>
                       {(() => {
  const cached = driverRatingsCache[hire.driver?._id];
  const avg = cached?.summary?.averageRating ?? 0;
  const count = cached?.summary?.totalRatings ?? 0;

  return (
    <button
      onClick={() => { setReviewsDriver(hire.driver); setShowReviewsModal(true); }}
      className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-0.5 hover:text-amber-600 transition-colors"
    >
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      {cached?.loading ? (
        <span className="animate-pulse">Loading...</span>
      ) : count > 0 ? (
        <>
          {avg.toFixed(1)} ({count} review{count !== 1 ? 's' : ''})
        </>
      ) : (
        'No reviews yet'
      )}
    </button>
  );
})()}
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mt-5 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                          <span><strong className="font-medium text-gray-800">{hire.durationHours}h</strong> duration</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Offer: <strong className="font-medium text-gray-800">₦{hire.amountOffered?.toLocaleString()}</strong></span>
                        </p>
                        <p className="flex items-center gap-2 sm:col-span-2">
                          <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="truncate">{hire.address}</span>
                        </p>
                        {hire.driver?.vehicle && (
                          <p className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-gray-400 shrink-0" />
                            <span>{hire.driver.vehicle.make} {hire.driver.vehicle.model}</span>
                          </p>
                        )}
                        {hire.accommodation && (
                          <p className="flex items-center gap-2 text-emerald-700">
                            <CheckCircle className="h-4 w-4 shrink-0" /> Accommodation provided
                          </p>
                        )}
                        {hire.benefits && (
                          <p className="sm:col-span-2"><strong className="text-gray-800">Benefits:</strong> {hire.benefits}</p>
                        )}
                        {hire.endReason && (
                          <p className="sm:col-span-2 flex items-start gap-2 text-red-600">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span><strong>Ended because:</strong> {hire.endReason}</span>
                          </p>
                        )}
                      </div>

                      {/* Contact info for active/ended hires */}
                      {(hire.status === 'active' || hire.status === 'ended') && (
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {hire.driver?.phone || 'N/A'}</span>
                          <span className="flex items-center gap-1.5 truncate"><Mail className="h-3.5 w-3.5" /> {hire.driver?.email}</span>
                        </div>
                      )}

                      {/* Route map */}
                      <div className="mt-5">
                        <h4 className="text-sm font-semibold mb-2.5 flex items-center gap-2 text-gray-700">
                          <MapPin className="text-indigo-600 h-4 w-4" />
                          Route to Driver
                        </h4>
                        <DistanceInfo
                          providerAddressParts={{
                            address: hire.driver?.address || '',
                            lga: hire.driver?.lga || '',
                            state: hire.driver?.state || 'Lagos',
                            country: 'Nigeria',
                          }}
                        />
                      </div>

                      {/* Pending-approval notice */}
                      {hire.status === 'pending_approval' && (
                        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-amber-800 font-medium text-sm">Waiting for Admin Approval</p>
                            <p className="text-xs text-amber-700 mt-1">
                              Your offer (₦{hire.amountOffered?.toLocaleString()}) is below the required amount
                              (₦{hire.amount?.toLocaleString()}). Admin review is needed before payment.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 sm:gap-3 mt-5 pt-5 border-t border-gray-100">
                        {needsPayment && (
                          <button
                            onClick={() => handleInitializePayment(hire)}
                            disabled={paymentLoading}
                            className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            {paymentLoading ? 'Processing...' : 'Pay Now'}
                          </button>
                        )}

                        {canChat && (
                          <button
                            onClick={() => openChatModal(hire)}
                            className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="h-4 w-4" /> Chat
                          </button>
                        )}

                        {canEnd && (
                          <button
                            onClick={() => { setSelectedHire(hire); setShowEndModal(true); }}
                            className="flex-1 sm:flex-none px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            End Hire
                          </button>
                        )}

                        {canRate && (
                          <button
                            onClick={() => { setSelectedHire(hire); setShowRateModal(true); }}
                            className="flex-1 sm:flex-none px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <Star className="h-4 w-4" /> Rate Driver
                          </button>
                        )}

                        {hire.status === 'ended' && hire.rated && (
                          <span className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4" /> Already Rated
                          </span>
                        )}

                        {canReport && (
                          <button
                            onClick={() => { setSelectedHire(hire); setShowReportModal(true); }}
                            className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <Flag className="h-4 w-4" /> Report Driver
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── End Hire Modal ───────────────────────────────────────────── */}
      {showEndModal && selectedHire && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Close booking?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Are you sure you want to end the hire with {selectedHire.driver?.firstName}?
            </p>
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

      {/* ── Payment Modal ────────────────────────────────────────────── */}
      {showPaymentModal && paymentUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Payment</h3>
            <p className="text-sm text-gray-500 mb-1">Redirecting to Paystack to complete your payment...</p>
            <p className="text-xs text-gray-400 mb-5">Callout charge covers driver mobilization and service readiness.</p>

            <div className="space-y-2.5 mb-6 text-left bg-gray-50 rounded-2xl p-4 sm:p-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Hire Amount</span>
                <span>₦{paymentBreakdown?.amountOffered?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Callout Charge</span>
                <span>₦{paymentBreakdown?.callOutCharge?.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-2.5 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>₦{paymentBreakdown?.totalAmount?.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400 pt-1">
                <strong className="text-gray-600">Driver:</strong> {selectedHire?.driver?.firstName}
              </p>
            </div>

            <button
              onClick={() => { window.location.href = paymentUrl; }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-md transition-colors"
            >
              Proceed to Paystack
            </button>
          </motion.div>
        </div>
      )}

      {/* ── Report Driver Modal ──────────────────────────────────────── */}
      {showReportModal && selectedHire && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Report Driver</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Reporting {selectedHire.driver?.firstName} {selectedHire.driver?.lastName} — our team reviews every report.
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
            <div className="p-4 sm:p-5 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0 text-sm">
                  {getInitials(selectedHire?.driver?.firstName, selectedHire?.driver?.lastName)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-lg truncate">
                    {selectedHire?.driver?.firstName} {selectedHire?.driver?.lastName}
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
                  const senderId = msg.sender?._id || msg.sender || null;
                  const content = msg.content || msg.text || '(Message content missing)';
                  const createdAt = msg.createdAt || new Date().toISOString();
                  const isMe = isMyMessage(senderId);

                  return (
                    <div key={msg._id || `msg-${index}-${createdAt}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                        }`}
                      >
                        <p className="break-words leading-relaxed">{content}</p>
                        <span className="text-[10px] opacity-70 mt-1 block text-right">
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

      {/* ── Rate & Review Modal ──────────────────────────────────────── */}
      {showRateModal && selectedHire && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">Rate {selectedHire.driver?.firstName}</h3>
              <button onClick={() => setShowRateModal(false)}>
                <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="mb-5 text-center">
              <p className="text-sm font-medium text-gray-600 mb-3">Your rating</p>
              <div className="flex justify-center gap-2">
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
              className="w-full p-3.5 border border-gray-200 rounded-xl mb-6 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none"
            />

            <button
              onClick={handleRating}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-md transition-colors"
            >
              Submit Review
            </button>
          </motion.div>
        </div>

        
      )}

      {/* ── Reviews Modal ────────────────────────────────────────────── */}
{showReviewsModal && reviewsDriver && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Reviews for {reviewsDriver.firstName}
          </h3>
          {(() => {
            const cached = driverRatingsCache[reviewsDriver._id];
            const avg = cached?.summary?.averageRating ?? 0;
            const count = cached?.summary?.totalRatings ?? 0;
            return (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {avg.toFixed(1)} average · {count} review{count !== 1 ? 's' : ''}
              </p>
            );
          })()}
        </div>
        <button onClick={() => setShowReviewsModal(false)}>
          <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {(() => {
          const cached = driverRatingsCache[reviewsDriver._id];

          if (cached?.loading) {
            return (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-400 border-t-transparent" />
              </div>
            );
          }

          if (!cached?.reviews || cached.reviews.length === 0) {
            return (
              <div className="text-center py-10 text-gray-400">
                <Star className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No reviews yet</p>
              </div>
            );
          }

          return cached.reviews.map((r) => (
            <div key={r._id} className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {r.fromUser?.firstName?.[0] || '?'}
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {r.fromUser?.firstName} {r.fromUser?.lastName?.[0] || ''}.
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3.5 w-3.5 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
              </div>
              {r.review && <p className="text-sm font-semibold text-gray-800 mb-1">{r.review}</p>}
              {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ));
        })()}
      </div>
    </motion.div>
  </div>
)}
    </div>
  );
};

export default MyHiresClient;