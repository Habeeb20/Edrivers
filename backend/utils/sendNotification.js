
import { sendEmail } from "./sendEmail.js";
import User from "../models/User.js";


export const sendNotification = async (userId, title, message, options = {}) => {
  try {

    const user = await User.findById(userId).select("email firstName");

    if (!user) {
      console.log("User not found for notification:", userId);
      return;
    }
 
    const { link, data = {} } = options;

    // Default app link
    const appLink = link || `https://edrivers.ng/notifications`;

    // Beautiful HTML Email
    await sendEmail({
      to: user.email,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #1065c0; text-align: center; margin-bottom: 20px;">${title}</h2>
          
          <div style="background: white; padding: 24px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${user.firstName}</strong>,<br><br>
              ${message.replace(/\n/g, "<br>")}
            </p>

            ${link ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" 
                   style="background: #1065c0; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Open in App →
                </a>
              </div>
            ` : ""}

            <hr style="border: 1px dashed #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">
              © 2025 YourApp • Nigeria's #1 Driver & Car Platform
            </p>
          </div>
        </div>
      `
    });

    console.log(`Email sent to ${user.email}: ${title}`);
  } catch (error) {
    console.error("Email notification failed:", error.message);
   
  }
};