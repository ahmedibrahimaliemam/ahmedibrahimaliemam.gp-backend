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
exports.getPlayerByParent = exports.getFullAttendanceByDate = exports.markMultipleAttendances = exports.getAttendanceByDate = exports.markAttendance = exports.updatePlayerPosition = exports.getAllPlayers = exports.deletePlayer = exports.updatePlayer = exports.addPlayer = void 0;
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
//find the attendance of the player
const markAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { playerId, source } = req.body;
        if (!playerId) {
            res.status(400).json({ error: "playerId is required" });
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize to midnight
        // Check if the player exists
        const player = yield player_model_1.default.findById(playerId);
        if (!player) {
            res.status(404).json({ error: "Player not found" });
            return;
        }
        // Check if attendance already marked for today
        const alreadyMarked = (_a = player.attendance) === null || _a === void 0 ? void 0 : _a.some(record => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            recordDate.getTime() === today.getTime();
            return;
        });
        if (alreadyMarked) {
            res.status(200).json({ message: "Attendance already marked for today" });
            return;
        }
        // Push new attendance record
        (_b = player.attendance) === null || _b === void 0 ? void 0 : _b.push({
            date: new Date(),
            present: true,
            checkedInAt: new Date(),
            source: source || "face_recognition"
        });
        yield player.save();
        res.status(200).json({ message: "Attendance marked", playerId: player._id });
        return;
    }
    catch (err) {
        console.error("Attendance error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.markAttendance = markAttendance;
// ... existing markAttendance here ...
const getAttendanceByDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.query;
        if (!date || typeof date !== "string") {
            res.status(400).json({ error: "Please provide a valid date in YYYY-MM-DD format." });
            return;
        }
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            res.status(400).json({ error: "Invalid date format." });
            return;
        }
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        // Find players who have an attendance record matching the date
        const players = yield player_model_1.default.find({
            attendance: {
                $elemMatch: {
                    date: {
                        $gte: targetDate,
                        $lt: nextDay
                    }
                }
            }
        }).select("_id short_name attendance");
        // Filter to include only attendance records from that day
        const result = players.map(player => {
            var _a;
            const attendanceOnDate = ((_a = player.attendance) === null || _a === void 0 ? void 0 : _a.filter(record => {
                const recordDate = new Date(record.date);
                recordDate.setHours(0, 0, 0, 0);
                recordDate.getTime() === targetDate.getTime();
                return;
            })) || [];
            return {
                playerId: player._id,
                name: player.short_name,
                attendance: attendanceOnDate
            };
        });
        res.status(200).json(result);
    }
    catch (err) {
        console.error("Error fetching attendance:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAttendanceByDate = getAttendanceByDate;
// ... other functions ...
const markMultipleAttendances = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log(`tryyyyyy`);
        const { playerIds, source } = req.body;
        if (!Array.isArray(playerIds) || playerIds.length === 0) {
            res.status(400).json({ error: "playerIds must be a non-empty array." });
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const updatedPlayers = [];
        for (const id of playerIds) {
            const player = yield player_model_1.default.findById(id);
            if (!player)
                continue;
            const alreadyMarked = (_a = player.attendance) === null || _a === void 0 ? void 0 : _a.some(record => {
                const recordDate = new Date(record.date);
                recordDate.setHours(0, 0, 0, 0);
                return recordDate.getTime() === today.getTime();
            });
            if (!alreadyMarked) {
                (_b = player.attendance) === null || _b === void 0 ? void 0 : _b.push({
                    date: new Date(),
                    present: true,
                    checkedInAt: new Date(),
                    source: source || "face_recognition"
                });
                yield player.save();
                updatedPlayers.push({
                    playerId: player._id,
                    name: player.short_name
                });
            }
        }
        res.status(200).json({
            message: `Attendance marked for ${updatedPlayers.length} players.`,
            marked: updatedPlayers
        });
    }
    catch (err) {
        console.error("Error in multi-attendance:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.markMultipleAttendances = markMultipleAttendances;
//get full attendance
const getFullAttendanceByDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.query;
        if (!date || typeof date !== "string") {
            res.status(400).json({ error: "Please provide a valid date in YYYY-MM-DD format." });
            return;
        }
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            res.status(400).json({ error: "Invalid date format." });
            return;
        }
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        // Fetch all players
        const players = yield player_model_1.default.find().select("_id short_name attendance");
        const result = players.map(player => {
            var _a;
            const hasAttendance = (_a = player.attendance) === null || _a === void 0 ? void 0 : _a.some(record => {
                const recordDate = new Date(record.date);
                recordDate.setHours(0, 0, 0, 0);
                return recordDate.getTime() === targetDate.getTime();
            });
            return {
                playerId: player._id,
                name: player.short_name,
                attendance: hasAttendance
            };
        });
        res.status(200).json(result);
    }
    catch (err) {
        console.error("Error fetching full attendance:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getFullAttendanceByDate = getFullAttendanceByDate;
//get player by parent ID
const getPlayerByParent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const authReq = req;
        const parentId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id; // assuming JWT has user.id
        if (!parentId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const player = yield player_model_1.default.findOne({ parentId });
        if (!player) {
            res.status(404).json({ error: "No player found for this parent" });
            return;
        }
        res.status(200).json(player);
    }
    catch (err) {
        console.error("Error fetching player's data for parent:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getPlayerByParent = getPlayerByParent;
