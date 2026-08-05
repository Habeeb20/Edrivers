
import TrainingRegistration from '../models/TrainingRegistration.js';
export const registerForTraining = async (req, res) => {
  const {
    fullName, email, phone, dateOfBirth, address, city, state,
    previousExperience, preferredSchedule, referralSource
  } = req.body;

  try {
    const existing = await TrainingRegistration.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'You have already registered for training' });
    }

    const registration = new TrainingRegistration({
      fullName, email, phone, dateOfBirth, address, city, state,
      previousExperience, preferredSchedule, referralSource,
    });

    await registration.save();

    // TODO: Send confirmation email

    res.json({ success: true, message: 'Registration successful! We will contact you soon.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all registrations
export const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await TrainingRegistration.find()
      .sort({ registeredAt: -1 });

    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




 
export const updateRegistrationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'in-training', 'completed', 'certified'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
    });
  }

  try {
    const registration = await TrainingRegistration.findById(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Optional: prevent going backwards (you can remove this if not needed)
    const statusOrder = {
      pending: 1,
      confirmed: 2,
      'in-training': 3,
      completed: 4,
      certified: 5
    };

    if (statusOrder[status] < statusOrder[registration.status]) {
      return res.status(400).json({
        success: false,
        message: `Cannot move status backwards from ${registration.status} to ${status}`
      });
    }

    registration.status = status;
    await registration.save();

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      registration
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};