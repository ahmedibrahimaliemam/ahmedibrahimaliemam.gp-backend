import mongoose from "mongoose";
import dotenv from "dotenv";
import Player from "../models/player.model";
import parentModel from "../models/parent.model";
import coachModel from "../models/coach.model";
import adminModel from "../models/admin.model";

dotenv.config();



export const syncPlayerIndexes = async () => {
  try {
    // await coachModel.syncIndexes();
    // await adminModel.syncIndexes() ;
    // await parentModel.syncIndexes();
    await Player.syncIndexes(); // This will update indexes to match your current schema.
    console.log("Player indexes synchronized.");
  } catch (error) {
    console.error("Error synchronizing indexes:", error);
  }
};

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};


