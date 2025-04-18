"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeAttendance = void 0;
const faceRecognitionService_1 = require("../services/faceRecognitionService");
const player_model_1 = __importDefault(require("../models/player.model"));
const attendance_model_1 = __importDefault(require("../models/attendance.model"));
const takeAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Run the face recognition script
        const recognizedPlayerIds = yield (0, faceRecognitionService_1.runFaceRecognition)();
        if (!recognizedPlayerIds || recognizedPlayerIds.length === 0) {
            res.status(404).json({ message: "No players recognized" });
            return;
        }
        // 2. Find players in the DB that match the recognized IDs
        const matchedPlayers = yield player_model_1.default.find({
            _id: { $in: recognizedPlayerIds },
        });
        // 3. Save attendance record
        const attendanceRecords = yield Promise.all(matchedPlayers.map((player) => __awaiter(void 0, void 0, void 0, function* () {
            const record = new attendance_model_1.default({
                playerId: player._id,
                date: new Date(),
                status: "present",
            });
            return yield record.save();
        })));
        res.status(200).json({
            message: "Attendance taken successfully",
            attendance: attendanceRecords,
        });
    }
    catch (error) {
        console.error("Face attendance error:", error);
        res.status(500).json({ message: "Failed to take attendance", error });
    }
});
exports.takeAttendance = takeAttendance;
