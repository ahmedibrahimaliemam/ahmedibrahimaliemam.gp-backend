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
        const parentId = req.user._id;
        const parent = yield parent_model_1.default.findById(parentId);
        if (!parent) {
            res.status(404).json({ message: "Parent not found" });
            return;
        }
        const players = yield player_model_1.default.find({ _id: { $in: parent.players } }).select("-password");
        if (!players.length) {
            res.status(404).json({ message: "No players found for this parent" });
            return;
        }
        const playersWithMatches = yield Promise.all(players.map((player) => __awaiter(void 0, void 0, void 0, function* () {
            const matches = yield match_model_1.default.find({
                $or: [{ team1: player.Team_name }, { team2: player.Team_name }]
            }).sort({ date: -1 });
            return {
                player,
                matches
            };
        })));
        res.json({ players: playersWithMatches });
    }
    catch (error) {
        console.error("Error fetching parent’s player data:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getPlayerAndMatchesForParent = getPlayerAndMatchesForParent;
