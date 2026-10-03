import mongoose from 'mongoose';
const { Schema } = mongoose;
export default mongoose.model('AdminMessage', new Schema({
  to: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  hire: { type: Schema.Types.ObjectId, ref: 'Hire' },
  report: { type: Schema.Types.ObjectId, ref: 'Report' },
  subject: { type: String, required: true, trim: true, maxlength: 150 },
  body: { type: String, required: true, trim: true, maxlength: 3000 },
  readAt: Date,
}, { timestamps: true }));