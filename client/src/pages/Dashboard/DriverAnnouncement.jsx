// src/components/ProviderAnnouncements.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Clock,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const ProviderAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Fetch announcements for providers
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/announcements`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          targetRole: "provider",   // Only show announcements for providers
        },
      });

      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="text-red-500" size={24} />;
      case "warning":
        return <AlertTriangle className="text-amber-500" size={24} />;
      case "success":
        return <CheckCircle className="text-green-500" size={24} />;
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };

  const getPriorityBorder = (priority) => {
    if (priority === 3) return "border-l-4 border-red-500 bg-red-50";
    if (priority === 2) return "border-l-4 border-amber-500 bg-amber-50";
    return "border-l-4 border-blue-500 bg-blue-50";
  };

  const displayedAnnouncements = showAll ? announcements : announcements.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
          <span className="text-gray-600">Loading announcements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="text-indigo-600" size={26} />
          <h2 className="text-2xl font-semibold text-gray-900">Announcements</h2>
          {announcements.length > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
              {announcements.length}
            </span>
          )}
        </div>

        {announcements.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition"
          >
            {showAll ? "Show Less" : `View All (${announcements.length})`}
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="divide-y divide-gray-100">
        <AnimatePresence>
          {displayedAnnouncements.length > 0 ? (
            displayedAnnouncements.map((ann) => (
              <motion.div
                key={ann._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-6 ${getPriorityBorder(ann.priority)}`}
              >
                <div className="flex gap-4">
                  <div className="mt-1">{getTypeIcon(ann.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                        {ann.title}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap pt-1">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="mt-3 text-gray-700 leading-relaxed">
                      {ann.message}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} />
                      <span>Posted on {new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No announcements yet</p>
              <p className="text-gray-400 text-sm mt-1">We'll notify you when there are important updates</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {announcements.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 text-center text-xs text-gray-500 border-t">
          Announcements are important updates from the admin team
        </div>
      )}
    </div>
  );
};

export default ProviderAnnouncements;