// backend/routes/rentCarRoutes.js
import express from 'express';
import { protect, superadmin } from '../middleware/verifyToken.js';
import { postCarForRent,  getPendingCars,
  manageCar,
  getApprovedCars,
  rentCar,
  verifyRentalPayment,
  getAllPaidRentals,
  getMyCars,
  updateMyCar,
  deleteMyCar,
  getMyRentals,
  addCarInspection,
 } from '../controllers/rentalController.js';
import { getAllHiredDrivers } from '../controllers/AdminController.js';


const router = express.Router();

// Owner posts a car for rent
router.post('/post-car', protect, postCarForRent);

router.get('/my-cars', protect, getMyCars);


router.put('/my-cars/:carId', protect, updateMyCar);


router.put('/inspect/:carId', protect, superadmin, addCarInspection);


router.delete('/my-cars/:carId', protect, deleteMyCar);

// Superadmin: View pending cars for approval
router.get('/pending-cars', protect, superadmin, getPendingCars);

// Superadmin: Approve or decline a car
router.put('/manage-car/:carId', protect, superadmin, manageCar);

// Clients: View approved & available cars
router.get('/approved-cars', getApprovedCars); // ← Can be public or protected. If protected: add `protect`
// router.get('/approved-cars', protect, getApprovedCars); // Uncomment if you want only logged-in users

// Client rents a car (initiates payment)
router.post('/rent', protect, rentCar);


///get the cars i have rented/ paid for
router.get('/rentedcars', protect, getMyRentals);

// Paystack callback (no auth needed — Paystack calls it directly)
router.get('/callback', verifyRentalPayment);

// Superadmin: View all currently hired drivers (from any hire type)
router.get('/hired-drivers', protect, superadmin, getAllHiredDrivers);



// backend/routes/rentCarRoutes.js
router.get('/admin/paid-rentals', protect, superadmin, getAllPaidRentals);
export default router;