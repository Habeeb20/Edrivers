import Announcement from '../models/announcement.js';

import User from "../models/User.js"

// @desc    Create new announcement (Admin only)
// @route   POST /api/announcements
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, type = 'info', priority = 1, targetRole = 'provider', expiresAt } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      type,
      priority,
      targetRole,
      expiresAt: expiresAt || null,
      postedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get announcements for current user
// @route   GET /api/announcements
export const getAnnouncements = async (req, res) => {
  try {
    const { targetRole = 'provider', limit = 10 } = req.query;

    const query = {
      isActive: true,
      $or: [
        { targetRole: 'all' },
        { targetRole }
      ]
    };

    // Auto expire old announcements
    await Announcement.updateMany(
      { expiresAt: { $lt: new Date() }, isActive: true },
      { isActive: false }
    );

    const announcements = await Announcement.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(Number(limit))
      .populate('postedBy', 'firstName lastName');

    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all announcements (Admin only)
// @route   GET /api/announcements/admin
export const getAllAnnouncementsAdmin = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate('postedBy', 'firstName lastName role');

    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update announcement (Admin only)
// @route   PUT /api/announcements/:id
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete announcement (Admin only)
// @route   DELETE /api/announcements/:id
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};