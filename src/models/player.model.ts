import mongoose, { Schema, Document } from "mongoose";

interface IPlayer extends Document {
  _id: string; // Phone number
  name: string;
  email:string;
  position: string;
  coachId: string;
  teamId: string;
  password: string;
}

const PlayerSchema = new Schema<IPlayer>({
  _id: { type: String, required: true }, // Phone number as _id
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"] // Basic email validation
  },
  position: { type: String, required: true },
  coachId: { type: String, ref: "Coach", required: true }, // ✅ Change ObjectId -> String
  teamId: { type: String, ref: "Team", required: true }, // ✅ Change ObjectId -> String
  password: { type: String, required: true },
});

export default mongoose.model<IPlayer>("Player", PlayerSchema);
