// controllers/authController.js
import User from "../models/User.js";
import Hire from "../models/Hire.js"; // for dashboard stats
import {
  hashPassword,
  comparePassword,
  generateToken,
  sendVerificationEmail,
  forgotPassword as forgotPasswordUtil,
  resetPassword as resetPasswordUtil,
  changePassword as changePasswordUtil,
  sendEmailChangeRequest,
  confirmEmailChange as confirmEmailChangeUtil,
} from "../utils/functions.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Rating from "../models/Rating.js";
import mongoose from "mongoose";
import Document from "../models/Document.js"
import Guarantor from "../models/GurantorSchema.js";
import { getDriverCommission } from "./AdminController.js";
import DriverProfile from "../models/driverProfile.js";
import { sendEmail } from "../utils/sendEmail.js";
import { validatePasswordStrength } from "../utils/functions.js";
import { isProfileComplete, getMissingProfileFields } from "../utils/profileCompletion.js";
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
const OTP_TTL_MS = 10 * 60 * 1000; 
const walletApi = "https://api-ewallet.eroot.ng/api";
const walletApiVirtualAcct = "https://api-ewallet.eroot.ng/api/public/dedicated-account";

// Custom token generator (aligned with utils)
const generateTokenCustom = (user) => {
  return generateToken(user._id, user.role);
};

// ────────────────────────────────────────────────
// REGISTER USER
// ────────────────────────────────────────────────
// export const registerUser = async (req, res) => {
//   const { firstName, lastName, email, password, role, referralCode } = req.body;

//   if (!firstName || !lastName || !email || !password || !role) {
//     return res.status(400).json({
//       status: false,
//       message: "All fields (firstName, lastName, email, password, role) are required",
//     });
//   }

//     // ── Password strength check ──
//   const { isValid, errors } = validatePasswordStrength(password);
//   if (!isValid) {
//     return res.status(400).json({
//       status: false,
//       message: `Password must contain ${errors.join(', ')}`,
//       passwordErrors: errors,
//     });
//   }


//   try {
//     // Check existing user
//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({
//         status: false,
//         message: "Email already exists",
//       });
//     }

//     // Hash password
//     const hashedPassword = await hashPassword(password);

//     // Generate unique identifiers
//     const uniqueNumber = `RL-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
//     const userId = uuidv4();

//     // Create user
//     const newUser = new User({
//       firstName,
//       lastName,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role,
//       uniqueNumber,
//       userId,
//       verificationStatus: role === "superadmin" ? "verified" : "unverified",
//       status: "pending", // Changed default to pending as per your update
//     });

//       if (referralCode) {
//       const referrer = await User.findOne({
//         referralCode: referralCode.toUpperCase().trim(),
//       });

//       if (referrer && referrer._id.toString() !== newUser._id.toString()) {
//         // Award points
//         referrer.referralPoints += 50;    // ← adjust value as needed
//         referrer.referralCount += 1;
//         // referrer.referredUsers.push(user._id); // if using array

//         await referrer.save();

//         // Link the new user to referrer
//         newUser.referredBy = referrer._id;
//         await newUser.save();
//       }
//     }


//     await newUser.save();

//     // ─── External Auth System Registration (optional) ─────────────────
//     try {
//       await axios.post("https://auth.edirect.ng/api/auth/register", {
//         platform: "edriver",
//         first_name: firstName,
//         last_name: lastName,
//         email: email.toLowerCase(),
//         userId,
//         password,
//         role,
//       });
//       console.log("Edirect auth registration successful");
//     } catch (err) {
//       console.error("Edirect auth failed:", err.response?.data || err.message);
//     }

//   // await axios.post("https://backend.ejobs.com.ng/api/v1/auth/signup"

//       try {
//       await axios.post("https://backend.ejobs.com.ng/api/v1/auth/signup", {
     
//         first_name: firstName,
//         last_name: lastName,
//         email: email.toLowerCase(),
//         userId,
//         password,
//         userType: "jobSeeker",
//         country: 'Nigeria'
//       });
//       console.log("Ejob registration successful");
//     } catch (err) {
//       console.error("Ejob registration failed:", err.response?.data || err.message);
//     }

//         // ─── External edrive registration (optional) ─────────────────
//     try {
//       await axios.post("https://api.edrive.ng/api/auth/register", {
//         platform: "edrivers",
//         first_name: firstName,
//         last_name: lastName,
//         email: email.toLowerCase(),
//         userId,
//         password,
//         role,
//       });
//       console.log("Edrivers  registration successful");
//     } catch (err) {
//       console.error("Edirect auth failed:", err.response?.data || err.message);
//     }

//          // ─── External efixit registration (optional) ─────────────────
//     try {
//       await axios.post("https://backend-efixit.ereligion.ng/api/auth/register", {
//         platform: "edrivers",
//         first_name: firstName,
//         last_name: lastName,
//         email: email.toLowerCase(),
//         userId,
//         password,
//         role,
//       });
//       console.log("Efixit registration successful");
//     } catch (err) {
//       console.error("Efixit auth failed:", err.response?.data || err.message);
//     }




//     // ─── Wallet Registration ──────────────────────────────────────────
// // ─── Wallet Registration ──────────────────────────────────────────
// try {
//   const walletResponse = await axios.post(`${walletApi}/register`, {
//     first_name: firstName,
//     last_name: lastName,
//     email: email.toLowerCase(),
//     password: "edrivers123",
//     phone: "08055446677", // Placeholder — update later via profile
//   });

//   // Always persist the full raw response, regardless of shape
//   newUser.walletData = walletResponse.data;

//   const customer = walletResponse.data?.customer;
//   if (customer) {
//     newUser.wallet = {
//       ...(newUser.wallet || {}),
//       customerCode: customer.customer_code,
//       customerId: customer.id,
//       currency: customer.currency,
//     };
//   }

//   await newUser.save();
// } catch (err) {
//   console.error("Wallet registration failed:", err.response?.data || err.message);
// }

// // ─── Virtual Account Creation (if wallet exists) ──────────────────
// const customerCode = newUser.walletData?.customer?.customer_code;
// if (customerCode) {
//   try {
//     const virtualAcctRes = await axios.post(
//       walletApiVirtualAcct,
//       { customer: customerCode }
//       // Add headers if token needed
//     );

//     // Always persist the full raw response
//     newUser.walletResponse = virtualAcctRes.data;

//     const acct = virtualAcctRes.data?.account_data;
//     if (acct) {
//       newUser.walletId = acct.id;
//       newUser.wallet = {
//         ...(newUser.wallet || {}),
//         accountNumber: acct.account_number,
//         accountName: acct.account_name,
//         bankName: acct.bank_name,
//         bankId: acct.bank_id,
//         linkedAt: new Date(),
//       };
//     }

//     await newUser.save();
//   } catch (err) {
//     console.error("Virtual account creation failed:", err.response?.data || err.message);
//   }
// }

//     // Generate JWT for auto-login
//     const token = generateTokenCustom(newUser);

//     return res.status(201).json({
//       status: true,
//       message: "Registration successful! Redirecting to dashboard.",
//       token,
//       user: {
//         id: newUser._id,
//         userId: newUser.userId,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//         email: newUser.email,
//         role: newUser.role,
//         uniqueNumber: newUser.uniqueNumber,
//         walletId: newUser.walletId || null,
//         verificationStatus: newUser.verificationStatus,
//         status: newUser.status,
//               referralCode:  newUser.referralCode,
//           referralPoints:  newUser.referralPoints,
//       },
//     });
//   } catch (error) {
//     console.error("Registration error:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Server error. Please try again later.",
//     });
//   }
// };


// ────────────────────────────────────────────────
// REGISTER USER
// ────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, role, referralCode } = req.body;

  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({
      status: false,
      message: "All fields (firstName, lastName, email, password, role) are required",
    });
  }

  // ── Password strength check ──
  const { isValid, errors } = validatePasswordStrength(password);
  if (!isValid) {
    return res.status(400).json({
      status: false,
      message: `Password must contain ${errors.join(', ')}`,
      passwordErrors: errors,
    });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ status: false, message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const uniqueNumber = `RL-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const userId = uuidv4();

    // ── OTP for email verification ──
    const otpCode = generateOtp();

    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      uniqueNumber,
      userId,
      verificationStatus: "unverified",
      status: "pending",
      eAuthOtp: {
        code: otpCode,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        attempts: 0,
      },
    });

    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase().trim() });
      if (referrer && referrer._id.toString() !== newUser._id.toString()) {
        referrer.referralPoints += 50;
        referrer.referralCount += 1;
        await referrer.save();
        newUser.referredBy = referrer._id;
      }
    }

    await newUser.save();

    // ── Send verification email (don't block signup if this fails, but log loudly) ──
    try {
      await sendEmail({
        to: newUser.email,
        subject: "Verify your email",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2>Verify your email</h2>
            <p>Hi ${firstName}, use the code below to verify your account. It expires in 10 minutes.</p>
            <p style="font-size:32px;font-weight:bold;letter-spacing:6px">${otpCode}</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send verification email:", err.message);
    }

    // ─── External Auth System Registration (optional) ─────────────────
    try {
      await axios.post("https://auth.edirect.ng/api/auth/register", {
        platform: "edriver",
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        userId,
        password,
        role,
      });
    } catch (err) {
      console.error("Edirect auth failed:", err.response?.data || err.message);
    }

    try {
      await axios.post("https://backend.ejobs.com.ng/api/v1/auth/signup", {
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        userId,
        password,
        userType: "jobSeeker",
        country: "Nigeria",
      });
    } catch (err) {
      console.error("Ejob registration failed:", err.response?.data || err.message);
    }

    try {
      await axios.post("https://api.edrive.ng/api/auth/register", {
        platform: "edrivers",
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        userId,
        password,
        role,
      });
    } catch (err) {
      console.error("Edrive registration failed:", err.response?.data || err.message);
    }

    try {
      await axios.post("https://backend-efixit.ereligion.ng/api/auth/register", {
        platform: "edrivers",
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        userId,
        password,
        role,
      });
    } catch (err) {
      console.error("Efixit auth failed:", err.response?.data || err.message);
    }

    // ─── Wallet Registration ──────────────────────────────────────────
    try {
      const walletResponse = await axios.post(`${walletApi}/register`, {
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        password: "edrivers123",
        phone: "08055446677",
      });

      newUser.walletData = walletResponse.data;
      const customer = walletResponse.data?.customer;
      if (customer) {
        newUser.wallet = {
          ...(newUser.wallet || {}),
          customerCode: customer.customer_code,
          customerId: customer.id,
          currency: customer.currency,
        };
      }
      await newUser.save();
    } catch (err) {
      console.error("Wallet registration failed:", err.response?.data || err.message);
    }

    const customerCode = newUser.walletData?.customer?.customer_code;
    if (customerCode) {
      try {
        const virtualAcctRes = await axios.post(walletApiVirtualAcct, { customer: customerCode });
        newUser.walletResponse = virtualAcctRes.data;
        const acct = virtualAcctRes.data?.account_data;
        if (acct) {
          newUser.walletId = acct.id;
          newUser.wallet = {
            ...(newUser.wallet || {}),
            accountNumber: acct.account_number,
            accountName: acct.account_name,
            bankName: acct.bank_name,
            bankId: acct.bank_id,
            linkedAt: new Date(),
          };
        }
        await newUser.save();
      } catch (err) {
        console.error("Virtual account creation failed:", err.response?.data || err.message);
      }
    }

    // NOTE: no token issued here anymore — user must verify email first
    return res.status(201).json({
      status: true,
      message: "Account created. Please check your email for a verification code.",
      email: newUser.email,
      userId: newUser.userId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ status: false, message: "Server error. Please try again later." });
  }
};

// ────────────────────────────────────────────────
// VERIFY EMAIL (OTP)
// ────────────────────────────────────────────────
export const verifyEmailOtp = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ status: false, message: "Email and code are required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+eAuthOtp.code");
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    if (user.verificationStatus === "verified") {
      return res.status(400).json({ status: false, message: "Email already verified" });
    }
    if (!user.eAuthOtp?.code) {
      return res.status(400).json({ status: false, message: "No OTP found. Please request a new one." });
    }
    if (user.eAuthOtp.expiresAt < new Date()) {
      return res.status(400).json({ status: false, message: "Code expired. Please request a new one." });
    }
    if (user.eAuthOtp.attempts >= 5) {
      return res.status(429).json({ status: false, message: "Too many attempts. Please request a new code." });
    }
    if (user.eAuthOtp.code !== code) {
      user.eAuthOtp.attempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ status: false, message: "Invalid code" });
    }

    user.verificationStatus = "verified";
    user.eAuthOtp = undefined;
    await user.save({ validateBeforeSave: false });

    const token = generateTokenCustom(user);
    return res.status(200).json({
      status: true,
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────
// RESEND OTP
// ────────────────────────────────────────────────
export const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: false, message: "Email is required" });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });
    if (user.verificationStatus === "verified") {
      return res.status(400).json({ status: false, message: "Email already verified" });
    }

    const otpCode = generateOtp();
    user.eAuthOtp = { code: otpCode, expiresAt: new Date(Date.now() + OTP_TTL_MS), attempts: 0 };
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: "Your new verification code",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>Your new code</h2>
          <p style="font-size:32px;font-weight:bold;letter-spacing:6px">${otpCode}</p>
          <p>Expires in 10 minutes.</p>
        </div>
      `,
    });

    return res.status(200).json({ status: true, message: "A new code has been sent to your email" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────
// LOGIN USER
// ────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: "Email and password are required",
    });
  }

  try {
    // Include password explicitly
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid email ",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid password",
      });
    }

    if (user.status === "blocked" || user.isDeleted) {
      return res.status(403).json({
        status: false,
        message: "Your account is blocked or deleted. Contact support.",
      });
    }


    // === ONLINE TRACKING LOGIC ===
    user.isOnline = true;
    user.lastSeen = new Date();
    user.lastActivity = new Date();

    // Save the updates (we modify the existing user document)
    await user.save({ validateBeforeSave: false });

    const profileComplete = isProfileComplete(user);
    const redirectTo = profileComplete ? '/dashboard' : '/dashboard?tab=profile';

    // If status is pending, allow login but show message
    if (user.status === "pending") {
      return res.status(200).json({
        status: true,
        message: "Login successful. Your account is pending admin approval.",
        token: generateTokenCustom(user),
        user: {
          id: user._id,
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
           profileComplete,
          redirectTo,
        },
      });
    }

    const token = generateTokenCustom(user);

    
    await User.findByIdAndUpdate(user._id, {
      lastSeen: new Date(),
      isOnline: true,
      lastActivity: new Date(),
    });

    let roleMessage = "";
    switch (user.role) {
      case "driver":
        roleMessage = "Welcome back, Driver!";
        break;
      case "client":
        roleMessage = "Welcome back, Passenger!";
        break;
      case "superadmin":
        roleMessage = "Welcome back, Admin!";
        break;
      default:
        roleMessage = "Welcome back!";
    }

    return res.status(200).json({
      status: true,
      message: `Login successful. ${roleMessage} Redirecting to dashboard.`,
      token,
      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        uniqueNumber: user.uniqueNumber,
        walletId: user.walletId || null,
        verificationStatus: user.verificationStatus,
        status: user.status,
          profileComplete,
        redirectTo,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const authLogin = async (req, res) => {
  const { email} = req.body;

  if (!email ) {
    return res.status(400).json({
      status: false,
      message: "Email is  required",
    });
  }

  try {
    // Include password explicitly
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }


    if (user.status === "blocked" || user.isDeleted) {
      return res.status(403).json({
        status: false,
        message: "Your account is blocked or deleted. Contact support.",
      });
    }

       const profileComplete = isProfileComplete(user);
    const redirectTo = profileComplete ? '/dashboard' : '/dashboard?tab=profile';

    // If status is pending, allow login but show message
    if (user.status === "pending") {
      return res.status(200).json({
        status: true,
        message: "Login successful. Your account is pending admin approval.",
        token: generateTokenCustom(user),
        user: {
          id: user._id,
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
             profileComplete,
          redirectTo,
        },
      });
    }

    const token = generateTokenCustom(user);

     await User.findByIdAndUpdate(user._id, {
      lastSeen: new Date(),
      isOnline: true,
      lastActivity: new Date(),
    });


    let roleMessage = "";
    switch (user.role) {
      case "driver":
        roleMessage = "Welcome back, Driver!";
        break;
      case "client":
        roleMessage = "Welcome back, Passenger!";
        break;
      case "superadmin":
        roleMessage = "Welcome back, Admin!";
        break;
      default:
        roleMessage = "Welcome back!";
    }

    return res.status(200).json({
      status: true,
      message: `Login successful. ${roleMessage} Redirecting to dashboard.`,
      token,
      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        uniqueNumber: user.uniqueNumber,
        walletId: user.walletId || null,
        verificationStatus: user.verificationStatus,
        status: user.status,
           profileComplete,
        redirectTo,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};


// ── Step 1: send the code ──────────────────────────────────────────
export const requestEAuthOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal whether the email exists
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user.eAuthOtp = { code, expiresAt, attempts: 0 };
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'Your edrivers login code',
      html: `<p>Hi ${user.firstName},</p><p>Your login code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in 10 minutes. If you didn't request this, ignore this email.</p>`,
      text: `Your login code is ${code}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ message: 'Server error while sending code' });
  }
};

// ── Step 2: verify the code and log in ─────────────────────────────
export const verifyEAuthOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+eAuthOtp.code');

    if (!user || !user.eAuthOtp?.code) {
      return res.status(401).json({ message: 'Invalid or expired code' });
    }

    if (user.eAuthOtp.expiresAt < new Date()) {
      user.eAuthOtp = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ message: 'Code has expired. Please request a new one.' });
    }

    if (user.eAuthOtp.attempts >= 5) {
      user.eAuthOtp = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(429).json({ message: 'Too many attempts. Please request a new code.' });
    }

    if (user.eAuthOtp.code !== code.trim()) {
      user.eAuthOtp.attempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ message: 'Incorrect code' });
    }

    // Success
    user.eAuthOtp = undefined;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);
    const ProfileComplete = isProfileComplete(user); // reuse your existing helper

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        currentRole: user.currentRole,
        uniqueNumber: user.uniqueNumber,
        referralCode: user.referralCode,
        referralPoints: user.referralPoints,
        isVerified: user.isVerified,
        isCertified: user.isCertified && user.currentRole === 'provider',
        ProfileComplete,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};



// controllers/authController.js
export const getProfileCompletionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ status: false, message: 'User not found' });

    const missingFields = getMissingProfileFields(user);

    res.json({
      status: true,
      complete: missingFields.length === 0,
      missingFields,
    });
  } catch (error) {
    console.error('Profile completion check error:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// FORGOT PASSWORD
// ────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: false, message: "Email is required" });
  }

  try {
    await forgotPasswordUtil(email);
    return res.status(200).json({
      status: true,
      message: "If your email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────
// RESET PASSWORD
// ────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
console.log(req.body)
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ status: false, message: "Password must be at least 6 characters" });
  }

  try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await resetPasswordUtil(token, hashedPassword);
    return res.status(200).json({
      status: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ────────────────────────────────────────────────
// UPDATE PROFILE
// ────────────────────────────────────────────────

export const updateProfile = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { user, guarantors = [], documents = [] } = req.body;

    /* ================= 1. UPDATE USER ================= */
    const allowedUserFields = [
      'firstName', 'lastName', 'phone', 'avatar', 
      'address', 'state', 'lga', 'dateOfBirth', 
      'vehicle', 'preferredPayment', 'category', 'isAvailable'
    ];

    const userUpdates = {};
    allowedUserFields.forEach(field => {
      if (user?.[field] !== undefined) {
        userUpdates[field] = user[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: userUpdates },
      { new: true, runValidators: true, session }
    );

    if (!updatedUser) throw new Error('User account not found');
 updatedUser.isProfileComplete = isProfileComplete(updatedUser);
    await updatedUser.save({ session, validateBeforeSave: false });
    /* ================= 2. UPSERT GUARANTORS ================= */
    for (const g of guarantors) {
      // Basic validation based on your Schema's 'required' fields
      if (!g.position || !g.name || !g.phone || !g.relationship || !g.idDocument) continue;

      await Guarantor.findOneAndUpdate(
        { user: userId, position: g.position },
        {
          $set: {
            name: g.name,
            phone: g.phone,
            relationship: g.relationship,
            idDocument: g.idDocument, // Cloudinary URL
            address: {
              street: g.address?.street,
              city: g.address?.city,
              state: g.address?.state,
              country: g.address?.country || 'Nigeria'
            },
            status: 'pending',
            verifiedAt: null,
            rejectionReason: null
          }
        },
        { upsert: true, new: true, runValidators: true, session }
      );
    }

    /* ================= 3. UPSERT DOCUMENTS ================= */
    for (const doc of documents) {
      if (!doc.type || !doc.url) continue;

      // Ensure guarantorPosition is present if the type is 'guarantor-id'
      const gPos = doc.type === 'guarantor-id' ? doc.guarantorPosition : null;

      await Document.findOneAndUpdate(
        {
          user: userId,
          type: doc.type,
          guarantorPosition: gPos
        },
        {
          $set: {
            url: doc.url, // Cloudinary URL
            status: 'pending',
            rejectedAt: null,
            rejectionReason: null
          }
        },
        { upsert: true, new: true, runValidators: true, session }
      );
    }

    // Success: Commit all changes
    await session.commitTransaction();
    
    return res.status(200).json({
      status: true,
      message: 'Profile and related records updated successfully',
      user: updatedUser.toJSON()
    });

  } catch (error) {
    // Failure: Rollback every change made during this attempt
    await session.abortTransaction();
    console.error('Update profile error:', error);
    
    return res.status(500).json({
      status: false,
      message: error.message || 'An error occurred during the update'
    });
  } finally {
    session.endSession();
  }
};

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // .lean() for a plain object — fine here since password is already excluded via select
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Pull related profile data in parallel, same as getFullProfile
    const [guarantors, documents, driverProfile] = await Promise.all([
      Guarantor.find({ user: userId }).sort({ position: 1 }).lean(),
      Document.find({ user: userId }).lean(),
      DriverProfile.findOne({ user: userId }).lean(),
    ]);

    let stats = {
      role: user.role,
      totalTrips: user.totalTrips || 0,
      earnings: user.earnings || 0,
      rating: user.rating || 0,
    };

    if (user.role === 'driver') {
      const hires = await Hire.find({ driver: userId });

      const totalPaidAmount = hires.reduce((sum, h) => {
        return h.paymentStatus === 'paid' ? sum + (h.amountOffered || 0) : sum;
      }, 0);

      const adminPercentage = await getDriverCommission();
      const adminCommission = Math.round((totalPaidAmount * adminPercentage) / 100);
      const driverShare = totalPaidAmount - adminCommission;
      const totalHire = hires.filter(h => ['accepted', 'active', 'ended'].includes(h.status)).length;
      const totalBookedHours = hires.reduce((sum, h) => sum + (h.durationHours || 0), 0);
      const activeHires = hires.filter(h => h.status === 'active').length;
      const pendingHires = hires.filter(h => h.status === 'pending' || h.status === 'pending_approval').length;

      stats = {
        ...stats,
        totalPaidAmount,
        totalHire,
        adminCommission,
        driverShare,
        totalBookedHours,
        activeHires,
        pendingHires,
        currentHireStatus: user.currentHireStatus || 'available',
      };
    } else if (user.role === 'client') {
      const hires = await Hire.find({ client: userId });

      const totalAmountPaid = hires.reduce((sum, h) => {
        return h.paymentStatus === 'paid' ? sum + (h.amountOffered || 0) : sum;
      }, 0);

      const activeHires = hires.filter(h => h.status === 'active').length;
      const pendingHires = hires.filter(h => h.status === 'pending' || h.status === 'pending_approval').length;

      stats = {
        ...stats,
        totalAmountPaid,
        activeHires,
        pendingHires,
      };
    }

    return res.status(200).json({
      status: true,
      message: "Dashboard loaded",
      data: {
        user: {
          ...user,
          guarantors: guarantors || [],
          documents: documents || [],
          driverProfile: driverProfile || null,
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
// ────────────────────────────────────────────────
// CHANGE PASSWORD (logged-in)
// ────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({
      status: false,
      message: "Valid current and new passwords required (min 6 chars)",
    });
  }

  try {
    await changePasswordUtil(userId, currentPassword, newPassword);
    return res.status(200).json({
      status: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ────────────────────────────────────────────────
// CHANGE EMAIL REQUEST
// ────────────────────────────────────────────────
export const changeEmail = async (req, res) => {
  const { newEmail, password } = req.body;

  if (!newEmail || !password) {
    return res.status(400).json({ status: false, message: "New email and password required" });
  }

  try {
    const user = await User.findById(req.user._id);
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: "Incorrect password" });
    }

    await sendEmailChangeRequest(user, newEmail.toLowerCase());
    return res.status(200).json({
      status: true,
      message: "Verification email sent to new address",
    });
  } catch (error) {
    console.error("Change email error:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────
// CONFIRM EMAIL CHANGE
// ────────────────────────────────────────────────
export const confirmEmailChange = async (req, res) => {
  const { token } = req.params;

  try {
    await confirmEmailChangeUtil(token);
    return res.status(200).json({
      status: true,
      message: "Email changed successfully",
    });
  } catch (error) {
    console.error("Confirm email change error:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// ────────────────────────────────────────────────
// DELETE ACCOUNT (soft delete)
// ────────────────────────────────────────────────
export const deleteAccount = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ status: false, message: "Password required to delete account" });
  }

  try {
    const user = await User.findById(req.user._id);
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: "Incorrect password" });
    }

    user.isDeleted = true;
    user.status = "blocked";
    user.email = `deleted_${Date.now()}@${user.email.split("@")[1]}`;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────
// GET ALL DRIVERS (for listing)
// ────────────────────────────────────────────────
export const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({
      role: 'driver',
      status: 'active',
      verificationStatus: 'verified',
    })
      .select('firstName lastName phone location rating totalTrips avatar isCertified category vehicle')
      .sort({ rating: -1, totalTrips: -1 });
console.log(drivers)
    res.status(200).json({
      status: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    console.error("Get drivers error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};



// backend/controllers/userController.js (or wherever getDrivers lives)



// ────────────────────────────────────────────────
// GET AVAILABLE DRIVERS (nearby, etc.)
// ────────────────────────────────────────────────
export const getAvailableDrivers = async (req, res) => {
  const { lat, lng, radius = 10000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ status: false, message: "lat and lng required" });
  }

  try {
    const drivers = await User.find({
      role: 'driver',
      status: 'active',
      verificationStatus: 'verified',
      currentHireStatus: 'available',
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    })
      .select("firstName lastName phone location rating avatar vehicle");

    res.json({
      status: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    console.error("Nearby drivers error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────
// GET USER PROFILE (self or by ID)
// ────────────────────────────────────────────────
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
console.log(user)
    return res.status(200).json({
      status: true,
      data: user.toJSON(),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};






export const getClients = async (req, res) => {
  try {
    const clients = await User.find({
      role: "client",
      status: "active",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server error" });
  }
};





// controllers/userController.js (or wherever you keep this)
export const getOverviewStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch logged-in user (basic info)
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch admin commission percentage from superadmin
    const superadmin = await User.findOne({ role: 'superadmin' })
      .select('adminSettings.driverCommissionPercentage');
    const adminCommissionPercentage = superadmin?.adminSettings?.driverCommissionPercentage ?? 30;

    let stats = {
      role: user.role,
      adminCommissionPercentage,
    };

    if (user.role === 'driver') {
      // ─── Driver: Find all hires where they are the driver ───────────────
      const hires = await Hire.find({ driver: userId })
        .populate('client', 'firstName lastName email phone avatar')
        .lean();

      // ─── Process hires for stats ───────────────────────────────────────
      const paidHires = hires.filter(h => h.paymentStatus === 'paid');
      const activeHires = hires.filter(h => h.status === 'active');
      const pendingHires = hires.filter(h => ['pending', 'pending_approval'].includes(h.status));

      // Total unique clients who have paid
      const paidClientsCount = new Set(
        paidHires.map(h => h.client?._id?.toString())
      ).size;

      // Total paid amount
      const totalPaidAmount = paidHires.reduce((sum, h) => sum + (h.amountOffered || 0), 0);

      // Admin commission & driver share
      const adminCommissionAmount = Math.round((totalPaidAmount * adminCommissionPercentage) / 100);
      const driverShareAmount = totalPaidAmount - adminCommissionAmount;

      // Total booked hours (all hires, not just paid)
      const totalBookedHours = hires.reduce((sum, h) => sum + (h.durationHours || 0), 0);

           const totalHire = hires.filter(h => 
  ['accepted', 'active', 'ended'].includes(h.status)
).length;

console.log(totalHire);

      // Ratings (from separate Rating model)
      const ratings = await Rating.find({ toUser: userId });
      const totalReviewsReceived = ratings.length;
      const averageRating = totalReviewsReceived > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalReviewsReceived).toFixed(1)
        : '0.0';

      // Hire status breakdown
      const hireStatusBreakdown = {
        pending: hires.filter(h => h.status === 'pending').length,
        pendingApproval: hires.filter(h => h.status === 'pending_approval').length,
        active: activeHires.length,
        ended: hires.filter(h => h.status === 'ended').length,
        paid: paidHires.length,
      };

      stats = {
        ...stats,
        uniqueClientsHiredHim: new Set(hires.map(h => h.client?._id?.toString())).size,
        paidClientsCount,                     // ← your requested metric
        totalPaidAmount,
        totalHire,
        adminCommissionAmount,
        driverShareAmount,
        totalBookedHours,
        averageRating: parseFloat(averageRating),
        totalReviewsReceived,
        hireStatusBreakdown,
        currentHireStatus: user.currentHireStatus || 'available',
      };
    } 
    else if (user.role === 'client') {
      // ─── Client: Find all hires they created ───────────────────────────
      const hires = await Hire.find({ client: userId })
        .populate('driver', 'firstName lastName email phone avatar rating')
        .lean();

      const paidHires = hires.filter(h => h.paymentStatus === 'paid');
      const activeHires = hires.filter(h => h.status === 'active');
      const pendingHires = hires.filter(h => ['pending', 'pending_approval'].includes(h.status));

      // Total unique drivers hired
      const uniqueDriversHired = new Set(hires.map(h => h.driver?._id?.toString())).size;

      // Total amount paid
      const totalAmountPaid = paidHires.reduce((sum, h) => sum + (h.amountOffered || 0), 0);

      // Hire status breakdown
      const hireStatusBreakdown = {
        awaitingApproval: pendingHires.length,
        active: activeHires.length,
        ended: hires.filter(h => h.status === 'ended').length,
        paid: paidHires.length,
      };

      stats = {
        ...stats,
        totalHiresMade: hires.length,
        uniqueDriversHired,
        totalAmountPaid,
        hireStatusBreakdown,
        timesHiredDrivers: user.timesHiredDrivers || 0, // counter if you kept it
      };
    }
   

    res.json({
      success: true,
      stats,
      user: {
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        referralCode: user.referralCode,
        referralPoints: user.referralPoints,
        referralCount: user.referralCount,
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getVerifiedDrivers = async (req, res) => {
  try {
    const drivers = await User.find({
      role: 'driver',
      isVerified: true,
    })
      .select('firstName lastName email phone avatar vehicle rating totalTrips')
      .sort({ rating: -1, totalTrips: -1 });

    res.json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    console.error('Get verified drivers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};





export const getFullProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch the main User document
    // We use .lean() for better performance since we aren't modifying the document here
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      });
    }

    // 2. Fetch related data from other collections in parallel
    // This is faster than awaiting them one by one
    const [guarantors, documents, driverProfile] = await Promise.all([
      Guarantor.find({ user: userId }).sort({ position: 1 }).lean(),
      Document.find({ user: userId }).lean(),
      DriverProfile.findOne({ user: userId }).lean(),
    ]);

    // 3. Assemble the final response
    // We merge the data into a single object for the frontend
    return res.status(200).json({
      status: true,
      message: 'Profile fetched successfully',
      data: {
        ...user,
        guarantors: guarantors || [],
        documents: documents || [],
        driverProfile: driverProfile || null, // Will be null for 'client' roles
      },
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to retrieve profile information',
      error: error.message,
    });
  }
};




// controllers/userController.js (add or update this function)

// GET User Profile (self or by ID) - now includes full address details
export const getUserProfile2 = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const user = await User.findById(userId).select("-password -resetPasswordToken -verificationToken -emailChangeToken");

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Explicitly include all address-related fields
    const profileData = {
      ...user.toJSON(),
      address: user.address || null,
      state: user.state || null,
      lga: user.lga || null,
      country: user.country || 'Nigeria',
      location: user.location || { type: 'Point', coordinates: [0, 0] }, // fallback geo if needed for future maps
      canDrive: user.role === 'driver',
      isDriver: user.role === 'driver',
      isClient: user.role === 'client',
    };

    res.json({
      status: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};










export const toggleLikeProvider = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user._id;

    const driver = await User.findById(id);
  

    const alreadyLiked = driver.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      driver.likes = driver.likes.filter((uid) => uid.toString() !== userId);
    } else {
      // Like
      driver.likes.push(userId);
    }

    await driver.save();
console.log("added")
    res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Unliked' : 'Liked',
      likesCount: driver.likes.length,
      isLiked: !alreadyLiked,
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// 4. Share Provider (just increment count)
// ────────────────────────────────────────────────
export const shareProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await User.findByIdAndUpdate(
      id,
      { $inc: { shares: 1 } },
      { new: true }
    ).select('shares');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'driver not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Shared successfully',
      shares: driver.shares,
    });
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const incrementDriverView = async (req, res) => {
  try {
    const { id } = req.params; // provider ID

    const driver = await User.findById(id);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }



    driver.views = (driver.views || 0) + 1;
    await driver.save({ validateBeforeSave: false }); // skip full validation for speed

    res.status(200).json({
      success: true,
      message: 'View counted',
      views: driver.views,
    });
  } catch (error) {
    console.error('Increment view error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
















export const getPaymentTimeline = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Admin commission rate
    const superadmin = await User.findOne({ role: 'superadmin' })
      .select('adminSettings.driverCommissionPercentage');
    const commissionRate = (superadmin?.adminSettings?.driverCommissionPercentage ?? 30) / 100;

    const now = new Date();

    // Define start dates for each period
    const periods = {
      today: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
      thisWeek: new Date(now.setDate(now.getDate() - now.getDay())), // Sunday start — adjust if Monday start needed
      thisMonth: new Date(now.getFullYear(), now.getMonth(), 1),
      thisYear: new Date(now.getFullYear(), 0, 1),

      // New periods (rolling windows)
      last30Days: new Date(now),
      last3Months: new Date(now),
      last6Months: new Date(now),
    };

    // Set rolling window start dates
    periods.last30Days.setDate(periods.last30Days.getDate() - 29); // includes today → 30 days
    periods.last3Months.setMonth(periods.last3Months.getMonth() - 3);
    periods.last6Months.setMonth(periods.last6Months.getMonth() - 6);

    // Reset 'now' in case it was modified
    now.setTime(Date.now());

    let result = {
      role: user.role,
      periods: {},
    };

    if (user.role === 'driver') {
      // ─── Driver: Earnings after commission ───────────────────────────────
      const hires = await Hire.find({
        driver: userId,
        paymentStatus: 'paid',
        // Optional: createdAt: { $gte: new Date('2023-01-01') } to limit very old data
      })
        .select('amountOffered createdAt')
        .lean();

      const earnings = {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        thisYear: 0,
        last30Days: 0,
        last3Months: 0,
        last6Months: 0,
        totalEver: 0,
      };

      // Optional: still useful for charts / recent activity
      const last30DaysDaily = new Array(30).fill(0);

      hires.forEach((hire) => {
        const amount = hire.amountOffered || 0;
        const driverShare = Math.round(amount * (1 - commissionRate)); // round once here

        earnings.totalEver += driverShare;

        const hireDate = new Date(hire.createdAt);

        // Rolling periods
        if (hireDate >= periods.last30Days)  earnings.last30Days  += driverShare;
        if (hireDate >= periods.last3Months) earnings.last3Months += driverShare;
        if (hireDate >= periods.last6Months) earnings.last6Months += driverShare;

        // Classic calendar periods
        if (hireDate >= periods.today)     earnings.today    += driverShare;
        if (hireDate >= periods.thisWeek)  earnings.thisWeek += driverShare;
        if (hireDate >= periods.thisMonth) earnings.thisMonth += driverShare;
        if (hireDate >= periods.thisYear)  earnings.thisYear += driverShare;

        // Last 30 days daily breakdown (0 = today, 29 = 29 days ago)
        const daysAgo = Math.floor((now - hireDate) / (86400000));
        if (daysAgo >= 0 && daysAgo < 30) {
          last30DaysDaily[daysAgo] += driverShare;
        }
      });

      result.periods = {
        earnings: {
          today: earnings.today,
          thisWeek: earnings.thisWeek,
          thisMonth: earnings.thisMonth,
          thisYear: earnings.thisYear,
          last30Days: earnings.last30Days,
          last3Months: earnings.last3Months,
          last6Months: earnings.last6Months,
          totalEver: earnings.totalEver,
          last30DaysDaily,           // optional – remove if frontend doesn't need it
        }
      };
    } 
    else if (user.role === 'client') {
      // ─── Client: Total amount PAID ────────────────────────────────────────
      const hires = await Hire.find({
        client: userId,
        paymentStatus: 'paid',
      })
        .select('amountOffered createdAt')
        .lean();

     const paid = {
  today: 0,
  thisWeek: 0,
  thisMonth: 0,
  thisYear: 0,
  last30Days: 0,
  last3Months: 0,
  last6Months: 0,
  totalEver: 0,
};

    hires.forEach(hire => {
  const amount = hire.amountOffered || 0;
  paid.totalEver += amount;

  const hireDate = new Date(hire.createdAt);

  // rolling windows
  if (hireDate >= periods.last30Days)  paid.last30Days  += amount;
  if (hireDate >= periods.last3Months) paid.last3Months += amount;
  if (hireDate >= periods.last6Months) paid.last6Months += amount;

  // calendar periods
  if (hireDate >= periods.today)     paid.today += amount;
  if (hireDate >= periods.thisWeek)  paid.thisWeek += amount;
  if (hireDate >= periods.thisMonth) paid.thisMonth += amount;
  if (hireDate >= periods.thisYear)  paid.thisYear += amount;
});

   result.periods = {
  paid: {
    today: Math.round(paid.today),
    thisWeek: Math.round(paid.thisWeek),
    thisMonth: Math.round(paid.thisMonth),
    thisYear: Math.round(paid.thisYear),
    last30Days: Math.round(paid.last30Days),
    last3Months: Math.round(paid.last3Months),
    last6Months: Math.round(paid.last6Months),
    totalEver: Math.round(paid.totalEver),
  }
};
    } 
    else {
      return res.status(403).json({ success: false, message: 'Role not supported' });
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('getPaymentTimeline error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};





























// Increment driver profile views
export const incrementDriverViews = async (req, res) => {
  try {
    const { driverId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      driverId,
      { $inc: { views: 1 } },        // Increment views by 1
      { new: true, select: 'views firstName lastName' }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "Driver not found"
      });
    }

    res.status(200).json({
      status: true,
      message: "View count updated",
      views: updatedUser.views
    });

  } catch (error) {
    console.error("Increment views error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to update view count"
    });
  }
};









export const searchDriversByName = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;

    if (!query || !query.trim()) {
      return res.status(422).json({
        success: false,
        message: 'A search query is required (name or email)',
      });
    }

    const searchTerm = query.trim();
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const filter = {
      role: 'driver',
      isDeleted: { $ne: true },
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: escaped,
              options: 'i',
            },
          },
        },
      ],
    };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [drivers, total] = await Promise.all([
      User.find(filter)
        .select('-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt -emailChangeToken -emailChangeExpiresAt')
        .populate('driverProfile') // fully populates the linked DriverProfile document
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: drivers,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('searchDriversByName error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to search drivers',
    });
  }
};








