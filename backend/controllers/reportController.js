// controllers/reportController.js
import Report from '../models/report.js';
import Hire from '../models/Hire.js';

const REPORT_REASONS = [
  'harassment', 'no_show', 'unsafe_behavior', 'payment_issue',
  'inappropriate_conduct', 'fraud', 'other',
];

// Either party on a hire (client or driver) can report the other.
// The reported user is always derived server-side from the hire record —
// never trusted from the request body — so a caller can't report an
// arbitrary user by just changing an id.
export const reportHireParticipant = async (req, res) => {
  try {
    const { hireId, reason, details } = req.body;

    if (!hireId || !reason || !details?.trim()) {
      return res.status(400).json({ success: false, message: 'hireId, reason, and details are required' });
    }

    if (!REPORT_REASONS.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Invalid report reason' });
    }

    const hire = await Hire.findById(hireId);
    if (!hire) {
      return res.status(404).json({ success: false, message: 'Hire not found' });
    }

    const userId = req.user._id.toString();
    let reportedUser;
    if (hire.client.toString() === userId) {
      reportedUser = hire.driver;
    } else if (hire.driver.toString() === userId) {
      reportedUser = hire.client;
    } else {
      return res.status(403).json({ success: false, message: 'You are not part of this hire' });
    }

    const existing = await Report.findOne({ reporter: req.user._id, hire: hireId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reported this hire' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser,
      hire: hireId,
      reason,
      details: details.trim(),
    });

    res.status(201).json({ success: true, message: 'Report submitted. Our team will review it shortly.', report });
  } catch (error) {
    console.error('Report client error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already reported this hire' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Optional: let a driver see reports they've filed
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate('reportedUser', 'firstName lastName')
      .populate('hire', 'category date requestedAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};