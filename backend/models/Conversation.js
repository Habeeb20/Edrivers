// models/Conversation.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  content: { type: String, required: true, trim: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],

hireId: {  // ← Changed from hireRequestId to hireId
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hire',           // ← Reference the new Hire model
    required: true,   
    
    unique: true,     // keep it required — it's the main link
  },

  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
  },

  messages: [messageSchema],
}, { timestamps: true });

// Ensure one conversation per hire request
conversationSchema.index({ hireRequestId: 1 }, { unique: false, default :"" , sparse: true,});
// Fast lookup by participants
conversationSchema.index({ participants: 1 });

export default mongoose.model('Conversation', conversationSchema);