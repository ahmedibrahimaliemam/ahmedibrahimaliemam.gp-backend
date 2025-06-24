import mongoose, { Schema, Document } from "mongoose";

export interface ITeam extends Document {
  _id: string;          // Team ID as string
  name: string;
  logo:string;
  coachId: string;      // Coach's ID as string
  players: string[];    // List of Player IDs (strings)
  matchSchedule: string[]; // List of Match IDs (strings)
}

const TeamSchema = new Schema<ITeam>({
  _id: { type: String, required: true }, // Ensure _id is a String, not ObjectId
  name: { type: String, required: true },
  logo:{type: String },
  coachId: { type: String, ref: "Coach" }, // Coach ID is also a string
  players: [{ type: String, ref: "Player" }],               // Player IDs as strings
  matchSchedule: [{ type: String, ref: "Match" }],          // Match IDs as strings
});

export default mongoose.model<ITeam>("Team", TeamSchema);
