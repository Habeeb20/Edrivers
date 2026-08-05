
import axios from 'axios';
import Task from '../models/task.js';
import User from "../models/User.js"
import DriverProfile from "../models/driverProfile.js"
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Client posts a task + pays ₦5,000
export const postTask = async (req, res) => {
  const { description, visibility } = req.body;
  const clientId = req.user._id;

  try {
    const client = await User.findById(clientId);
    if (client.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can post tasks' });
    }

    // Initialize Paystack
    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: client.email,
        amount: 500000, // ₦5,000 in kobo
        reference: `task_${Date.now()}_${clientId}`,
        callback_url: `${process.env.CLIENT_URL}/dashboard`,
        metadata: { clientId: clientId.toString(), description, visibility },
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    // Save task as pending
    const task = new Task({
      client: clientId,
      description,
      visibility,
      paymentRef: paystackRes.data.data.reference,
    });
    await task.save();

    res.json({
      success: true,
      authorization_url: paystackRes.data.data.authorization_url,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify payment & mark task pending approval
export const verifyTaskPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    if (verifyRes.data.data.status === 'success') {
      const task = await Task.findOneAndUpdate(
        { paymentRef: reference },
        { status: 'pending' },
        { new: true }
      );

      res.redirect(`${process.env.CLIENT_URL}/client/tasks?status=success`);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/client/tasks?status=failed`);
    }
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/client/tasks?status=error`);
  }
};

// Superadmin: Get all pending tasks
export const getPendingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'pending' })
      .populate('client', 'firstName lastName email phone avatar')
      .sort({ postedAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Superadmin: Approve/Decline task
export const manageTask = async (req, res) => {
  const { taskId } = req.params;
  const { action, reason } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (action === 'approve') {
      task.status = 'approved';
      task.approvedAt = new Date();
    } else if (action === 'decline') {
      task.status = 'declined';
      task.declinedAt = new Date();
      task.declineReason = reason;
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await task.save();
    res.json({ success: true, message: `Task ${action}d` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Drivers: Get approved tasks based on category
export const getAvailableTasks = async (req, res) => {
  try {
    const driver = await User.findById(req.user._id);
    const profile = await DriverProfile.findOne({ user: req.user._id });

    if (!profile) return res.json({ success: true, tasks: [] });

    let query = { status: 'approved' };

    if (driver.fulltimeHire?.subscriptionStatus === 'approved') {
      // Fulltime drivers see all + full-time specific
      query.visibility = { $in: [ 'full-time'] };
    } else {
      // Short-term drivers see all + short-term
      const hasShortTerm = profile.categories.some(cat => 
        ['part-time', 'weekend', 'short-time', 'airport-pickup', 'outstation-travel'].includes(cat)
      );
      if (hasShortTerm) {
        query.visibility = { $in: ['all', 'short-term'] };
      } else {
        query.visibility = 'all';
      }
    }

    const tasks = await Task.find(query)
      .populate('client', 'firstName lastName email phone avatar')
      .sort({ postedAt: -1 });

    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// GET /api/tasks/my-tasks
export const getMyTasks = async (req, res) => {
  try {
    const clientId = req.user._id;
console.log(clientId)
    const tasks = await Task.find({ client: clientId })
      .sort({ postedAt: -1 });
console.log(tasks)
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// GET /api/tasks/my-approved
export const getMyApprovedTasks = async (req, res) => {
  try {
    const clientId = req.user._id;

    const tasks = await Task.find({ client: clientId, status: 'approved' })
      .sort({ approvedAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
