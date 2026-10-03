import express from 'express';
import Hire from "../models/Hire.js"
import Review from "../models/Review.js"
import {protect} from "../middleware/verifyToken.js"

const router = express.Router();

// Client reviews the driver after a hire has ended
router.post('/', protect, async (req, res) => {
  try {
    const { hireId, rating, comment } = req.body;
    const hire = await Hire.findById(hireId);
    if (!hire || String(hire.client) !== String(req.user._id)) return res.status(404).json({ success: false, message: 'Hire not found' });
    if (hire.status !== 'ended') return res.status(400).json({ success: false, message: 'You can review a driver once the hire has ended' });
    if (await Review.exists({ hire: hire._id })) return res.status(409).json({ success: false, message: 'You already reviewed this hire' });
    const review = await Review.create({ hire: hire._id, client: hire.client, driver: hire.driver, rating, comment });
    res.status(201).json({ success: true, data: review });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Public: reviews for a driver
router.get('/driver/:driverId', async (req, res) => {
  const data = await Review.find({ driver: req.params.driverId }).sort('-createdAt').limit(50).populate('client', 'firstName lastName avatar').lean();
  res.json({ success: true, data });
});

export default router;