import mongoose from "mongoose"
import dotenv from "dotenv"
import { cleanupOldConversationIndex } from "./scripts/cleanIndexes.js"

dotenv.config()

export const connectDb = async(req, res) => {
    try {
         const connectDatabase = await mongoose.connect(process.env.MONGO_URI)
         if(connectDatabase){
            console.log(`MongoDB connected, build it big, build it real: `);
    //         console.log('Running one-time index cleanup...');
    // await cleanupOldConversationIndex();
         }
  
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
 
}