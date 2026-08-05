// import nodemailer from "nodemailer";

// export const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: `"EDrivers" <${process.env.SMTP_USER}>`,
//     to: options.to,
//     subject: options.subject,
//     html: options.html,
//   });
// };


import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken"
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      currentRole: user.currentRole,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  family: 4,
  auth: {
     user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Edrivers" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};
