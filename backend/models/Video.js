// models/Video.js
import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 400,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Video', videoSchema);