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
exports.getTeamMatchResults = exports.getAllTeamsWithCoaches = exports.addTeam = void 0;
const team_model_1 = __importDefault(require("../models/team.model"));
const match_model_1 = __importDefault(require("../models/match.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const addTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, name, coachId } = req.body; // _id is the team id (string)
        // Create a new Team document; players and matchSchedule start as empty arrays.
        const newTeam = new team_model_1.default({ _id, name, coachId, players: [], matchSchedule: [] });
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
        const teams = yield team_model_1.default.find().populate("coachId", "name _id");
        res.status(200).json({ teams });
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
