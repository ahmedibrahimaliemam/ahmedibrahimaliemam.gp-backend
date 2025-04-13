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
exports.deleteMatch = exports.getMatchesByCoach = exports.updateMatchResult = exports.addMatch = void 0;
const match_model_1 = __importDefault(require("../models/match.model"));
const coach_model_1 = __importDefault(require("../models/coach.model"));
const team_model_1 = __importDefault(require("../models/team.model"));
// Add Match: if match date is in the future, the match status will show the scheduled date;
// if the match is now or in the past, it will show "live".
const addMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, team1, team2, date } = req.body; // _id is the match id provided by the client
        const matchDate = new Date(date);
        const now = new Date();
        // Determine status based on matchDate and current time.
        let status;
        if (matchDate > now) {
            // Future match: status displays the formatted future date.
            status = matchDate.toLocaleString();
        }
        else {
            // Match is now (or in the past): status is "live"
            status = "live";
        }
        const newMatch = new match_model_1.default({
            _id,
            team1,
            team2,
            date: matchDate,
            team1Score: 0,
            team2Score: 0,
            status,
        });
        yield newMatch.save();
        res.status(201).json({ message: "Match added successfully", match: newMatch });
    }
    catch (error) {
        res.status(500).json({ message: "Error adding match", error });
    }
});
exports.addMatch = addMatch;
// Update Match Result: updates the scores and sets the status to "finished" once a result is posted.
const updateMatchResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { matchId, team1Score, team2Score } = req.body;
        const match = yield match_model_1.default.findById(matchId);
        if (!match) {
            res.status(404).json({ message: "Match not found" });
            return;
        }
        match.team1Score = team1Score;
        match.team2Score = team2Score;
        match.status = "finished";
        yield match.save();
        res.status(200).json({ message: "Match result updated", match });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating match result", error });
    }
});
exports.updateMatchResult = updateMatchResult;
const getMatchesByCoach = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // req.user should be populated from the auth middleware (e.g., via JWT decode)
        const authReq = req;
        const coachId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log("id ", authReq.user);
        if (!coachId) {
            res.status(403).json({ message: "Not authorized" });
            return;
        }
        // Find the coach document
        const coach = yield coach_model_1.default.findById(coachId);
        if (!coach) {
            res.status(404).json({ message: "Coach not found" });
            return;
        }
        // Get the team id from the coach document
        console.log('coach', coach);
        const teamId = coach.teamId;
        if (!teamId) {
            res.status(404).json({ message: "Team not assigned to this coach" });
            return;
        }
        // Find the team document by its id
        const team = yield team_model_1.default.findById(teamId);
        if (!team) {
            res.status(404).json({ message: "Team not found" });
            return;
        }
        // Retrieve matches using the matchSchedule array from the team document
        const matches = yield match_model_1.default.find({
            $or: [{ team1: teamId }, { team2: teamId }],
        });
        // Alternatively, if you prefer, you could query for matches where team1 equals the team's id:
        // const matches = await Match.find({ team1: teamId });
        res.status(200).json({ message: "Matches retrieved successfully", matches });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving matches", error });
    }
});
exports.getMatchesByCoach = getMatchesByCoach;
// Delete Match
const deleteMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const match = yield match_model_1.default.findById(id);
        if (!match) {
            res.status(404).json({ message: "Match not found" });
            return;
        }
        yield match_model_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Match deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting match", error });
    }
});
exports.deleteMatch = deleteMatch;
