// utils/profileCompletion.js

// Fields required for every role
const BASE_REQUIRED_FIELDS = ['phone', 'address', 'state', 'lga', 'dateOfBirth'];

// Extra fields required only for drivers
const DRIVER_VEHICLE_FIELDS = ['make', 'model', 'year', 'licensePlate'];

export const getMissingProfileFields = (user) => {
  if (!user) return [...BASE_REQUIRED_FIELDS];

  const missing = BASE_REQUIRED_FIELDS.filter((field) => !user[field]);

  if (user.role === 'driver') {
    DRIVER_VEHICLE_FIELDS.forEach((field) => {
      if (!user.vehicle?.[field]) missing.push(`vehicle.${field}`);
    });
  }

  return missing;
};

export const isProfileComplete = (user) => getMissingProfileFields(user).length === 0;