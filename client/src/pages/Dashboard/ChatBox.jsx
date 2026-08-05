


// import { useState, useEffect, useRef } from 'react';
// import { Send, Paperclip, MessageSquare, Users, ArrowLeft, Phone, Video } from 'lucide-react';
// import axios from 'axios';
// import { toast } from 'sonner';

// const API_BASE = import.meta.env.VITE_BACKEND_URL;
// const POLLING_INTERVAL = 10000; // 10 seconds - adjust as needed

// const ChatBox = () => {
//   const [contacts, setContacts] = useState([]);
//   const [selectedContact, setSelectedContact] = useState(null);
//   const [conversationId, setConversationId] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isLoadingContacts, setIsLoadingContacts] = useState(true);
//   const [isLoadingChat, setIsLoadingChat] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const [showChatOnMobile, setShowChatOnMobile] = useState(false);

//   const messagesEndRef = useRef(null);
//   const messagesContainerRef = useRef(null);
//   const pollingRef = useRef(null); // To store interval ID
//   const token = localStorage.getItem('token');

//   const axiosConfig = {
//     headers: {
//       Authorization: token ? `Bearer ${token}` : '',
//       'Content-Type': 'application/json',
//     },
//   };

//   // Auto-scroll to bottom
//   const scrollToBottom = () => {
//     if (messagesContainerRef.current) {
//       messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
//     }
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Load contacts (unchanged)
//   useEffect(() => {
//     const fetchAcceptedContacts = async () => {
//       if (!token) return toast.error('Please login');

//       try {
//         setIsLoadingContacts(true);
//         let res = await axios.get(`${API_BASE}/api/messages/my-accepted-drivers`, axiosConfig).catch(() => null);

//         if (!res?.data?.success) {
//           res = await axios.get(`${API_BASE}/api/messages/my-accepted-hires`, axiosConfig);
//         }

//         if (res.data?.success) {
//           setContacts(res.data.data || []);
//         }
//       } catch (err) {
//         toast.error('Failed to load connections');
//       } finally {
//         setIsLoadingContacts(false);
//       }
//     };

//     fetchAcceptedContacts();
//   }, []);

//   // Load messages + polling when contact changes
//   useEffect(() => {
//     if (!selectedContact) return;

//     const convId = selectedContact.conversationId;
//     if (!convId) {
//       toast.error('No conversation ID found for this contact');
//       return;
//     }

//     console.log("Selected Contact:", selectedContact);
//     console.log("Using conversationId:", convId);

//     setConversationId(convId);
//     setMessages([]); // Clear old messages
//     fetchMessages(convId); // Initial fetch

//     // Start polling for new messages
//     if (pollingRef.current) clearInterval(pollingRef.current);
//     pollingRef.current = setInterval(() => {
//       fetchMessages(convId);
//     }, POLLING_INTERVAL);

//     // Cleanup polling when contact changes or component unmounts
//     return () => {
//       if (pollingRef.current) clearInterval(pollingRef.current);
//     };
//   }, [selectedContact]);

//   // Fetch messages function (reusable)
//   const fetchMessages = async (convId) => {
//     if (!convId) return;

//     setIsLoadingChat(true);
//     try {
//       const res = await axios.get(
//         `${API_BASE}/api/messages/conversations/${convId}/messages`,
//         axiosConfig
//       );
// console.log("Fetched messages response:", res.data);

   
//         const newMessages = res.data.messages || [];
//         setMessages(newMessages);
//         console.log('Fetched messages:', newMessages);
//         scrollToBottom(); // Scroll after loading
    
//     } catch (err) {
//       console.error('Failed to load messages:', err);
//       // toast.error('Failed to load messages'); // optional - don't spam
//     } finally {
//       setIsLoadingChat(false);
//     }
//   };

//   // Send message (optimistic + replace on success)
//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || isSending || !conversationId) {
//       if (!conversationId) toast.error("Cannot send — no active conversation");
//       return;
//     }

//     const messageText = input.trim();
//     const tempId = `temp-${Date.now()}`;

//     const optimisticMsg = {
//       _id: tempId,
//       sender: { _id: 'me' },
//       content: messageText,
//       createdAt: new Date().toISOString(),
//       read: false,
//     };

//     setMessages((prev) => [...prev, optimisticMsg]);
//     setInput('');
//     setIsSending(true);

//     try {
//       const res = await axios.post(
//         `${API_BASE}/api/messages/conversations/${conversationId}/messages`,
//         { content: messageText },
//         axiosConfig
//       );

//       if (res.data?.status === 'success') {
//         setMessages((prev) =>
//           prev.map((msg) => (msg._id === tempId ? res.data.data : msg))
//         );
//         scrollToBottom();
//       }
//     } catch (err) {
//       console.error('Send failed:', err);
//       toast.error('Failed to send message');
//       setMessages((prev) => prev.filter((m) => m._id !== tempId));
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const formatTime = (ts) => {
//     const date = new Date(ts);
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

//     if (messageDate.getTime() === today.getTime()) {
//       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     }
//     return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
//   };

//   const isMyMessage = (sender) => sender === 'me' || sender?._id === 'me';

//   const getContactName = (contact) => contact.driver?.name || contact.client?.name || 'Unknown';
//   const getContactRole = (contact) => (contact.driver ? 'Driver' : 'Client');

//   const isMobile = window.innerWidth < 768;

//   if (isLoadingContacts) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading connections...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       {/* Contacts Sidebar */}
//       <aside
//         className={`transition-all duration-300 ${
//           isMobile && showChatOnMobile ? '-translate-x-full' : 'translate-x-0'
//         } w-full md:w-80 border-r border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden`}
//       >
//         <div className="p-4 border-b border-gray-200 bg-white">
//           <div className="flex items-center justify-between">
//             <h2 className="font-semibold text-gray-800 flex items-center gap-2">
//               <Users size={20} className="text-indigo-600" />
//               Chats
//             </h2>
//             <button className="p-2 rounded-full hover:bg-gray-100 md:hidden">
//               <MessageSquare size={20} className="text-indigo-600" />
//             </button>
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto">
//           {contacts.length === 0 ? (
//             <div className="p-8 text-center text-gray-500">
//               <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
//               <p className="text-lg font-medium">No connections yet</p>
//               <p className="mt-2">Accept some hire requests to start chatting</p>
//             </div>
//           ) : (
//             contacts.map((contact) => {
//               const name = getContactName(contact);
//               const role = getContactRole(contact);
//               const isSelected =
//                 selectedContact &&
//                 (selectedContact.hireId === contact.hireId || selectedContact.requestId === contact.requestId);

//               return (
//                 <button
//                   key={contact.hireId || contact.requestId}
//                   onClick={() => {
//                     setSelectedContact(contact);
//                     if (isMobile) setShowChatOnMobile(true);
//                   }}
//                   className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
//                     isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
//                   }`}
//                 >
//                   <div className="relative">
//                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-medium text-sm shadow-sm">
//                       {name.slice(0, 2).toUpperCase()}
//                     </div>
//                     {isSelected && (
//                       <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
//                     )}
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center justify-between">
//                       <p className="font-semibold text-gray-900 truncate">{name}</p>
//                       <span className="text-xs text-gray-500 ml-2">
//                         {formatTime(contact.acceptedAt)}
//                       </span>
//                     </div>
//                     <p className="text-sm text-gray-500 truncate">{role}</p>
//                   </div>
//                 </button>
//               );
//             })
//           )}
//         </div>
//       </aside>

//       {/* Chat Area */}
//       <main className={`flex-1 flex flex-col bg-gray-50 ${isMobile && !showChatOnMobile ? 'hidden' : 'block'}`}>
//         {/* Mobile Back */}
//         {isMobile && showChatOnMobile && selectedContact && (
//           <div className="p-4 border-b bg-white sticky top-0 z-10">
//             <button
//               onClick={() => {
//                 setShowChatOnMobile(false);
//                 setSelectedContact(null);
//               }}
//               className="flex items-center gap-3 text-gray-700 hover:text-gray-900"
//             >
//               <ArrowLeft size={20} />
//               <span className="font-medium">Back</span>
//             </button>
//           </div>
//         )}

//         {selectedContact ? (
//           <>
//             {/* Header */}
//             <header className="p-4 border-b bg-white sticky top-0 z-10">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="relative">
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm shadow-sm">
//                       {getContactName(selectedContact).slice(0, 2).toUpperCase()}
//                     </div>
//                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
//                   </div>
//                   <div>
//                     <h2 className="font-semibold text-gray-900">{getContactName(selectedContact)}</h2>
//                     <p className="text-sm text-green-600 flex items-center gap-1">online</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button className="p-2 rounded-full hover:bg-gray-100">
//                     <Phone size={20} className="text-gray-600" />
//                   </button>
//                   <button className="p-2 rounded-full hover:bg-gray-100">
//                     <Video size={20} className="text-gray-600" />
//                   </button>
//                 </div>
//               </div>
//             </header>

//             {/* Messages */}
//             <div
//               ref={messagesContainerRef}
//               className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
//             >
//               {isLoadingChat && messages.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full">
//                   <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 mb-4" />
//                   <p className="text-gray-600">Loading messages...</p>
//                 </div>
//               ) : messages.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full text-gray-500">
//                   <div className="text-6xl mb-4 opacity-30">💬</div>
//                   <p className="text-lg font-medium">No messages yet</p>
//                   <p className="mt-2">Say something to start the conversation</p>
//                 </div>
//               ) : (
//                 messages.map((msg, index) => {
//                   const isMe = isMyMessage(msg.sender);
//                   const prevMsg = messages[index - 1];
//                   const showAvatar = !isMe && (
//                     index === 0 ||
//                     isMyMessage(prevMsg?.sender) ||
//                     new Date(msg.createdAt) - new Date(prevMsg?.createdAt) > 300000
//                   );
//                   const showTime = index === 0 ||
//                     new Date(msg.createdAt) - new Date(prevMsg?.createdAt) > 300000;

//                   return (
//                     <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
//                       <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
//                         {showTime && (
//                           <div className="mb-2 text-xs text-gray-500 text-center">
//                             {new Date(msg.createdAt).toLocaleDateString([], {
//                               weekday: 'short',
//                               month: 'short',
//                               day: 'numeric',
//                             })}
//                           </div>
//                         )}

//                         <div
//                           className={`p-3 rounded-2xl shadow-sm ${
//                             isMe
//                               ? 'bg-indigo-600 text-white rounded-br-none ml-auto'
//                               : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
//                           }`}
//                         >
//                           <p className="text-sm leading-relaxed break-words">{msg.content}</p>
//                           <div className="flex items-center justify-end mt-1 gap-2">
//                             <span className="text-xs opacity-70">
//                               {formatTime(msg.createdAt)}
//                             </span>
//                             {isMe && (
//                               <span className="text-xs opacity-70">✓✓</span> // double tick
//                             )}
//                           </div>
//                         </div>

//                         {!isMe && showAvatar && (
//                           <div className="mt-1 flex justify-start">
//                             <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs font-medium flex items-center justify-center">
//                               {getContactName(selectedContact).slice(0, 2).toUpperCase()}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })
//               )}

//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input */}
//             <footer className="p-4 bg-white border-t border-gray-200 sticky bottom-0 z-10">
//               <form onSubmit={handleSend} className="flex items-end gap-3">
//                 <button
//                   type="button"
//                   className="p-3 rounded-full hover:bg-gray-100"
//                   disabled={isSending}
//                 >
//                   <Paperclip size={20} className="text-gray-600" />
//                 </button>

//                 <div className="flex-1 relative">
//                   <input
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     placeholder={`Message ${getContactName(selectedContact)}...`}
//                     className="w-full px-5 py-3 rounded-full bg-gray-100 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200/50 text-gray-900 placeholder-gray-500"
//                     disabled={isSending}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter' && !e.shiftKey) {
//                         e.preventDefault();
//                         handleSend(e);
//                       }
//                     }}
//                   />
//                   {input.trim() && (
//                     <button
//                       type="button"
//                       onClick={() => setInput('')}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       ×
//                     </button>
//                   )}
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={!input.trim() || isSending}
//                   className={`p-3 rounded-full min-w-[48px] flex items-center justify-center ${
//                     input.trim() && !isSending
//                       ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow'
//                       : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                   }`}
//                 >
//                   <Send size={20} />
//                 </button>
//               </form>
//             </footer>
//           </>
//         ) : (
//           <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
//             <MessageSquare size={64} className="mb-6 opacity-40" />
//             <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
//             <p className="text-center max-w-md">
//               Choose someone from your connections to start chatting
//             </p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default ChatBox;





































import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MessageSquare, Users, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
const POLLING_INTERVAL = 8000; // 8 seconds

const ChatBox = ({ initialSelectedHire, onBack }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pollingRef = useRef(null);
  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };



  useEffect(() => {
    if (initialSelectedHire && initialSelectedHire.conversationId) {
      setSelectedContact(initialSelectedHire);
      // Optionally scroll or focus input
    }
  }, [initialSelectedHire]);
    {onBack && (
    <button
      onClick={onBack}
      className="p-2 rounded-full hover:bg-gray-100 md:hidden"
    >
      <ArrowLeft size={20} />
    </button>
  )}
// With this (use your actual current user ID):
const currentUserId = localStorage.getItem('userId') || 'YOUR_CURRENT_USER_ID_HERE'; // ← fix this line

const isMyMessage = (sender) => {
  if (!sender) return false;
  const senderId = sender._id || sender; // handle both object and string cases
  return senderId.toString() === currentUserId.toString();
};
  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);


  // Load contacts
  useEffect(() => {
    const fetchAcceptedContacts = async () => {
      if (!token) return toast.error('Please login');

      try {
        setIsLoadingContacts(true);
        let res = await axios.get(`${API_BASE}/api/messages/my-accepted-drivers`, axiosConfig).catch(() => null);

        if (!res?.data?.success) {
          res = await axios.get(`${API_BASE}/api/messages/my-accepted-hires`, axiosConfig);
        }

        if (res?.data?.success) {
          setContacts(res.data.data || []);
        }
      } catch (err) {
        toast.error('Failed to load connections');
      } finally {
        setIsLoadingContacts(false);
      }
    };

    fetchAcceptedContacts();
  }, []);

  // Load messages + polling
  useEffect(() => {
    if (!selectedContact) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setMessages([]);
      setConversationId(null);
      return;
    }

    const convId = selectedContact.conversationId;
    if (!convId) {
      toast.error('No conversation ID found');
      return;
    }

    setConversationId(convId);
    setIsLoadingChat(true);

    const loadMessages = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/messages/conversations/${convId}/messages`,
          axiosConfig
        );

          setMessages(res.data.messages || []);
       
      } catch (err) {
        console.error('Fetch messages failed:', err);
      } finally {
        setIsLoadingChat(false);
      }
    };

    loadMessages();

    pollingRef.current = setInterval(loadMessages, POLLING_INTERVAL);

    return () => clearInterval(pollingRef.current);
  }, [selectedContact]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending || !conversationId) return;

    const messageText = input.trim();
    const tempId = `temp-${Date.now()}`;

    const optimisticMsg = {
      _id: tempId,
      sender: { _id: 'me' },
      content: messageText,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await axios.post(
        `${API_BASE}/api/messages/conversations/${conversationId}/messages`,
        { content: messageText },
        axiosConfig
      );

      if (res.data?.status === 'success') {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? res.data.data : msg))
        );
      }
    } catch (err) {
      toast.error('Failed to send');
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (ts) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };



  const getContactName = (c) => c.driver?.name || c.client?.name || 'Unknown';
  const getContactRole = (c) => (c.driver ? 'Driver' : 'Client');

  const isMobile = window.innerWidth < 768;

  if (isLoadingContacts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Contacts List */}
      <aside
        className={`${
          isMobile && showChatOnMobile ? 'hidden' : 'block'
        } w-full md:w-80 border-r border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users size={20} />
              Chats
            </h2>
            <button className="p-2 rounded-full hover:bg-gray-100 md:hidden">
              <MessageSquare size={20} />
            </button>
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No connections yet</p>
              <p className="mt-2">Accept some hire requests to start chatting</p>
            </div>
          ) : (
            contacts.map((contact) => {
              const name = getContactName(contact);
              const role = getContactRole(contact);
              const isSelected =
                selectedContact &&
                (selectedContact.hireId === contact.hireId || selectedContact.requestId === contact.requestId);

              return (
                <button
                  key={contact.hireId || contact.requestId}
                  onClick={() => {
                    setSelectedContact(contact);
                    if (isMobile) setShowChatOnMobile(true);
                  }}
                  className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-medium text-sm shadow-sm">
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 truncate">{name}</p>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTime(contact.acceptedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{role}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col ${isMobile && !showChatOnMobile ? 'hidden' : 'block'}`}>
        {/* Mobile Back Button */}
        {isMobile && showChatOnMobile && selectedContact && (
          <div className="p-4 bg-indigo-50 border-b border-indigo-100 md:hidden sticky top-0 z-10">
            <button
              onClick={() => {
                setShowChatOnMobile(false);
                setSelectedContact(null);
              }}
              className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
        )}

        {selectedContact ? (
          <>
            {/* Desktop Header */}
            {!isMobile && (
              <header className="p-4 border-b bg-indigo-50 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium shadow">
                    {getContactName(selectedContact).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      {getContactName(selectedContact)}
                    </h2>
                    <p className="text-sm text-indigo-600">
                      {getContactRole(selectedContact)}
                    </p>
                  </div>
                </div>
              </header>
            )}

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 bg-white">
              <div className="space-y-6 pb-24">
                {messages.map((msg, i) => {
                  const isMe = isMyMessage(msg.sender);
                  const showAvatar = !isMe && (i === 0 || isMyMessage(messages[i - 1]?.sender));

                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && showAvatar && (
                        <div className="mt-1 h-8 w-8">
                          <div className="h-full w-full rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {getContactName(selectedContact).slice(0, 2)}
                          </div>
                        </div>
                      )}

                      {!isMe && !showAvatar && <div className="w-11" />}

                      <div
                        className={`max-w-[75%] rounded-2xl p-3.5 shadow-sm transition-all ${
                          isMe
                            ? 'rounded-br-none bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                            : 'rounded-bl-none bg-gray-100 text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="break-words leading-relaxed text-[15px]">{msg.content}</p>
                        <span className="mt-1 block text-[11px] opacity-70 text-right">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <footer className="border-t bg-white p-4 sticky bottom-0 z-10 shadow-lg">
              <form onSubmit={handleSend} className="flex items-end gap-3 max-w-5xl mx-auto">
                <button
                  type="button"
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                  disabled={isSending}
                >
                  <Paperclip size={20} className="text-gray-600" />
                </button>

                <div className="flex-1 relative">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Type a message...`}
                    className="w-full px-5 py-3.5 rounded-full bg-gray-100 border border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/50 text-gray-900 placeholder-gray-500 shadow-inner"
                    disabled={isSending}
                  />

                  {input.trim() && (
                    <button
                      type="button"
                      onClick={() => setInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className={`p-3.5 rounded-full transition-all duration-200 ${
                    input.trim() && !isSending
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center max-w-md">
              <MessageSquare size={64} className="mx-auto mb-6 text-indigo-300" />
              <h3 className="text-2x l font-medium text-gray-700 mb-2">Select a chat</h3>
              <p className="text-gray-500">Choose from your connections to start messaging</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatBox;






















