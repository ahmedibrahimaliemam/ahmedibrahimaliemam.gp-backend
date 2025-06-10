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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlayerPosition = exports.getAllPlayers = exports.deletePlayer = exports.updatePlayer = exports.addPlayer = void 0;
const player_model_1 = __importDefault(require("../models/player.model"));
const team_model_1 = __importDefault(require("../models/team.model"));
// Helper function to check if user is admin or coach.
const isAdminOrCoach = (user) => {
    return user && (user.role === "admin" || user.role === "coach");
};
/**
 * Add a new Player.
 * Only accessible by admin and coach.
 *
 * Note: 'password' and 'position' are removed from this endpoint.
 * Adjust your model accordingly if these fields are required.
 */
const addPlayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { short_name, coachName, Team_name, preferred_foot, club_position, weak_foot, weight_kg, height_cm, overall, pace, shooting, passing, dribbling, defending, physic, player_face_url, goalkeeping_diving, goalkeeping_handling, goalkeeping_kicking, goalkeeping_positioning, goalkeeping_reflexes, goalkeeping_speed, } = req.body;
        // ✅ Check if the team exists
        const team = yield team_model_1.default.findById(Team_name);
        if (!team) {
            res.status(400).json({ message: `Team '${Team_name}' does not exist` });
            return;
        }
        // ✅ Create and save player
        const newPlayer = new player_model_1.default({
            _id: short_name,
            short_name,
            coachName,
            Team_name,
            preferred_foot,
            club_position,
            weak_foot,
            weight_kg,
            height_cm,
            overall,
            pace,
            shooting,
            passing,
            dribbling,
            defending,
            physic,
            player_face_url,
            goalkeeping_diving,
            goalkeeping_handling,
            goalkeeping_kicking,
            goalkeeping_positioning,
            goalkeeping_reflexes,
            goalkeeping_speed,
        });
        yield newPlayer.save();
        // ✅ Optionally, push player to the team.players array
        if (!team.players.includes(short_name)) {
            team.players.push(short_name);
            yield team.save();
        }
        res.status(201).json({ message: "Player added successfully", player: newPlayer });
    }
    catch (error) {
        console.error("Error adding player:", error);
        res.status(500).json({ message: "Error adding player", error });
    }
});
exports.addPlayer = addPlayer;
/**
 * Update an existing Player.
 * Only accessible by admin and coach.
 *
 * Note: The fields 'password' and 'position' will not be updated by this endpoint.
 */
const updatePlayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const authReq = req;
        const user = authReq.user;
        if (!isAdminOrCoach(user)) {
            res.status(403).json({ message: "Unauthorized: Only admins and coaches can update players" });
            return;
        }
        // Find the player document.
        const player = yield player_model_1.default.findById(id);
        if (!player) {
            res.status(404).json({ message: "Player not found" });
            return;
        }
        // Remove password and position if included in the request body.
        const _a = req.body, { password, position } = _a, updates = __rest(_a, ["password", "position"]);
        // Merge updates into the player document.
        Object.assign(player, updates);
        yield player.save();
        res.status(200).json({ message: "Player updated successfully", player });
        return;
    }
    catch (error) {
        console.error("Error updating player:", error);
        res.status(500).json({ message: "Error updating player", error });
        return;
    }
});
exports.updatePlayer = updatePlayer;
/**
 * Delete an existing Player.
 * Only accessible by admin and coach.
 */
const deletePlayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const authReq = req;
        const user = authReq.user;
        if (!isAdminOrCoach(user)) {
            res.status(403).json({ message: "Unauthorized: Only admins and coaches can delete players" });
            return;
        }
        const player = yield player_model_1.default.findByIdAndDelete(id);
        if (!player) {
            res.status(404).json({ message: "Player not found" });
            return;
        }
        res.status(200).json({ message: "Player deleted successfully" });
        return;
    }
    catch (error) {
        console.error("Error deleting player:", error);
        res.status(500).json({ message: "Error deleting player", error });
        return;
    }
});
exports.deletePlayer = deletePlayer;
// ✅ Get All Players
const getAllPlayers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield player_model_1.default.find({}).populate("Team_name", "name coachId");
        res.status(200).json(players);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving players", error });
    }
});
exports.getAllPlayers = getAllPlayers;
/**
 * Update ONLY the position of a player.
 * Only accessible by admin and coach.
 */
const updatePlayerPosition = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { club_position } = req.body; // Expecting only 'club_position' in the request body
        const authReq = req;
        const user = authReq.user;
        // Check if user is admin or coach
        if (!isAdminOrCoach(user)) {
            res.status(403).json({
                message: "Unauthorized: Only admins and coaches can update player positions"
            });
            return;
        }
        // Find and update ONLY the player's position
        const updatedPlayer = yield player_model_1.default.findByIdAndUpdate(id, { club_position }, // Update only the position field
        { new: true } // Return the updated player
        );
        if (!updatedPlayer) {
            res.status(404).json({ message: "Player not found" });
            return;
        }
        res.status(200).json({
            message: "Player position updated successfully",
            player: updatedPlayer
        });
    }
    catch (error) {
        console.error("Error updating player position:", error);
        res.status(500).json({
            message: "Error updating player position",
            error
        });
    }
});
exports.updatePlayerPosition = updatePlayerPosition;
