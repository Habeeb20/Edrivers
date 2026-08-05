

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';


// Email transporter setup (configure with your SMTP details in .env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,  // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 1. Hash Password
export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 12);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

// 2. Compare Password
// 2. Compare Password
export const comparePassword = async (candidatePassword, userPassword) => {
 
  if (!userPassword) {
    throw new Error('User password not found—check query selection');
  }
  if (!candidatePassword) {
    throw new Error('Candidate password is required');
  }

  try {
    return await bcrypt.compare(candidatePassword, userPassword);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// 3. Generate JWT Token
export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }  // Adjust expiry as needed
  );
};

// 4. Verify JWT Token (returns decoded payload or throws error)
export const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// 5. Generate Reset Password Token (using crypto for security)
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// 6. Hash Reset Token (for storage in DB)
export const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// 7. Send Verification Email
export const sendVerificationEmail = async (user) => {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);  // 24 hours

  // Save token to user
  user.verificationToken = verificationToken;
  user.verificationTokenExpiresAt = verificationTokenExpiresAt;
  await user.save();

  const verificationURL = `${process.env.CLIENT_URL}/verify/${verificationToken}`;  // Adjust to your frontend URL

  const mailOptions = {
    from:`"EDrivers"`,
    to: user.email,
    subject: 'Verify Your Email - DriverHireApp',
    html: `
      <h1>Email Verification</h1>
      <p>Hi ${user.firstName},</p>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationURL}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// 8. Verify Email Token and Activate User
export const verifyEmailToken = async (token) => {
  const hashedToken = hashResetToken(token);  // Reuse hash for consistency

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  user.verificationStatus = 'verified';
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  return user;
};

// 9. Forgot Password (Generate & Send Reset Token)
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('No user found with this email');
  }

  const resetToken = generateResetToken();
  const hashedToken = hashResetToken(resetToken);
  const resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);  // 1 hour

  // Save to user
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiresAt = resetPasswordExpiresAt;
  await user.save();

  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;  // Frontend URL

  const mailOptions = {
    from:  `"Edrivers" <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Password Reset - DriverHireApp',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.firstName},</p>
      <p>You requested a password reset. Click the link below:</p>
      <a href="${resetURL}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);

  return { message: 'Reset token sent to email' };
};

// 10. Reset Password (Validate Token & Update)
export const resetPassword = async (token, newPassword) => {
  const hashedToken = hashResetToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  return user;
};

// 11. Change Password (For logged-in users)
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user || !(await comparePassword(currentPassword, user.password))) {
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};

// 12. Send Email Change Request (If needed for updating email)
export const sendEmailChangeRequest = async (user, newEmail) => {
  const emailChangeToken = generateResetToken();
  const hashedToken = hashResetToken(emailChangeToken);
  const emailChangeExpiresAt = new Date(Date.now() + 60 * 60 * 1000);  // 1 hour

  // Save temp new email and token
  user.newEmail = newEmail;
  user.emailChangeToken = hashedToken;
  user.emailChangeExpiresAt = emailChangeExpiresAt;
  await user.save();

  const changeURL = `${process.env.CLIENT_URL}/change-email/${emailChangeToken}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: newEmail,  // Send to new email for confirmation
    subject: 'Confirm Email Change - DriverHireApp',
    html: `
      <h1>Confirm Email Change</h1>
      <p>Hi,</p>
      <p>Confirm your email change by clicking:</p>
      <a href="${changeURL}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm New Email</a>
      <p>This link expires in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// 13. Confirm Email Change
export const confirmEmailChange = async (token) => {
  const hashedToken = hashResetToken(token);

  const user = await User.findOne({
    emailChangeToken: hashedToken,
    emailChangeExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired email change token');
  }

  // Verify new email isn't taken
  const existingUser = await User.findOne({ email: user.newEmail });
  if (existingUser && existingUser._id.toString() !== user._id.toString()) {
    throw new Error('New email is already in use');
  }

  user.email = user.newEmail;
  user.newEmail = undefined;
  user.emailChangeToken = undefined;
  user.emailChangeExpiresAt = undefined;
  await user.save();

  return user;
};

// 14. Generate Slug (If not auto-generated in model; utility for updates)
export const generateSlug = (email, firstName, lastName) => {
  const base = email ? email.split('@')[0] : `${firstName}-${lastName}`.toLowerCase();
  return slugify(`${base}-${Date.now()}`, { lower: true, strict: true });
};

// Usage Example (in controller):
// import { hashPassword, generateToken, sendVerificationEmail } from '../utils/authUtils.js';
// Then: const hashed = await hashPassword(req.body.password);