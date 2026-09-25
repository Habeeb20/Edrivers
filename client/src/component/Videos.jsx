


// // src/components/VideoFeed.jsx
// import React, { useState, useEffect } from 'react';
// import { toast } from 'sonner';
// import axios from 'axios';
// import { Play, Heart, Eye, User, Video } from 'lucide-react';
// import { motion } from "framer-motion";
// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// const VideoFeed = () => {
//   const [videos, setVideos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   useEffect(() => {
//     fetchVideos();
//   }, [page]);

//   const fetchVideos = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/videos`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         params: { page, limit: 12 }
//       });

//       setVideos(prev => page === 1 ? res.data : [...prev, ...res.data]);
//       setHasMore(res.data.length === 12);

//     } catch (err) {
//       toast.error("Failed to load videos");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadMore = () => setPage(prev => prev + 1);

//   const handleVideoClick = (video) => {
//     window.open(video.videoUrl, '_blank');
//   };

//   return (
//     <div className=" bg-gray-50 py-8">
//       <div className="max-w-6xl mx-auto px-4">
        
//         {/* Header */}
//             <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="text-center mb-12 md:mb-16"
//         >
          
//           <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 md:mb-6 tracking-tight">
//             Driver Video Reels
//           </h2>
//           <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
//            Real experiences from professional drivers across Nigeria
//           </p>
//         </motion.div>
//         {/* <div className="flex items-center gap-3 mb-10">
//           <div className="bg-blue-100 p-3 rounded-2xl">
//             <Video className="w-8 h-8 text-blue-600" />
//           </div>
//           <div>
//             <h1 className="text-4xl  font-bold text-gray-900">Driver Video Reels</h1>
//             <p className="text-gray-600">Real experiences from professional drivers across Nigeria</p>
//           </div>
//         </div> */}

//         {loading && page === 1 ? (
//           <div className="flex items-center justify-center min-h-[60vh]">
//             <p className="text-gray-500 text-lg">Loading videos...</p>
//           </div>
//         ) : videos.length === 0 ? (
//           <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
//             <Video className="w-20 h-20 text-gray-300 mb-6" />
//             <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Driver Reels Yet</h3>
//             <p className="text-gray-500 max-w-md">
//               Be the first to share your driving journey and inspire others on the road.
//             </p>
//             <button 
//               className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition"
//               onClick={() => {/* Add upload logic here */}}
//             >
//               Upload Your First Reel
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {videos.map((video) => (
//                 <div 
//                   key={video._id} 
//                   className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 cursor-pointer group"
//                   onClick={() => handleVideoClick(video)}
//                 >
//                   <div className="relative">
//                     <video
//                       src={video.videoUrl}
//                       className="w-full aspect-video object-cover"
//                       poster={video.thumbnail}
//                       muted
//                     />
//                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
//                       <Play size={60} className="text-white drop-shadow-2xl" />
//                     </div>
//                   </div>

//                   <div className="p-5">
//                     <p className="text-gray-300 line-clamp-2 mb-4 text-[15px] leading-relaxed">
//                       {video.description}
//                     </p>

//                     <div className="flex items-center justify-between text-sm text-gray-500">
//                       <div className="flex items-center gap-2">
//                         {/* <User size={16} /> */}
//                         <span className="truncate">
//                           {video.user?.firstName} {video.user?.lastName}
//                         </span>
//                       </div>

//                       <div className="flex items-center gap-5">
//                         {/* <div className="flex items-center gap-1">
//                           <Heart size={16} className="text-red-500" />
//                           <span>{video.likes?.length || 0}</span>
//                         </div> */}
//                         {/* <div className="flex items-center gap-1">
//                           <Eye size={16} />
//                           <span>{video.views || 0}</span>
//                         </div> */}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {hasMore && (
//               <div className="flex justify-center mt-12">
//                 <button
//                   onClick={loadMore}
//                   className="bg-gray-800 hover:bg-gray-700 text-white px-10 py-3.5 rounded-2xl transition font-medium"
//                 >
//                   Load More Videos
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VideoFeed;



// src/components/VideoFeed.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Play, Heart, Eye, User, Video, X } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const VideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [page]);

  useEffect(() => {
    // Lock body scroll while the modal is open, and let Escape close it
    if (!activeVideo) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setActiveVideo(null);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [activeVideo]);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/videos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { page, limit: 12 }
      });

      setVideos(prev => page === 1 ? res.data : [...prev, ...res.data]);
      setHasMore(res.data.length === 12);

    } catch (err) {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => setPage(prev => prev + 1);

  const handleVideoClick = (video) => {
    setActiveVideo(video);
  };

  return (
    <div className=" bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
            <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 md:mb-6 tracking-tight">
            Driver Video Reels
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
           Real experiences from professional drivers across Nigeria
          </p>
        </motion.div>
        {/* <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <Video className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl  font-bold text-gray-900">Driver Video Reels</h1>
            <p className="text-gray-600">Real experiences from professional drivers across Nigeria</p>
          </div>
        </div> */}

        {loading && page === 1 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-gray-500 text-lg">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <Video className="w-20 h-20 text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Driver Reels Yet</h3>
            <p className="text-gray-500 max-w-md">
              Be the first to share your driving journey and inspire others on the road.
            </p>
            <button 
              className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition"
              onClick={() => {/* Add upload logic here */}}
            >
              Upload Your First Reel
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div 
                  key={video._id} 
                  className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 cursor-pointer group"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="relative">
                    <video
                      src={video.videoUrl}
                      className="w-full aspect-video object-cover"
                      poster={video.thumbnail}
                      muted
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Play size={60} className="text-white drop-shadow-2xl" />
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-gray-300 line-clamp-2 mb-4 text-[15px] leading-relaxed">
                      {video.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {/* <User size={16} /> */}
                        <span className="truncate">
                          {video.user?.firstName} {video.user?.lastName}
                        </span>
                      </div>

                      <div className="flex items-center gap-5">
                        {/* <div className="flex items-center gap-1">
                          <Heart size={16} className="text-red-500" />
                          <span>{video.likes?.length || 0}</span>
                        </div> */}
                        {/* <div className="flex items-center gap-1">
                          <Eye size={16} />
                          <span>{video.views || 0}</span>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-10 py-3.5 rounded-2xl transition font-medium"
                >
                  Load More Videos
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Video Player Modal ── */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-gray-900 rounded-3xl overflow-hidden border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close / back button */}
              <button
                onClick={() => setActiveVideo(null)}
                aria-label="Close video"
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition"
              >
                <X size={20} />
              </button>

              <video
                src={activeVideo.videoUrl}
                poster={activeVideo.thumbnail}
                className="w-full aspect-video bg-black"
                controls
                autoPlay
              />

              <div className="p-5">
                <p className="text-gray-300 leading-relaxed mb-3">
                  {activeVideo.description}
                </p>
                <span className="text-sm text-gray-500 truncate">
                  {activeVideo.user?.firstName} {activeVideo.user?.lastName}
                </span>
              </div>

              {/* Back button, explicit alternative to the X */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => setActiveVideo(null)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-2xl transition font-medium"
                >
                  Back to videos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoFeed;