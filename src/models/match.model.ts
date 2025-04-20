// src/models/match.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
  _id: string;              // Match ID
  team1: string;            // Team1’s ID
  team2: string;            // Team2’s ID
  date: Date;               // Scheduled date/time
  team1Score: number | null;
  team2Score: number | null;
  status?: string;          // Virtual: "pending" (ISO), "live", or "finished"
}

const MatchSchema = new Schema<IMatch>(
  {
    _id: { type: String, required: true },
    team1: { type: String, ref: "Team", required: true },
    team2: { type: String, ref: "Team", required:true },
    date: { type: Date, required: true },
    team1Score: { type: Number, default: null },
    team2Score: { type: Number, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual `status` computed at runtime
MatchSchema.virtual("status").get(function (this: IMatch) {
  const now = Date.now();
  const matchTime = this.date.getTime();
  const ninetyMins = 90 * 60 * 1000;

  if (now < matchTime) {
    // match in future → return ISO date string
    return this.date.toISOString();
  } else if (now - matchTime <= ninetyMins) {
    // within 90 minutes of start → live
    return "live";
  } else {
    // more than 90 minutes past → finished
    return "finished";
  }
});

export default mongoose.model<IMatch>("Match", MatchSchema);
