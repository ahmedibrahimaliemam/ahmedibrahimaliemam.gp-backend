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
exports.importPlayersFromExcel = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const player_model_1 = __importDefault(require("../models/player.model"));
const team_model_1 = __importDefault(require("../models/team.model"));
const importPlayersFromExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const workbook = xlsx_1.default.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const playersData = xlsx_1.default.utils.sheet_to_json(worksheet);
        const validPlayers = [];
        const rejectedPlayers = [];
        for (const player of playersData) {
            const teamId = ((_a = player.Team_name) === null || _a === void 0 ? void 0 : _a._id) || player.Team_name; // لو جاي من الإكسل كـ object
            const teamExists = yield team_model_1.default.exists({ _id: teamId });
            if (teamExists) {
                const formattedPlayer = Object.assign(Object.assign({}, player), { Team_name: teamId, parentId: player.parentId || undefined, _id: player._id || player.short_name });
                validPlayers.push(formattedPlayer);
                const team = yield team_model_1.default.findById(teamId);
                if (team) {
                    team.players.push(formattedPlayer._id);
                    yield team.save();
                }
            }
            else {
                rejectedPlayers.push({
                    player,
                    reason: `Team '${teamId}' not found in database`,
                });
            }
        }
        const insertedPlayers = yield player_model_1.default.insertMany(validPlayers);
        fs_1.default.unlinkSync(req.file.path);
        res.status(200).json({
            message: 'Import complete',
            insertedCount: insertedPlayers.length,
            rejectedCount: rejectedPlayers.length,
            insertedPlayers,
            rejectedPlayers,
        });
    }
    catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ message: 'Error importing players', error });
    }
});
exports.importPlayersFromExcel = importPlayersFromExcel;
