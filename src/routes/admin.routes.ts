import express from "express";
import { addTeam, getAllTeamsWithCoaches, getTeamMatchResults } from "../controllers/admin.controller";
import { adminAuthMiddleware } from "../middlewars/adminauth.middleware";
const router = express.Router();

router.post("/add-team", addTeam);
router.get("/teams",  getAllTeamsWithCoaches);
router.get("/teams/:teamId/results", adminAuthMiddleware, getTeamMatchResults);

export default router;
