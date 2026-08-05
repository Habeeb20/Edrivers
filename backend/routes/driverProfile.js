// backend/routes/driverRoutes.js
import express from 'express';
import { protect } from '../middleware/verifyToken.js';

import { updateDriverProfile, getDriverProfile, subscribeToPlan, getDriverProfileById } from '../controllers/DriverProfileController.js';
import DriverProfile from '../models/driverProfile.js';
import User from '../models/User.js';
const router = express.Router();


const getActiveDriverUserIds = async () => {
  const activeDrivers = await User.find({
    role: 'driver',
    status: 'active',
    isActive: true,
    isDeleted: false,
    isBlacklisted: false
  }).select('_id').lean();
  return activeDrivers.map(d => d._id);
};



// GET /api/driver/categories - Public
router.get('/categories', async (req, res) => {
  try {
    const activeDriverIds = await getActiveDriverUserIds();
    if (activeDriverIds.length === 0) {
      console.log('No active drivers found');
      return res.json([]);
    }

    const profiles = await DriverProfile.find({
      user: { $in: activeDriverIds },
      isAvailable: true
    }).select('categories').lean();

    const catMap = new Map();
    profiles.forEach(p => {
      if (p.categories && p.categories.length > 0) {
        p.categories.forEach(cat => {
          catMap.set(cat, (catMap.get(cat) || 0) + 1);
        });
      }
    });

    const categories = Array.from(catMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(c => c.count > 0);

    console.log('Public categories fetched:', categories);

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/driver?category=... - Public
router.get('/', async (req, res) => {
  try {
    const { category, limit = 10, page = 1 } = req.query;
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    const skip = (page - 1) * parseInt(limit);

    const activeDriverIds = await getActiveDriverUserIds();
    if (activeDriverIds.length === 0) {
      console.log('No active drivers for category:', category);
      return res.json({ drivers: [], total: 0 });
    }

    const profiles = await DriverProfile.find({
      user: { $in: activeDriverIds },
      categories: category,
      isAvailable: true // Fixed field name
    })
      .populate('user', 'firstName lastName avatar rating vehicle totalTrips earnings phone address dateOfBirth') // Fixed: Pure inclusions only
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Added for perf

    const validProfiles = profiles.filter(p => p.user);

    const formattedDrivers = validProfiles.map(dp => {
      const userData = dp.user.toObject ? dp.user.toObject() : dp.user;
      return {
        _id: userData._id || dp.user._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.avatar,
        rating: userData.rating || 0,
        yearsOfExperience: dp.yearsOfExperience,
        bio: dp.bio,
        expectedEarnings: dp.expectedEarnings,
        vehicle: userData.vehicle,
        languagesSpoken: dp.languagesSpoken,
        totalTrips: userData.totalTrips,
        earnings: userData.earnings,
        phone: userData.phone,
        address: userData.address,
        dateOfBirth: userData.dateOfBirth,
        transmission: dp.transmission,
        travelCapabilities: dp.travelCapabilities,
        isAvailable: dp.isAvailable,
      };
    });

    const total = await DriverProfile.countDocuments({
      user: { $in: activeDriverIds },
      categories: category,
      isAvailable: true
    });

    console.log(`Public drivers fetched for ${category}: ${formattedDrivers.length}`);

    res.json({ drivers: formattedDrivers, total });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});


router.get('/states', async (req, res) => {
  try {
    const activeDriverIds = await getActiveDriverUserIds();
    if (activeDriverIds.length === 0) {
      console.log('No active drivers found for states');
      return res.json([]);
    }

    // Aggregate states from User model (address.state)
    const stateAggregation = await User.aggregate([
      { $match: { _id: { $in: activeDriverIds } } },
      { $match: { 'state': { $exists: true, $ne: null, $ne: '' } } }, // Only with valid states
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { name: 1 } } // Alphabetical
    ]);

    const states = stateAggregation.filter(s => s.count > 0);

    console.log('Public states fetched:', states);

    res.json(states);
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});





// router.get('/search', async (req, res) => {
//   const {
//     categories,
//     transmission,
//     languages,
//     minExperience,
//     maxExperience,
//     minEarnings,
//     maxEarnings,
//     interstate,
//     international,
//     isAvailable,
//     limit = 20,
//     page = 1,
//     sort = '-createdAt', // newest first by default
//   } = req.query;

//   // Build MongoDB query object
//   const query = {
//     isAvailable: isAvailable === 'true' ? true : { $ne: false }, // default to available drivers
//   };

//   // ── Categories (array contains ANY of the requested values) ───────────────
//   if (categories) {
//     const catArray = categories?.split(',').map(c => c.trim()).filter(Boolean);
//     if (catArray.length > 0) {
//       query.categories = { $in: catArray };
//     }
//   }

//   // ── Transmission (array contains ANY) ─────────────────────────────────────
//   if (transmission) {
//     const transArray = transmission.split(',').map(t => t.trim()).filter(Boolean);
//     if (transArray.length > 0) {
//       query.transmission = { $in: transArray };
//     }
//   }

//   // ── Languages spoken (array contains ANY) ─────────────────────────────────
//   if (languages) {
//     const langArray = languages.split(',').map(l => l.trim()).filter(Boolean);
//     if (langArray.length > 0) {
//       query.languagesSpoken = { $in: langArray };
//     }
//   }

//   // ── Years of experience range ─────────────────────────────────────────────
//   if (minExperience || maxExperience) {
//     query.yearsOfExperience = {};
//     if (minExperience) query.yearsOfExperience.$gte = Number(minExperience);
//     if (maxExperience) query.yearsOfExperience.$lte = Number(maxExperience);
//   }

//   // ── Expected earnings range (using min value of the range) ────────────────
//   if (minEarnings || maxEarnings) {
//     query['expectedEarnings.min'] = {};
//     if (minEarnings) query['expectedEarnings.min'].$gte = Number(minEarnings);
//     if (maxEarnings) query['expectedEarnings.min'].$lte = Number(maxEarnings);
//   }

//   // ── Travel capabilities ───────────────────────────────────────────────────
//   if (interstate === 'true') {
//     query['travelCapabilities.interstate'] = true;
//   }
//   if (international === 'true') {
//     query['travelCapabilities.international'] = true;
//   }

//   // Pagination
//   const skip = (Number(page) - 1) * Number(limit);
//   const perPage = Number(limit);

//   // Execute query with population + pagination + sorting
//   const drivers = await DriverProfile.find(query)
//     .populate({
//       path: 'user',
//       select: 'firstName lastName phone avatar location slug rating totalTrips timesHired isVerified',
//     })
//     .sort(sort)
//     .skip(skip)
//     .limit(perPage)
//     .lean();

//   // Total count for pagination metadata
//   const total = await DriverProfile.countDocuments(query);

//   // Format response (optional — clean & client-friendly)
//   const formatted = drivers.map(profile => ({
//     id: profile._id,
//     userId: profile.user?._id,
//     slug: profile.user?.slug,
//     fullName: `${profile.user?.firstName || ''} ${profile.user?.lastName || ''}`.trim(),
//     avatar: profile.user?.avatar,
//     phone: profile.user?.phone,
//     rating: profile.user?.rating || 0,
//     totalTrips: profile.user?.totalTrips || 0,
//     isVerified: profile.user?.isVerified || false,

//     categories: profile.categories || [],
//     transmission: profile.transmission || [],
//     languagesSpoken: profile.languagesSpoken || [],
//     yearsOfExperience: profile.yearsOfExperience,
//     expectedEarnings: profile.expectedEarnings,
//     travelCapabilities: profile.travelCapabilities,
//     bio: profile.bio,
//     isAvailable: profile.isAvailable,
//     createdAt: profile.createdAt,
//   }));

//   res.status(200).json({
//     success: true,
//     count: formatted.length,
//     total,
//     page: Number(page),
//     pages: Math.ceil(total / perPage),
//     data: formatted,
//   });
// });


router.get('/search', async (req, res) => {
  try {
    const {
      categories,
      transmission,
      languages,
      minExperience,
      maxExperience,
      minEarnings,
      maxEarnings,
      interstate,
      international,
      isAvailable = 'true', // default to only available drivers
      limit = 20,
      page = 1,
      sort = '-createdAt', // newest first by default
    } = req.query;

    // Build MongoDB query object
    const query = {};

    // Availability (default: only available)
    if (isAvailable === 'true') {
      query.isAvailable = true;
    } else if (isAvailable === 'false') {
      query.isAvailable = false;
    } // else: show all (no filter)

    // Categories (array contains ANY of the requested values)
    if (categories) {
      const catArray = categories.split(',').map(c => c.trim()).filter(Boolean);
      if (catArray.length > 0) {
        query.categories = { $in: catArray };
      }
    }

    // Transmission (array contains ANY)
    if (transmission) {
      const transArray = transmission.split(',').map(t => t.trim()).filter(Boolean);
      if (transArray.length > 0) {
        query.transmission = { $in: transArray };
      }
    }

    // Languages spoken (array contains ANY)
    if (languages) {
      const langArray = languages.split(',').map(l => l.trim()).filter(Boolean);
      if (langArray.length > 0) {
        query.languagesSpoken = { $in: langArray };
      }
    }

    // Years of experience range
    if (minExperience || maxExperience) {
      query.yearsOfExperience = {};
      if (minExperience) query.yearsOfExperience.$gte = Number(minExperience);
      if (maxExperience) query.yearsOfExperience.$lte = Number(maxExperience);
    }

    // Expected earnings range (using min value of the range)
    if (minEarnings || maxEarnings) {
      query['expectedEarnings.min'] = {};
      if (minEarnings) query['expectedEarnings.min'].$gte = Number(minEarnings);
      if (maxEarnings) query['expectedEarnings.min'].$lte = Number(maxEarnings);
    }

    // Travel capabilities
    if (interstate === 'true') {
      query['travelCapabilities.interstate'] = true;
    }
    if (international === 'true') {
      query['travelCapabilities.international'] = true;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const perPage = Number(limit);

    // Execute query with full user population
    const drivers = await DriverProfile.find(query)
      .populate({
        path: 'user',
        select: 
          'firstName lastName state lga email phone avatar slug location rating totalTrips timesHired isVerified status likes shares views isCertified isOnline isAvailable lastSeen lastActivity createdAt updatedAt',
      })
      .sort(sort)
      .skip(skip)
      .limit(perPage)
      .lean(); // lean() for performance (plain JS objects)

    // Total count for pagination metadata
    const total = await DriverProfile.countDocuments(query);

    // Optional: clean up response (remove sensitive fields if needed)
    const formatted = drivers.map(profile => {
      const user = profile.user || {};
      return {
        id: profile._id,
        // Full User fields (non-sensitive)
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          phone: user.phone,
          avatar: user.avatar,
          slug: user.slug,
          rating: user.rating || 0,
          totalTrips: user.totalTrips || 0,
          timesHired: user.timesHired || 0,
          isVerified: user.isVerified || false,
          isCertified:user.isCertified,
          location: user.location,
          status: user.status,
          shares: user.shares,
          state:user.state,
          lastSeen: user.lastSeen,
          lastActivity: user.lastActivity,
          isOnline: user.isOnline,
          isAvailable: user.isAvailable,
          lga:user.lga,
          likes:user.likes,
          views: user.views,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        // DriverProfile fields
        categories: profile.categories || [],
        transmission: profile.transmission || [],
        languagesSpoken: profile.languagesSpoken || [],
        yearsOfExperience: profile.yearsOfExperience,
        expectedEarnings: profile.expectedEarnings,
        travelCapabilities: profile.travelCapabilities,
        bio: profile.bio,
        isAvailable: profile.isAvailable,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    });
console.log(formatted)
    res.status(200).json({
      success: true,
      count: formatted.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / perPage),
      data: formatted,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search drivers',
      error: error.message,
    });
  }
});



router.get('/profile', protect, getDriverProfile)
router.put('/profile', protect, updateDriverProfile);
router.get('/profile/:driverId', protect, getDriverProfileById);

router.post('/subscribe', protect, subscribeToPlan);
// GET /api/driver/:id - Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: 'driver',
      status: 'active',
      isActive: true,
      isDeleted: false,
      isBlacklisted: false
    }).select('-password -resetPasswordToken -verificationToken -emailChangeToken'); // Pure exclusions OK here

    if (!user) {
      console.log('Public driver not found or inactive:', id);
      return res.status(404).json({ error: 'Driver not found or inactive' });
    }

    const profile = await DriverProfile.findOne({ user: id, isAvailable: true }).lean();

    if (!profile) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    const driverData = {
      ...user.toObject(),
      ...profile,
      user: undefined,
      _id: user._id,
    };

    console.log('Public driver details fetched for:', id);

    res.json(driverData);
  } catch (error) {
    console.error('Error fetching driver details:', error);
    res.status(500).json({ error: 'Failed to fetch driver details' });
  }
});







export default router;


























