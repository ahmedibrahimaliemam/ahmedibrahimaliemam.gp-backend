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
exports.deleteMatch = exports.updateMatch = exports.addMatch = void 0;
const match_model_1 = __importDefault(require("../models/match.model"));
const coach_model_1 = __importDefault(require("../models/coach.model"));
/**
 * Compute match status based on its date:
 * - Returns ISO date string if the match is in the future
 * - "live" if now is within 90 minutes after start
 * - "finished" if more than 90 minutes have passed
 */
function computeStatus(date) {
    const now = Date.now();
    const matchTime = date.getTime();
    const ninetyMins = 90 * 60 * 1000;
    if (now < matchTime) {
        return date.toISOString();
    }
    else if (now - matchTime <= ninetyMins) {
        return "live";
    }
    else {
        return "finished";
    }
}
/**
 * POST /api/matches
 * Coach adds a new match.
 */
const addMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const coach = authReq.user;
        const { _id, team2, date } = req.body;
        console.log("the coach team id is ", coach);
        const AllCoach = yield coach_model_1.default.findById(coach._id);
        console.log(`all coach is `, AllCoach);
        if (!(AllCoach === null || AllCoach === void 0 ? void 0 : AllCoach.teamId)) {
            res.status(400).json({ message: "Coach is not assigned to any team" });
            return;
        }
        if (!team2 || !date) {
            res.status(400).json({ message: "team2 and date are required" });
            return;
        }
        const newMatch = yield match_model_1.default.create({
            _id,
            team1: AllCoach === null || AllCoach === void 0 ? void 0 : AllCoach.teamId,
            team2,
            date: new Date(date),
            team1Score: null,
            team2Score: null,
        });
        const matchObj = newMatch.toObject();
        matchObj.status = computeStatus(newMatch.date);
        res.status(201).json({ message: "Match added", match: matchObj });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error adding match", error: err });
    }
});
exports.addMatch = addMatch;
/**
 * PATCH /api/matches/:id
 * Partial update to a match (e.g. to set scores or reschedule).
 */
const updateMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        const match = yield match_model_1.default.findById(id);
        if (!match) {
            res.status(404).json({ message: "Match not found" });
            return;
        }
        Object.assign(match, updates);
        yield match.save();
        const matchObj = match.toObject();
        matchObj.status = computeStatus(match.date);
        res.status(200).json({ message: "Match updated", match: matchObj });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating match", error: err });
    }
});
exports.updateMatch = updateMatch;
/**
 * DELETE /api/matches/:id
 * Remove a match.
 */
const deleteMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield match_model_1.default.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ message: "Match not found" });
            return;
        }
        res.status(200).json({ message: "Match deleted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting match", error: err });
    }
});
exports.deleteMatch = deleteMatch;
