import { RequestHandler } from "express";
import { runFaceRecognition } from "../services/faceRecognitionService";
import Player from "../models/player.model";
import Attendance from "../models/attendance.model";

export const takeAttendance: RequestHandler = async (req, res) => {
  try {
    // 1. Run the face recognition script
    const recognizedPlayerIds = await runFaceRecognition();

    if (!recognizedPlayerIds || recognizedPlayerIds.length === 0) {
       res.status(404).json({ message: "No players recognized" });
       return;
    }

    // 2. Find players in the DB that match the recognized IDs
    const matchedPlayers = await Player.find({
      _id: { $in: recognizedPlayerIds },
    });

    // 3. Save attendance record
    const attendanceRecords = await Promise.all(
      matchedPlayers.map(async (player) => {
        const record = new Attendance({
          playerId: player._id,
          date: new Date(),
          status: "present",
        });
        return await record.save();
      })
    );

    res.status(200).json({
      message: "Attendance taken successfully",
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error("Face attendance error:", error);
    res.status(500).json({ message: "Failed to take attendance", error });
  }
};
