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
exports.getMatchesByTeamId = exports.getAllMatches = exports.addPlayerToTeam = exports.addMatch = exports.deleteTeam = exports.getTeamByCoachId = exports.getTeamMatchResults = exports.getAllTeamsWithCoaches = exports.addTeam = void 0;
const team_model_1 = __importDefault(require("../models/team.model"));
const player_model_1 = __importDefault(require("../models/player.model"));
const match_model_1 = __importDefault(require("../models/match.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const coach_model_1 = __importDefault(require("../models/coach.model"));
const team_model_2 = __importDefault(require("../models/team.model"));
const addTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, logo } = req.body; // _id is the team id (string)
        // Create a new Team document; players and matchSchedule start as empty arrays.
        const newTeam = new team_model_1.default({ _id: name, name, logo, players: [], matchSchedule: [] });
        yield newTeam.save();
        res.status(201).json({ message: "Team added successfully", team: newTeam });
    }
    catch (error) {
        res.status(500).json({ message: "Error adding team", error });
    }
});
exports.addTeam = addTeam;
/**
 * GET /api/admin/teams
 * Admin can view all teams and their assigned coaches.
 */
const getAllTeamsWithCoaches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield team_model_1.default.find()
            .populate("coachId")
            .populate("players");
        const teamsWithFilteredMatches = yield Promise.all(teams.map((team) => __awaiter(void 0, void 0, void 0, function* () {
            // Fetch matches where team is either team1 or team2
            const filteredMatches = yield match_model_1.default.find({
                $or: [{ team1: team._id }, { team2: team._id }],
            });
            return Object.assign(Object.assign({}, team.toObject()), { matchSchedule: filteredMatches });
        })));
        res.status(200).json({ teams: teamsWithFilteredMatches });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching teams", error });
    }
});
exports.getAllTeamsWithCoaches = getAllTeamsWithCoaches;
/**
* GET /api/admin/teams/:teamId/results
* Admin can view the match results for a given team.
*/
const getTeamMatchResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(teamId)) {
            res.status(400).json({ message: "Invalid team ID" });
            return;
        }
        const matches = yield match_model_1.default.find({
            $or: [{ team1: teamId }, { team2: teamId }],
        }).populate("team1", "name").populate("team2", "name");
        const results = matches.map(match => {
            let status = "pending";
            const now = new Date();
            const matchDate = new Date(match.date);
            if (matchDate < now && match.team1Score !== null && match.team2Score !== null) {
                status = "finished";
            }
            else if (matchDate.toDateString() === now.toDateString()) {
                status = "live";
            }
            return {
                matchId: match._id,
                date: match.date,
                status,
                team1: match.team1,
                team2: match.team2,
                team1Score: match.team1Score,
                team2Score: match.team2Score,
            };
        });
        res.status(200).json({ teamId, results });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching match results", error });
    }
});
exports.getTeamMatchResults = getTeamMatchResults;
/**
* GET /api/admin/teams/:teamId
* Admin can get details of a specific team
*/
const getTeamByCoachId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { coachId } = req.params; // Changed from teamId to coachId
        const coach = yield coach_model_1.default.findById(coachId);
        if (!coach) {
            res.status(404).json({ message: "Coach not found" });
            return;
        }
        const team = yield team_model_2.default.findById(coach.teamId)
            .populate("players")
            .populate("coachId");
        if (!team) {
            res.status(404).json({ message: "Team not found for this coach" });
            return;
        }
        // Get matches where team is either team1 or team2
        const matches = yield match_model_1.default.find({
            $or: [{ team1: team._id }, { team2: team._id }]
        });
        const teamWithMatches = Object.assign(Object.assign({}, team.toObject()), { matchSchedule: matches // Replace with actual matches from query
         });
        res.status(200).json({ team: teamWithMatches });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching team by coachId", error });
    }
});
exports.getTeamByCoachId = getTeamByCoachId;
/**
 * DELETE /api/admin/teams/:teamId
 * Admin can delete a specific team
 */
const deleteTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamId } = req.params;
        const deletedTeam = yield team_model_1.default.findByIdAndDelete(teamId);
        if (!deletedTeam) {
            res.status(404).json({ message: "Team not found" });
            return;
        }
        res.status(200).json({ message: "Team deleted successfully", deletedTeam });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting team", error });
    }
});
exports.deleteTeam = deleteTeam;
const addMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, team1, team2, date } = req.body;
        // Validate required fields
        if (!_id || !team1 || !team2 || !date) {
            res.status(400).json({ message: "Missing required fields: _id, team1, team2, date" });
            return;
        }
        // Validate teams exist
        const [team1Exists] = yield Promise.all([
            team_model_1.default.findById(team1),
        ]);
        if (!team1Exists) {
            res.status(404).json({ message: "the Team not found" });
            return;
        }
        if (team1 === team2) {
            res.status(400).json({ message: "A team cannot play against itself" });
            return;
        }
        // Validate date format
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            res.status(400).json({ message: "Invalid date format" });
            return;
        }
        // Check for existing match ID
        const existingMatch = yield match_model_1.default.findById(_id);
        if (existingMatch) {
            res.status(409).json({ message: "Match ID already exists" });
            return;
        }
        // Create new match
        const newMatch = new match_model_1.default({
            _id,
            team1,
            team2,
            date: parsedDate,
            // team1Score and team2Score will default to null
        });
        yield newMatch.save();
        // Update both teams' match schedules
        yield Promise.all([
            team_model_1.default.updateOne({ _id: team1 }, { $push: { matchSchedule: _id } }),
            team_model_1.default.updateOne({ _id: team2 }, { $push: { matchSchedule: _id } })
        ]);
        // Return match with virtual status
        const createdMatch = yield match_model_1.default.findById(_id)
            .populate('team1', 'name')
            .populate('team2', 'name')
            .lean();
        res.status(201).json({
            message: "Match created successfully",
            match: Object.assign(Object.assign({}, createdMatch), { status: createdMatch === null || createdMatch === void 0 ? void 0 : createdMatch.status // Virtual field will be populated
             })
        });
    }
    catch (error) {
        console.error("Error adding match:", error);
        res.status(500).json({
            message: "Error adding match",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.addMatch = addMatch;
//add player to team
const addPlayerToTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamId } = req.params;
        const playerData = req.body;
        // Validate required fields
        if (!playerData.short_name) {
            res.status(400).json({ message: "Missing required  short_name" });
            return;
        }
        // 1. Validate team exists
        const team = yield team_model_1.default.findById(teamId);
        if (!team) {
            res.status(404).json({ message: "Team not found" });
            return;
        }
        // 3. Check for existing player
        if (yield player_model_1.default.exists({ _id: playerData.short_name })) {
            res.status(409).json({ message: "Player with this name already exists" });
            return;
        }
        // 4. Create player document
        const newPlayer = new player_model_1.default(Object.assign(Object.assign({}, playerData), { _id: playerData.short_name, Team_name: team._id, coachName: team.coachId }));
        // 5. Save player and update team
        yield Promise.all([
            newPlayer.save(),
            team_model_1.default.findByIdAndUpdate(teamId, { $push: { players: newPlayer._id } }, { new: true })
        ]);
        // 6. Return response
        const createdPlayer = yield player_model_1.default.findById(newPlayer._id)
            .populate('Team_name', 'name logo')
            .lean();
        res.status(201).json({
            message: "Player added to team successfully",
            player: Object.assign(Object.assign({}, createdPlayer), { team: createdPlayer === null || createdPlayer === void 0 ? void 0 : createdPlayer.Team_name, Team_name: undefined // Remove the raw reference
             })
        });
    }
    catch (error) {
        console.error("Error adding player:", error);
        res.status(500).json({
            message: "Error adding player to team",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.addPlayerToTeam = addPlayerToTeam;
const getAllMatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matches = yield match_model_1.default.find()
            .sort({ date: -1 }) // Sort by most recent first
            .lean();
        const formattedMatches = matches.map(match => ({
            _id: match._id,
            team1: match.team1,
            team2: match.team2,
            date: match.date,
            team1Score: match.team1Score,
            team2Score: match.team2Score,
            status: match.status // Virtual field from schema
        }));
        res.status(200).json({ matches: formattedMatches });
    }
    catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({
            message: "Error retrieving matches",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.getAllMatches = getAllMatches;
const getMatchesByTeamId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamId } = req.params;
        // Validate team exists
        const team = yield team_model_1.default.findById(teamId);
        if (!team) {
            res.status(404).json({ message: "Team not found" });
            return;
        }
        const matches = yield match_model_1.default.find({
            $or: [{ team1: teamId }, { team2: teamId }]
        })
            .sort({ date: 1 }) // Sort by upcoming matches first
            .lean();
        if (matches.length === 0) {
            res.status(404).json({ message: "No matches found for this team" });
            return;
        }
        const formattedMatches = matches.map(match => ({
            _id: match._id,
            team1: match.team1,
            team2: match.team2,
            date: match.date,
            team1Score: match.team1Score,
            team2Score: match.team2Score,
            status: match.status, // Virtual field
            isHomeGame: match.team1 === teamId // Add extra useful field
        }));
        res.status(200).json({
            teamId,
            teamName: team.name,
            matches: formattedMatches
        });
    }
    catch (error) {
        console.error("Error fetching team matches:", error);
        res.status(500).json({
            message: "Error retrieving team matches",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.getMatchesByTeamId = getMatchesByTeamId;
