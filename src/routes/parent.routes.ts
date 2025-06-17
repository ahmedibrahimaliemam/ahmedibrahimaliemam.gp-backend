// src/routes/parent.routes.ts
import express from "express";
import { getPlayerAndMatchesForParent } from "../controllers/parent.controller";
import { verifyParent } from "../middlewars/verifyParent.middleware";

const router = express.Router();

// GET /api/parents/player/:playerId
// → only parents can call, and only for players they own
router.get(
  "/players",
  verifyParent,
  getPlayerAndMatchesForParent
);



export default router;
