import express from "express";
import { protect } from "../middlewars/auth.middleware";
import { modelPrediction } from "../controllers/attendance.controller";
const router = express.Router();
// src/routes/attendance.routes.ts
router.post("/face", protect, modelPrediction);

export default router;