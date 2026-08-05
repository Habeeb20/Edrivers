import express from "express"
import { protect, superadmin } from "../middleware/verifyToken.js";
import { getDistancePricing, upsertDistancePricing, deleteDistancePricing } from "../controllers/distancePricingController.js";
const router = express.Router()


// Distance-based pricing
router.get('/', getDistancePricing);
router.put('/', protect, superadmin, upsertDistancePricing);
router.delete('/:category', protect, superadmin, deleteDistancePricing);


export default router 