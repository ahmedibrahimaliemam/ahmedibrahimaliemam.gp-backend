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
exports.getTeamForCurrentCoach = exports.getAllCoachesWithTeamsAndPlayers = exports.getMatchesByCoach = exports.updateMatchResult = exports.addMatch = void 0;
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
        const coachId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a._id;
        console.log("id hhhhh", authReq.user);
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
// export const deleteMatch: RequestHandler = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const match = await Match.findById(id);
//       if (!match) {
//         res.status(404).json({ message: "Match not found" });
//         return;
//       }
//       await Match.findByIdAndDelete(id);
//       res.status(200).json({ message: "Match deleted successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Error deleting match", error });
//     }
//   };
// src/controllers/coach.controller.ts
const getAllCoachesWithTeamsAndPlayers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Load coaches and populate their single team
        const coaches = yield coach_model_1.default.find({}, "_id name email phoneNumber teamId")
            .populate({
            path: "teamId",
            select: "_id name players",
            populate: {
                path: "players",
                select: "_id short_name Team_name",
            },
        })
            .exec();
        // 2) Shape the response
        const result = coaches.map((coach) => ({
            coachId: coach._id,
            coachName: coach.name,
            email: coach.email,
            phoneNumber: coach.phoneNumber,
            team: coach.teamId
        }));
        res.status(200).json({ coaches: result });
        return;
    }
    catch (error) {
        console.error("Error fetching coaches:", error);
        res
            .status(500)
            .json({ message: "Error fetching coaches", error });
        return;
    }
});
exports.getAllCoachesWithTeamsAndPlayers = getAllCoachesWithTeamsAndPlayers;
const getTeamForCurrentCoach = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const authReq = req;
        const coachId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a._id; // This is the phone number string
        if (!coachId) {
            res.status(403).json({ message: "Not authorized" });
            return;
        }
        // Find coach with deep population
        const coach = yield coach_model_1.default.findById(coachId)
            .populate({
            path: 'teamId',
            model: 'Team',
            populate: {
                path: 'players',
                model: 'Player',
                select: '_id short_name Team_name position age nationality' // Match Player model
            }
        })
            .lean()
            .exec();
        if (!coach) {
            res.status(404).json({ message: "Coach not found" });
            return;
        }
        if (!coach.teamId || typeof coach.teamId === 'string') {
            res.status(404).json({ message: "No team assigned to this coach" });
            return;
        }
        // Type guard for populated team
        const team = coach.teamId;
        // Build response
        const response = {
            coach: {
                _id: coach._id,
                name: coach.name,
                email: coach.email,
                phoneNumber: coach.phoneNumber
            },
            team: {
                _id: team._id,
                name: team.name,
                logo: team.logo,
                players: team.players.map(player => ({
                    id: player._id,
                    shortName: player.short_name,
                    teamName: player.Team_name,
                    position: player.position,
                    age: player.age,
                    nationality: player.nationality
                }))
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error fetching coach's team:", error);
        res.status(500).json({
            message: "Error retrieving team details",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.getTeamForCurrentCoach = getTeamForCurrentCoach;
