
import Video from "../models/Video.js"
export const createVideo = async (req, res) => {
  try {

    const user = req.user.id
    
    
    const { videoUrl, description } = req.body;

    if (!videoUrl || !description?.trim()) {
      return res.status(400).json({ message: 'Video URL and description are required' });
    }

    const video = await Video.create({
      user: req.user.id,         
      videoUrl,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Video posted successfully',
      video,
    });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getVideos = async (req, res) => {
  try {
    // Sort by newest first, limit if needed later
    const videos = await Video.find({})
      .sort({ createdAt: -1 })          // newest first
      .select('videoUrl description user createdAt') // only needed fields
      .populate('user', 'companyName username'); // optional: show company name

    return res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};