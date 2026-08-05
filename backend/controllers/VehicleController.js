
import axios from 'axios';

import VehicleLicenseApplication from '../models/vehicleLicense.js';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Initiate payment
export const initiateVehicleLicensePayment = async (req, res) => {
  const { type, applicationData } = req.body;
  const userId = req.user._id;

  const amount = type === 'renewal' ? 2000000 : 5000000; // kobo

  try {
    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email,
        amount,
        reference: `veh_license_${type}_${Date.now()}_${userId}`,
        callback_url: `${process.env.BACKEND_URL}/api/vehicle-license/callback`,
        metadata: { userId: userId.toString(), type, applicationData: JSON.stringify(applicationData) },
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    // Save pending application
    const app = new VehicleLicenseApplication({
      user: userId,
      type,
      ...applicationData,
      paymentRef: paystackRes.data.data.reference,
      amountPaid: amount / 100,
    });
    await app.save();

    res.json({ success: true, authorization_url: paystackRes.data.data.authorization_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify payment
export const verifyVehicleLicensePayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    if (verifyRes.data.data.status === 'success') {
      await VehicleLicenseApplication.findOneAndUpdate(
        { paymentRef: reference },
        { status: 'submitted' }
      );

      res.redirect(`${process.env.CLIENT_URL}/dashboard?status=success`);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/dashboard?status=failed`);
    }
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/dashboard?status=error`);
  }
};

// Admin: Get submitted applications
export const getSubmittedVehicleLicenses = async (req, res) => {
  try {
    const apps = await VehicleLicenseApplication.find({})
      .populate('user', 'firstName lastName email phone')
     
console.log("Fetched Vehicle License Applications:", apps);
    res.json({ success: true, applications: apps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Confirm application (set to processing)
export const confirmVehicleLicense = async (req, res) => {
  const { applicationId } = req.params;

  try {
    await VehicleLicenseApplication.findByIdAndUpdate(applicationId, {
      status: 'processing',
      confirmedAt: new Date(),
    });
    res.json({ success: true, message: 'Application confirmed and in processing' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMyVehicleLicenseApplications = async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await VehicleLicenseApplication.find({ user: userId })
      .sort({ submittedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    console.error('Get my vehicle licenses error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Update application status (ready, rejected, etc.)
export const updateVehicleLicenseStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status, rejectionReason } = req.body;

  try {
    const validStatuses = ['payment-pending', 'submitted', 'processing', 'ready', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData = {
      status,
      processedAt: new Date(),
    };

    if (status === 'rejected') {
      if (!rejectionReason?.trim()) {
        return res.status(400).json({ success: false, message: 'Rejection reason is required' });
      }
      updateData.rejectionReason = rejectionReason.trim();
      updateData.rejectedAt = new Date();
    } else if (status === 'ready') {
      updateData.rejectedAt = null;
      updateData.rejectionReason = null;
    }

    const updatedApp = await VehicleLicenseApplication.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedApp) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({
      success: true,
      message: `Application updated to ${status}`,
      application: updatedApp,
    });
  } catch (err) {
    console.error('Update vehicle license status error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Get applications filtered by status (optional query param)
export const getVehicleLicenseApplications = async (req, res) => {
  try {
    const { status } = req.query; // optional: ?status=processing, ?status=ready, etc.

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const applications = await VehicleLicenseApplication.find(filter)
      .populate('user', 'firstName lastName email phone avatar')
      .sort({ submittedAt: -1 })
      .lean();

    console.log(`Fetched ${applications.length} vehicle license applications (filter: ${status || 'all'})`);

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    console.error('Get vehicle license applications error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};