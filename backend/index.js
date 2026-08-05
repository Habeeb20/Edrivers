import express from "express"

import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDb } from "./db.js";

import User from "./models/User.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/conversationRoute.js";
import hireRouter from "./routes/hireRoutes.js";
import adminRoute from "./routes/adminRoutes.js";
import distanceRouter from "./routes/distanceRoute.js"
import vehicleRouter from "./routes/vehicleLicenseRoute.js"
import trainingroutes from "./routes/trainingRoutes.js"
import taskRouter from "./routes/taskRoutes.js"
import rentalRouter from "./routes/rentalRoute.js";
import licenseRouter from "./routes/driverLicense.js";
import driverprofileRoutes from "./routes/driverProfile.js"
import distancepricingRouter from "./routes/distancePricingRoute.js"
import driverShopRoutes from "./routes/drivershopRoutes.js"
import hireondemandRoutes from "./routes/hiredemandRoutes.js"
import vettedDriversRoute from "./routes/vettedDriversRoutes.js"
import fulltimeRoute from "./routes/fulltimeRoute.js"
import announcementsRoute from "./routes/announcementRoute.js"
import videorouter from "./routes/videoRoutes.js"
import { activityMiddleware, protect } from "./middleware/verifyToken.js";
import walletRoutes from "./routes/walletRoute.js"
import loyaltyRoutes from "./routes/loyaltyRoutes.js"
dotenv.config();
const app = express();
connectDb()
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(morgan("dev"));



// Routes
app.get("/", (req, res) => {
  res.send("edriver backend is listening on port....");
});


// app.use('/api', protect, activityMiddleware)
app.use('/api', distanceRouter);
app.use("/api/users", userRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/hire", hireRouter);
app.use('/api/videos', videorouter)
app.use("/api/admin", adminRoute)


app.use('/api/rent-car', rentalRouter);
app.use("/api/license", licenseRouter);
app.use("/api/licenses", licenseRouter);
app.use("/api/driver", driverprofileRoutes)

 app.use('/api/wallet', walletRoutes);
app.use("/api/tasks", taskRouter)
app.use("/api/vehicle-license", vehicleRouter)
app.use("/api/training", trainingroutes)
app.use("/api/distance-pricing", distancepricingRouter)
app.use('/api/driver-shop', driverShopRoutes)
app.use("/api/hire-on-demand", hireondemandRoutes)
app.use("/api/vetted-drivers", vettedDriversRoute)
app.use("/api/fulltime-hire", fulltimeRoute)
app.use("/api/announcements", announcementsRoute)
app.use('/api/loyalty', loyaltyRoutes)
// ...

// await User.create({
//   firstName: 'Admin',
//   lastName: 'Boss',
//   email: 'edrivers@gmail.com',
//   password: 'essential01',
//   role: 'superadmin'
// });

// console.log('Superadmin created!');







const cache = {};

app.get('/api/geocode', async (req, res) => {
  const { q } = req.query;

  if (cache[q]) {
    return res.json(cache[q]); // ✅ instant return
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'your-app-name (your@email.com)',
          'Accept': 'application/json',
        },
      }
    );

    const text = await response.text();

    if (text.startsWith('<')) {
      return res.status(500).json({ error: 'Invalid response' });
    }

    const data = JSON.parse(text);

    cache[q] = data; // ✅ store result

    res.json(data);
  } catch (err) {
    console.error('Geocoding error:', err);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});






const port = process.env.PORT || 1080;

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

})




