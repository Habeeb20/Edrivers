import LicenseApplication from '../models/driversLicense.js';


import axios from 'axios';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Initiate payment and save pending application
export const initiateLicensePayment = async (req, res) => {
  const { type, applicationData } = req.body;
  console.log(req.body)
  const userId = req.user._id;

  const amount = type === 'renewal' ? 2000000 : 5000000; 

  try {
    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email,
        amount,
        reference: `license_${type}_${Date.now()}_${userId}`,
        callback_url: `${process.env.CLIENT_URL}/dashboard`,
        metadata: { userId: userId.toString(), type, applicationData: JSON.stringify(applicationData) },
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    // Save pending application
  const pendingApp = new LicenseApplication({
  user: userId,
  type,
  fullname: applicationData.fullName,
  dob: new Date(applicationData.dateOfBirth),
  gender: applicationData.gender,
  bloodGroup: applicationData.bloodGroup,
  address: applicationData.address,
  phone: applicationData.phone,
  email: applicationData.email,
  photo: applicationData.photo,
  signature: applicationData.signature,
  licenseType: type,
  paymentRef: paystackRes.data.data.reference,
  status: 'payment-pending',
});
    await pendingApp.save();

    res.json({
      success: true,
      authorization_url: paystackRes.data.data.authorization_url,
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
};

// Verify payment and activate application
export const verifyLicensePayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    if (verifyRes.data.data.status === 'success') {
      const app = await LicenseApplication.findOneAndUpdate(
        { paymentRef: reference },
        { status: 'submitted' },
        { new: true }
      );

      res.redirect(`${process.env.CLIENT_URL}/apply-license?status=success`);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/apply-license?status=failed`);
    }
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/apply-license?status=error`);
  }
};
// User submits application
export const applyForLicense = async (req, res) => {
  const userId = req.user._id;
  const { type, fullName, dateOfBirth, gender, bloodGroup, nationality, address, phone, email, photo, signature, licenseNumber, expiryDate } = req.body;

  try {
    const application = new LicenseApplication({
      user: userId,
      type,
      fullName,
      dateOfBirth,
      gender,
      bloodGroup,
      nationality,
      address,
      phone,
      email,
      photo,
      signature,
      licenseNumber: type === 'renewal' ? licenseNumber : undefined,
      expiryDate: type === 'renewal' ? expiryDate : undefined,
    });
    await application.save();

    res.json({ success: true, message: 'Application submitted. Awaiting admin confirmation.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all submitted applications
export const getSubmittedApplications = async (req, res) => {
  try {
    const applications = await LicenseApplication.find({  })
      .populate('user', 'firstName lastName email phone')
      .sort({ submittedAt: -1 });

    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Confirm application (set to processing)
export const confirmApplication = async (req, res) => {
  const { applicationId } = req.params;

  try {
    const application = await LicenseApplication.findById(applicationId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = 'processing';
    application.confirmedAt = new Date();
    await application.save();

    res.json({ success: true, message: 'Application confirmed and in processing' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};