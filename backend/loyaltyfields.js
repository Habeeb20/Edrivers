import mongoose from "mongoose";
import User from "./models/userModel.js";
import dotenv from "dotenv"
dotenv.config()

async function addLoyaltyField() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await User.updateMany(
      { loyaltyPoints: { $exists: false } },           // only users missing the field
      { 
        $set: { 
          loyaltyPoints: 0,
          loyaltyTransactions: []                        // optional
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} users with loyaltyPoints: 0`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to add loyaltyPoints field:', err);
    process.exit(1);
  }
}

addLoyaltyField();