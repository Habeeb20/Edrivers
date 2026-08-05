// backend/controllers/rentCarController.js
import Car from '../models/car.js';
import User from '../models/User.js';
import Rental from '../models/rental.js';
import axios from 'axios';


const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Owner posts car for rent
// export const postCarForRent = async (req, res) => {
//   const {
//     make, model, year, color, plateNumber, transmission, fuelType,
//     photos, documents, rentalPrice, location
//   } = req.body;
//   const ownerId = req.user._id;

//   try {
//     const car = new Car({
//       owner: ownerId,
//       make, model, year, color, plateNumber, transmission, fuelType,
//       photos, documents, rentalPrice, location,
//     });
//     await car.save();

//     res.json({ success: true, message: 'Car posted for rent. Awaiting approval.' });
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ message: err.message });
//   }
// };
// backend/controllers/rentCarController.js

export const postCarForRent = async (req, res) => {
  const {
    make, model, year, color, plateNumber, transmission, fuelType,
    photos, documents, 
    hasAirCondition,
    rentalPriceWithFuel,
    rentalPriceWithoutFuel,
    driver,           // { name, contactNumber, photo, yearsOfExperience }
    location
  } = req.body;

  const ownerId = req.user._id;

  try {
    const car = new Car({
      owner: ownerId,
      make, model, year, color, plateNumber, transmission, fuelType,
      photos, 
      documents,
      hasAirCondition: hasAirCondition ?? true,
      rentalPriceWithFuel,
      rentalPriceWithoutFuel,
      driver,
      location,
      // rentalPrice can be removed or kept as average if needed
    });

    await car.save();

    res.json({ 
      success: true, 
      message: 'Car posted for rent. Awaiting admin approval.',
      carId: car._id 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Add this new function
export const addCarInspection = async (req, res) => {
  const { carId } = req.params;
  const { grade, condition, rating, notes } = req.body;
  const adminId = req.user._id;

  try {
    if (!['A', 'B', 'C', 'D', 'E'].includes(grade)) {
      return res.status(400).json({ message: 'Invalid grade. Must be A, B, C, D or E' });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    car.inspection = {
      grade,
      condition,
      rating: Number(rating),
      inspectedBy: adminId,
      inspectedAt: new Date(),
      notes: notes || '',
    };

    // Optionally auto-approve if grade is good enough (A, B, C)
    if (['A', 'B', 'C'].includes(grade) && car.status === 'pending') {
      car.status = 'approved';
      car.approvedAt = new Date();
    }

    await car.save();

    res.json({ 
      success: true, 
      message: 'Inspection added successfully',
      inspection: car.inspection 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
// Superadmin: Get pending cars
export const getPendingCars = async (req, res) => {
  try {
    const cars = await Car.find({ status: 'pending' })
      .populate('owner', 'firstName lastName email phone')
      .sort({ postedAt: -1 });

    res.json({ success: true, cars });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Superadmin: Approve/Decline car
export const manageCar = async (req, res) => {
  const { carId } = req.params;
  const { action, reason } = req.body;

  try {
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    if (action === 'approve') {
      car.status = 'approved';
      car.approvedAt = new Date();
    } else if (action === 'decline') {
      car.status = 'declined';
      car.declinedAt = new Date();
      car.declineReason = reason;
    }

    await car.save();
    res.json({ success: true, message: `Car ${action}d` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get approved cars (for clients)
export const getApprovedCars = async (req, res) => {
  try {
    const cars = await Car.find({ status: 'approved', available: true })
      .populate('owner', 'firstName lastName')
      .sort({ rentalPrice: 1 });

    res.json({ success: true, cars });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Client rents a car
// export const rentCar = async (req, res) => {
//   const { carId, location, fullname, durationDays, destination } = req.body;
//   const renterId = req.user._id;

//   try {
//     const car = await Car.findById(carId);
//     if (!car || car.status !== 'approved' || !car.available) {
//       return res.status(400).json({ message: 'Car not available' });
//     }

//     const totalAmount = car.rentalPrice * durationDays;

//     const paystackRes = await axios.post(
//       'https://api.paystack.co/transaction/initialize',
//       {
//         email: req.user.email,
//         amount: totalAmount * 100,
//         reference: `rent_${Date.now()}_${renterId}`,
//         callback_url: `${process.env.BACKEND_URL}/api/rent-car/callback`,
//         metadata: { renterId, carId, durationDays, totalAmount },
//       },
//       { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
//     );

//     // Save pending rental
//     const rental = new Rental({
//       car: carId,
//       renter: renterId,
//       location,
//       fullname,
//       durationDays,
//       destination,
//       totalAmount,
//       paymentRef: paystackRes.data.data.reference,
//     });
//     await rental.save();

//     res.json({ success: true, authorization_url: paystackRes.data.data.authorization_url });
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ message: err.message });
//   }
// };


export const rentCar = async (req, res) => {
  const { 
    carId, 
    location, 
    fullname, 
    durationDays, 
    destination,
    reasonForRent     // ← NEW FIELD
  } = req.body;

  const renterId = req.user._id;

  try {
    const car = await Car.findById(carId);
    if (!car || car.status !== 'approved' || !car.available) {
      return res.status(400).json({ message: 'Car not available' });
    }

    const totalAmount = car.rentalPriceWithFuel * durationDays; // or let frontend choose with/without fuel

    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email,
        amount: totalAmount * 100,
        reference: `rent_${Date.now()}_${renterId}`,
        callback_url: `${process.env.BACKEND_URL}/api/rent-car/callback`,
        metadata: { 
          renterId, 
          carId, 
          durationDays, 
          totalAmount,
          reasonForRent 
        },
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const rental = new Rental({
      car: carId,
      renter: renterId,
      location,
      fullname,
      durationDays,
      destination,
      reasonForRent,           // ← Save the reason
      totalAmount,
      paymentRef: paystackRes.data.data.reference,
    });

    await rental.save();

    res.json({ 
      success: true, 
      authorization_url: paystackRes.data.data.authorization_url 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Verify payment & activate rental
export const verifyRentalPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    if (verifyRes.data.data.status === 'success') {

      const rental = await Rental.findOneAndUpdate(
        { paymentRef: reference },
        { status: 'active', startedAt: new Date() },
        { new: true }
      );

      if (!rental) {
        return res.redirect(`${process.env.CLIENT_URL}/dashboard?status=error`);
      }

      // ✅ Mark car as unavailable
      await Car.findByIdAndUpdate(rental.car, {
        available: false
      });

      res.redirect(`${process.env.CLIENT_URL}/dashboard`);

    } else {
      res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }

  } catch (err) {
    console.log(err);
    res.redirect(`${process.env.CLIENT_URL}/dashboard?status=error`);
  }
};
// Get cars posted by logged-in owner
export const getMyCars = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const cars = await Car.find({ owner: ownerId })
      .sort({ postedAt: -1 });

    res.json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






export const updateMyCar = async (req, res) => {
  const { carId } = req.params;
  const ownerId = req.user._id;

  try {
    const car = await Car.findOne({ _id: carId, owner: ownerId });
    if (!car) {
      return res.status(404).json({ message: 'Car not found or unauthorized' });
    }

    if (!car.available) {
      return res.status(400).json({ message: 'Car is currently rented and cannot be edited' });
    }

    Object.assign(car, req.body);

    // Re-approval needed after edit
    car.status = 'pending';
    car.approvedAt = null;
    car.declinedAt = null;
    car.declineReason = null;

    await car.save();

    res.json({ success: true, message: 'Car updated. Awaiting re-approval.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};









export const deleteMyCar = async (req, res) => {
  const { carId } = req.params;
  const ownerId = req.user._id;

  try {
    // Check ownership + availability
    const car = await Car.findOne({ _id: carId, owner: ownerId });
    if (!car) {
      return res.status(404).json({ message: 'Car not found or unauthorized' });
    }

    if (!car.available) {
      return res.status(400).json({ message: 'Car is currently rented' });
    }

    await Car.findOneAndDelete({ _id: carId, owner: ownerId });

    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const getAllPaidRentals = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin access required' });
    }

    const rentals = await Rental.find({})
      .populate('renter', 'firstName lastName email phone avatar')
      .populate({
        path: 'car',
        select: 'make model year plateNumber rentalPrice owner status',
        populate: {
          path: 'owner',
          select: 'firstName lastName email phone avatar', // ← add avatar if you want
        },
      })
      .sort({ rentedAt: -1 })
      .lean(); // ← .lean() makes it plain JS objects → better performance + cleaner logs

    // Optional: better logging
    if (rentals.length > 0) {
      console.log("First rental owner:", {
        carId: rentals[0].car?._id,
        ownerId: rentals[0].car?.owner?._id,
        ownerName: rentals[0].car?.owner
          ? `${rentals[0].car.owner.firstName} ${rentals[0].car.owner.lastName}`
          : 'No owner populated',
      });
    }

    const formattedRentals = rentals.map((rental) => ({
      _id: rental._id,
      renter: rental.renter
        ? {
            _id: rental.renter._id,
            name: `${rental.renter.firstName} ${rental.renter.lastName}`.trim(),
            email: rental.renter.email || 'N/A',
            phone: rental.renter.phone || 'N/A',
            avatar: rental.renter.avatar || null,
          }
        : { name: 'Deleted User', email: 'N/A', phone: 'N/A', avatar: null },

      car: rental.car
        ? {
            _id: rental.car._id,
            make: rental.car.make || 'N/A',
            model: rental.car.model || 'N/A',
            year: rental.car.year || 'N/A',
            status: rental.car.status || 'N/A',
            plateNumber: rental.car.plateNumber || 'N/A',
            dailyPrice: rental.car.rentalPrice || 0,
            owner: rental.car.owner
              ? {
                  _id: rental.car.owner._id,
                  name: `${rental.car.owner.firstName || ''} ${rental.car.owner.lastName || ''}`.trim(),
                  email: rental.car.owner.email || 'N/A',
                  phone: rental.car.owner.phone || 'N/A',
                  avatar: rental.car.owner.avatar || null,
                }
              : { name: 'Unknown Owner', email: 'N/A', phone: 'N/A' },
          }
        : {
            make: 'Car Deleted',
            model: 'N/A',
            year: 'N/A',
            plateNumber: 'N/A',
            dailyPrice: 0,
            owner: { name: 'Unknown' },
          },

      rentalDetails: {
        location: rental.location || 'N/A',
        fullname: rental.fullname || 'N/A',
        durationDays: rental.durationDays || 0,
        destination: rental.destination || 'N/A',
        totalAmount: rental.totalAmount || 0,
        paymentRef: rental.paymentRef || 'N/A',
        status: rental.status || 'unknown',
        rentedAt: rental.rentedAt,
        startedAt: rental.startedAt || null,
      },
    }));

    res.json({
      success: true,
      count: formattedRentals.length,
      rentals: formattedRentals,
    });
  } catch (error) {
    console.error('Get paid rentals error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


export const getMyRentals = async (req, res) => {
  try {
    const renterId = req.user._id;

    const rentals = await Rental.find({ renter: renterId })
      .populate({
        path: 'car',
        select: 'make model year plateNumber rentalPrice location photos owner status',
        populate: {
          path: 'owner',
          select: 'firstName lastName email phone avatar',
        },
      })
      .populate('renter', 'firstName lastName email phone avatar') // optional – you already know who you are
      .sort({ rentedAt: -1 }) // newest first
      .lean(); // faster + cleaner plain objects
console.log(rentals)
    // Format response (similar style to your getAllPaidRentals)
    const formattedRentals = rentals.map((rental) => ({
      _id: rental._id,
      rentalId: rental.rentalId || 'N/A', // if you have this field
      car: rental.car
        ? {
            _id: rental.car._id,
            make: rental.car.make || 'N/A',
            model: rental.car.model || 'N/A',
            year: rental.car.year || 'N/A',
            plateNumber: rental.car.plateNumber || 'N/A',
            dailyPrice: rental.car.rentalPrice || 0,
            location: rental.car.location || 'N/A',
            photos: rental.car.photos || [],
            status: rental.car.status || 'unknown',
            owner: rental.car.owner
              ? {
                  _id: rental.car.owner._id,
                  name: `${rental.car.owner.firstName || ''} ${rental.car.owner.lastName || ''}`.trim(),
                  email: rental.car.owner.email || 'N/A',
                  phone: rental.car.owner.phone || 'N/A',
                  avatar: rental.car.owner.avatar || null,
                }
              : { name: 'Unknown Owner' },
          }
        : {
            make: 'Car Deleted',
            model: 'N/A',
            year: 'N/A',
            plateNumber: 'N/A',
            dailyPrice: 0,
            owner: { name: 'Unknown' },
          },

      rentalDetails: {
        location: rental.location || 'N/A',
        fullname: rental.fullname || 'N/A',
        durationDays: rental.durationDays || 0,
        destination: rental.destination || 'N/A',
        totalAmount: rental.totalAmount || 0,
        paymentRef: rental.paymentRef || 'N/A',
        status: rental.status || 'unknown', // pending / paid / active / completed / cancelled ...
        rentedAt: rental.rentedAt,
        startedAt: rental.startedAt || null,
        // Optional: add endedAt / returnedAt if your schema has it
      },

      // Optional – useful for the renter
      renter: rental.renter
        ? {
            name: `${rental.renter.firstName || ''} ${rental.renter.lastName || ''}`.trim(),
            email: rental.renter.email || 'N/A',
            phone: rental.renter.phone || 'N/A',
            avatar: rental.renter.avatar || null,
          }
        : null,
    }));

    res.json({
      success: true,
      count: formattedRentals.length,
      rentals: formattedRentals,
    });
  } catch (error) {
    console.error('Get my rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your rental history',
      error: error.message,
    });
  }
};