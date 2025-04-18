import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceRecord {
  playerId: string;
  status: "present" | "absent";
}

export interface IAttendance extends Document {
  teamId: string;
  coachId: string;
  date: Date;
  records: IAttendanceRecord[];
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    teamId: { type: String, ref: "Team", required: true },
    coachId: { type: String, ref: "Coach", required: true },
    date: { type: Date, required: true },
    records: [
      {
        playerId: { type: String, ref: "Player", required: true },
        status: { type: String, enum: ["present", "absent"], required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);
