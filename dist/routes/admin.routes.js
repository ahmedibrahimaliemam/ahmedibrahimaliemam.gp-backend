"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const adminauth_middleware_1 = require("../middlewars/adminauth.middleware");
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
router.post("/add-team", auth_controller_1.verifyAdmin, admin_controller_1.addTeam);
router.get("/teams", auth_controller_1.verifyAdmin, admin_controller_1.getAllTeamsWithCoaches);
// Get all matches
router.get('/matches', auth_controller_1.verifyAdmin, admin_controller_1.getAllMatches);
// Get matches for specific team
router.get('/teams/:teamId/matches', auth_controller_1.verifyAdmin, admin_controller_1.getMatchesByTeamId);
router.get("/teams/:coachId", auth_controller_1.verifyAdmin, admin_controller_1.getTeamByCoachId);
router.post('/teams/:teamId/players', auth_controller_1.verifyAdmin, admin_controller_1.addPlayerToTeam);
router.post("/matches", auth_controller_1.verifyAdmin, admin_controller_1.addMatch);
router.delete("/teams/:teamId", auth_controller_1.verifyAdmin, admin_controller_1.deleteTeam);
router.get("/teams/:teamId/results", adminauth_middleware_1.adminAuthMiddleware, admin_controller_1.getTeamMatchResults);
exports.default = router;
