import mongoose from 'mongoose';
const { Schema } = mongoose;

const reviewSchema = new Schema({
  hire: { type: Schema.Types.ObjectId, ref: 'Hire', required: true, unique: true }, // one review per hire
  client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  driver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000 },
}, { timestamps: true });

// Keep User.rating (the driver's average) in sync
reviewSchema.post('save', async function () {
  const [agg] = await mongoose.model('Review').aggregate([
    { $match: { driver: this.driver } },
    { $group: { _id: '$driver', avg: { $avg: '$rating' } } },
  ]);
  await mongoose.model('User').updateOne({ _id: this.driver }, { rating: Math.round((agg?.avg || 0) * 10) / 10 });
});

export default mongoose.model('Review', reviewSchema);