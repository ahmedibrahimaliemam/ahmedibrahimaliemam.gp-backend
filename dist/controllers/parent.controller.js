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
exports.getPlayerAndMatchesForParent = void 0;
const parent_model_1 = __importDefault(require("../models/parent.model"));
const player_model_1 = __importDefault(require("../models/player.model"));
const match_model_1 = __importDefault(require("../models/match.model"));
const getPlayerAndMatchesForParent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parentId = req.user._id; // from verifyParent
        const { playerId } = req.params;
        // 1) Load parent and verify they own this player
        const parent = yield parent_model_1.default.findById(parentId);
        if (!parent) {
            res.status(404).json({ message: "Parent not found" });
            return;
        }
        if (!parent.players.includes(playerId)) {
            res.status(403).json({ message: "You are not authorized to view this player" });
            return;
        }
        // 2) Load the player profile
        const player = yield player_model_1.default.findById(playerId).select("-password");
        if (!player) {
            res.status(404).json({ message: "Player not found" });
            return;
        }
        // 3) Load all matches where this player’s team plays
        const teamId = player.Team_name;
        const matches = yield match_model_1.default.find({
            $or: [{ team1: teamId }, { team2: teamId }]
        }).sort({ date: -1 });
        // 4) Return everything
        res.json({ player, matches });
    }
    catch (error) {
        console.error("Error in parent fetching player:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getPlayerAndMatchesForParent = getPlayerAndMatchesForParent;
