import mongoose, { Schema, Document } from "mongoose";

interface IMatch extends Document {
  _id: string;
  team1: string; // ✅ Change ObjectId → String
  team2: string; // ✅ Change ObjectId → String
  date: Date;
  team1Score: number;
  team2Score: number;
}

const MatchSchema = new Schema<IMatch>({
  _id: { type: String, required: true }, // Match ID
  team1: { type: String, ref: "Team", required: true }, // ✅ Use String instead of ObjectId
  team2: { type: String, ref: "Team", required: true }, // ✅ Use String instead of ObjectId
  date: { type: Date, required: true },
  team1Score: { type: Number, default: 0 },
  team2Score: { type: Number, default: 0 },
});

export default mongoose.model<IMatch>("Match", MatchSchema);
