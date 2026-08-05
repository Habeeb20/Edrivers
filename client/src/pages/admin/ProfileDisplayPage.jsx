import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfileDisplay from '../Dashboard/ProfileDisplay';
import { Loader2, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const [fullProfile, setFullProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Grab token from wherever you store it
        const token = localStorage.getItem('adminToken'); 

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/profiledisplay`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Based on our controller, the data is in response.data.data
        setFullProfile(response.data.data);
        console.log(response.data)
        setError(null);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.response?.data?.message || "Could not load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-500">Loading your profile details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-800">Oops!</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      {fullProfile ? (
        <ProfileDisplay fullData={fullProfile} />
      ) : (
        <div className="text-center text-gray-500">No profile data found.</div>
      )}
    </div>
  );
};

export default ProfilePage;