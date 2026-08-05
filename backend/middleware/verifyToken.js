import  User from "../models/User.js";
import jwt from "jsonwebtoken";
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
 
  }
   
  if (!token) {
console.log("I am here causing the error")
    return res.status(401).json({ status: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ status: false, message: "yea,User not found" });
    }
    next();
  } catch (error) {
 
    return res.status(401).json({ status: false, message: "Token invalid or expired" });
  }
};


export const superadmin = (req, res, next) => {
  console.log(req.user)
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Superadmin access required' });
  }
};





export const activityMiddleware = async (req, res, next) => {
  if (req.user?.id) {   // req.user comes from your protect/auth middleware
    try {
      // Update only if lastSeen is older than 2 minutes (to reduce DB writes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

      await User.findByIdAndUpdate(
        req.user.id,
        {
          isOnline: true,
          lastSeen: new Date(),
          lastActivity: new Date()
        },
        { 
          new: true,
          timestamps: false   // optional: don't update updatedAt every time
        }
      );
    } catch (err) {
      console.error('Activity update failed:', err);
      // Don't block the request if update fails
    }
  }
  next();
};

