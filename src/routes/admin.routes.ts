import express from "express";
import { addTeam, getAllTeamsWithCoaches, getTeamMatchResults,deleteTeam, getTeamByCoachId } from "../controllers/admin.controller";
import { adminAuthMiddleware } from "../middlewars/adminauth.middleware";
import { verifyAdmin } from "../controllers/auth.controller";
const router = express.Router();

router.post("/add-team", verifyAdmin,addTeam);
router.get("/teams", verifyAdmin ,getAllTeamsWithCoaches);
router.get("/teams/:coachId", verifyAdmin,getTeamByCoachId);
router.delete("/teams/:teamId", verifyAdmin,deleteTeam);
router.get("/teams/:teamId/results", adminAuthMiddleware, getTeamMatchResults);

export default router;
