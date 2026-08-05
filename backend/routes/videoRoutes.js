

import express from "express"

import { createVideo, getVideos } from "../controllers/VideoController.js";
import { protect } from "../middleware/verifyToken.js";
const router = express.Router()
router.post('/', protect, createVideo);
router.get('/',  getVideos); // or make public if you want

export default  router;