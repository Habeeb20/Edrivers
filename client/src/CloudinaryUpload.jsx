// src/components/CloudinaryUpload.jsx
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CloudinaryUpload = ({
  onUploadComplete,         // (url, publicId) => void
  onUploadStart = () => {}, // called when upload starts
  preset = UPLOAD_PRESET,
  folder = 'posts',
  accept = 'image/*,video/*',
  maxSizeMB = 50,
  label = 'Upload media',
  currentUrl,
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Size validation
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Maximum ${maxSizeMB}MB allowed.`);
      return;
    }

    setFile(selectedFile);

    // Create preview (only for images)
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      // For videos or other types — we can show a placeholder or file name
      setPreview(null);
    }

    // Auto-upload when file is selected
    uploadFile(selectedFile);
  }, [maxSizeMB]);

  const uploadFile = async (selectedFile) => {
    if (!selectedFile) return;

    if (!CLOUD_NAME || !preset) {
      toast.error('Cloudinary configuration is missing');
      console.error('Missing Cloudinary env variables');
      return;
    }

    onUploadStart();
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('upload_preset', preset);
    if (folder) formData.append('folder', folder);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url && data.public_id) {
            toast.success('Upload successful!');
            onUploadComplete(data.secure_url, data.public_id);
            setPreview(data.secure_url);
          } else {
            throw new Error('No secure_url or public_id returned');
          }
        } else {
          throw new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`);
        }
      };

      xhr.onerror = () => {
        toast.error('Network error during upload');
      };

      xhr.send(formData);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(currentUrl || null);
  };

  return (
    <div className="space-y-4">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}

      {/* Preview / Upload area */}
      {preview || file ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {preview && preview.startsWith('data:image') ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              {uploading ? 'Uploading...' : 'Media selected'}
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">{progress}%</p>
              </div>
            </div>
          )}

          <button
            onClick={clearFile}
            disabled={uploading}
            className="absolute top-3 right-3 p-2 bg-black/70 rounded-full text-white hover:bg-black/90 transition disabled:opacity-50"
            title="Remove file"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, MP4, WebM (max {maxSizeMB}MB)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
};

export default CloudinaryUpload;