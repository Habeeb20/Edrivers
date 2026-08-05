// import express from 'express';
// import axios from 'axios';
// const router = express.Router();


// // Change to '/distance' (remove the '/api')
// router.get('/distance', async (req, res) => {
//   const { origin, destination } = req.query;

//   if (!origin || !destination) {
//     return res.status(400).json({ error: 'Origin and destination are required' });
//   }

// // https://maps.googleapis.com/maps/api/distancematrix/json
//   try {
//     const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
//       params: {
//         origins: origin,
//         destinations: destination,
//         mode: 'driving',
//         departure_time: 'now',  // ← Add for real-time traffic estimate
//         traffic_model: 'best_guess',  // Better accuracy
//         key: process.env.GOOGLE_MAPS_API_KEY
//       }
//     });

//     const element = response.data.rows?.[0]?.elements?.[0];
//     if (element?.status === 'OK') {
//       res.json({
//         success: true,
//         distance: element.distance?.text,
//         duration: element.duration_in_traffic?.text || element.duration?.text,  // ← Use traffic-aware duration
//       });
//     } else {
//       res.status(400).json({ error: element?.status || 'Route calculation failed' });
//     }
//   } catch (err) {
//     console.error('Google Distance error:', err.message);
//     res.status(500).json({ error: 'Failed to calculate distance' });
//   }
// });

// export default router;


import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/distance', async (req, res) => {
  const { origin, destination } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({ 
      success: false,
      error: 'Origin and destination are required' 
    });
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: origin,
        destinations: destination,
        mode: 'driving',
        units: 'metric',
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 10000,
    });

    const data = response.data;

    if (data.status !== 'OK') {
      return res.status(400).json({
        success: false,
        error: data.status,
        message: data.error_message || 'Failed to calculate distance',
      });
    }

    const element = data.rows[0]?.elements[0];

    if (!element || element.status !== 'OK') {
      return res.status(400).json({
        success: false,
        error: element?.status || 'NO_RESULT',
        message: 'Could not find route between addresses',
      });
    }

    res.json({
      success: true,
      origin: data.origin_addresses[0],
      destination: data.destination_addresses[0],
      distance: {
        meters: element.distance.value,
        km: (element.distance.value / 1000).toFixed(2),
        text: element.distance.text,
      },
      duration: {
        seconds: element.duration.value,
        text: element.duration.text,
      },
    });
  } catch (err) {
    console.error('Distance Matrix API Error:', err.response?.data || err.message);

    res.status(500).json({
      success: false,
      error: 'Failed to calculate distance',
      message: err.message,
    });
  }
});

export default router;