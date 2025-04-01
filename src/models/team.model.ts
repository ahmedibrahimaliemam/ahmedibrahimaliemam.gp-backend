import mongoose, { Schema, Document } from "mongoose";

interface ITeam extends Document {
  _id: string;
  name: string;
  coachId: string; // ✅ Change ObjectId -> String
  players: string[]; // List of Player IDs
  matchSchedule: string[]; // List of Match IDs
}

const TeamSchema = new Schema<ITeam>({
  //_id: { type: String, required: true },
  name: { type: String, required: true },
  coachId: { type: String, ref: "Coach", required: true }, // ✅ Change ObjectId -> String
  players: [{ type: String, ref: "Player" }], // ✅ Change ObjectId -> String
  matchSchedule: [{ type: String, ref: "Match" }], // ✅ Change ObjectId -> String
});

export default mongoose.model<ITeam>("Team", TeamSchema);
