// src/routes/match.routes.ts
import express from "express";
import {
  addMatch,
  updateMatch,
  deleteMatch,
} from "../controllers/match.controller";
import { protect } from "../middlewars/auth.middleware";

const router = express.Router();

router.post("/", protect, addMatch);        // create
router.patch("/:id", protect, updateMatch);  // partial update
router.delete("/:id", protect, deleteMatch);

export default router;
