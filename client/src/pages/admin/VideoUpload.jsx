




import React, { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import CloudinaryUpload from './../../CloudinaryUpload';


const PostVideoForm = () => {
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');        // ← Cloudinary URL
  const [cloudinaryUploading, setCloudinaryUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';


  const handleUploadStart = () => {
    setCloudinaryUploading(true);
    setVideoUrl(''); // clear previous url when new upload starts
  };

  const handleUploadComplete = (url, publicId) => {
    console.log('Cloudinary upload finished → URL:', url);
    setVideoUrl(url);
    setCloudinaryUploading(false);
    toast.success('Video uploaded to Cloudinary');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoUrl) {
      toast.error('No video URL available. Please upload a video.');
      return;
    }

    if (!description.trim()) {
      toast.error('Please add a description');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem( 'adminToken');
console.log(token)
      await axios.post(
        `${API_URL}/api/videos`,
        {
          videoUrl,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Video posted successfully!');

      // Reset form
      setDescription('');
      setVideoUrl('');
    } catch (err) {
      console.error('Backend submit error:', err);
      toast.error(err.response?.data?.message || 'Failed to post video');
    } finally {
      setSubmitting(false);
    }
  };

  // Button should be disabled only when:
  // - uploading to Cloudinary OR
  // - submitting to backend OR
  // - no video OR
  // - no description
  const isButtonDisabled =
    cloudinaryUploading || submitting || !videoUrl || !description.trim();

  const buttonText = (() => {
    if (cloudinaryUploading) return 'Uploading video to Cloudinary...';
    if (submitting) return 'Posting...';
    return 'Post Video';
  })();

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-gray-900 rounded-2xl border border-gray-700 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Post a Video</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CloudinaryUpload
          onUploadStart={handleUploadStart}
          onUploadComplete={handleUploadComplete}
          accept="video/*"
          maxSizeMB={150}
          label="Upload Video"
          folder="videos"
        />

        {videoUrl && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-800 rounded-lg">
            <p className="text-sm text-emerald-400 mb-2">Video ready:</p>
            <video src={videoUrl} controls className="w-full max-h-64 rounded" />
          </div>
        )}

        <div>
          <label className="block text-gray-300 mb-2 font-medium">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your video..."
            rows={4}
            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600 resize-none"
            maxLength={400}
          />
          <p className="text-right text-sm text-gray-500 mt-1">
            {description.length} / 400
          </p>
        </div>

        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`
            w-full py-4 rounded-xl font-semibold transition-all text-lg
            ${
              isButtonDisabled
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30'
            }
          `}
        >
          {buttonText}
        </button>
      </form>

      {/* Debug helper - remove later */}
      <div className="mt-6 text-xs text-gray-500">
        Debug: videoUrl = {videoUrl ? 'set' : 'not set'} | uploading = {cloudinaryUploading ? 'yes' : 'no'}
      </div>
    </div>
  );
};

export default PostVideoForm;