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
// Add Match
const addMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authReq = req;
        const coach = authReq.user;
        const { team2, date } = req.body;
        if (!team2 || !date) {
            return res.status(400).json({ message: "team2 and date are required" });
        }
        const newMatch = yield match_model_1.default.create({
            team1: coach.teamId,
            team2,
            date,
            status: new Date(date) > new Date() ? "pending" : "live",
        });
        res.status(201).json({ message: "Match added", match: newMatch });
    }
    catch (err) {
        res.status(500).json({ message: "Error adding match", error: err });
    }
});
exports.addMatch = addMatch;
// Update Match
const updateMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matchId = req.params.id;
        const updates = req.body;
        const match = yield match_model_1.default.findById(matchId);
        if (!match)
            return res.status(404).json({ message: "Match not found" });
        Object.assign(match, updates);
        match.status = new Date(match.date) > new Date() ? "pending" : "live";
        yield match.save();
        res.status(200).json({ message: "Match updated", match });
    }
    catch (err) {
        res.status(500).json({ message: "Error updating match", error: err });
    }
});
exports.updateMatch = updateMatch;
// Delete Match
const deleteMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matchId = req.params.id;
        const match = yield match_model_1.default.findByIdAndDelete(matchId);
        if (!match)
            return res.status(404).json({ message: "Match not found" });
        res.status(200).json({ message: "Match deleted" });
    }
    catch (err) {
        res.status(500).json({ message: "Error deleting match", error: err });
    }
});
exports.deleteMatch = deleteMatch;
