import mongoose, { Schema, Document } from "mongoose";

interface AttendanceRecord {
  date: Date;
  present: boolean;
  checkedInAt?: Date;
  source?: string;
}

export interface IPlayer extends Document {
  _id: string;
  overall: number;
  height_cm: number;
  weight_kg: number;
  club_position: string;
  attacking_crossing: number;
  club_name: string;
  short_name: string;
  coachName: string;
  Team_name: string;
  preferred_foot?: string;
  weak_foot?: number;
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physic?: number;
  player_face_url?: string;
  goalkeeping_diving?: number;
  goalkeeping_handling?: number;
  goalkeeping_kicking?: number;
  goalkeeping_positioning?: number;
  goalkeeping_reflexes?: number;
  goalkeeping_speed?: number;
  parentId: string;

  attendance?: AttendanceRecord[];
}

const PlayerSchema = new Schema<IPlayer>(
  {
    _id: { type: String, required: true },
    short_name: { type: String, required: true },
    coachName: { type: String, ref: "Coach" },
    parentId: { type: String, ref: "Parent" },  // ✅ Add this
    Team_name: { type: String, ref: "Team", required: true },
    preferred_foot: { type: String },
    club_position: { type: String },
    weak_foot: { type: Number },
    weight_kg: { type: Number },
    pace: { type: Number },
    attacking_crossing: { type: Number },
    shooting: { type: Number },
    passing: { type: Number },
    dribbling: { type: Number },
    height_cm: { type: Number },
    defending: { type: Number },
    overall: { type: Number },
    physic: { type: Number },
    club_name: { type: String },
    player_face_url: { type: String },
    goalkeeping_diving: { type: Number },
    goalkeeping_handling: { type: Number },
    goalkeeping_kicking: { type: Number },
    goalkeeping_positioning: { type: Number },
    goalkeeping_reflexes: { type: Number },
    goalkeeping_speed: { type: Number },

    attendance: [{
      date: { type: Date, required: true },
      present: { type: Boolean, required: true },
      checkedInAt: { type: Date },
      source: { type: String }
    }]
  },
  { timestamps: true }
);

export default mongoose.model<IPlayer>("Player", PlayerSchema);
