import express from "express";
import { addTeam, getAllTeamsWithCoaches, getTeamMatchResults,deleteTeam, getTeamByCoachId, addMatch, addPlayerToTeam, getAllMatches, getMatchesByTeamId } from "../controllers/admin.controller";
import { adminAuthMiddleware } from "../middlewars/adminauth.middleware";
import { verifyAdmin } from "../controllers/auth.controller";
const router = express.Router();

router.post("/add-team", verifyAdmin,addTeam);
router.get("/teams", verifyAdmin ,getAllTeamsWithCoaches);
// Get all matches
router.get('/matches', verifyAdmin,getAllMatches);

// Get matches for specific team
router.get('/teams/:teamId/matches',verifyAdmin, getMatchesByTeamId);
router.get("/teams/:coachId", verifyAdmin,getTeamByCoachId);
router.post('/teams/:teamId/players', verifyAdmin,addPlayerToTeam);
router.post("/matches",verifyAdmin,addMatch);
router.delete("/teams/:teamId", verifyAdmin,deleteTeam);
router.get("/teams/:teamId/results", adminAuthMiddleware, getTeamMatchResults);

export default router;
