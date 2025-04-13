import express from "express";
import { addMatch, updateMatchResult ,getMatchesByCoach,deleteMatch } from "../controllers/coach.controller";
import { protect } from "../middlewars/auth.middleware";
const router = express.Router();

router.post("/add-match", addMatch);
router.post("/update-match", updateMatchResult);
router.delete("/delete-match/:id", protect, deleteMatch);
router.get("/matches", protect,getMatchesByCoach);
// In src/routes/coach.routes.ts
router.get("/test", (req, res) => {
    res.send("Coach routes are working!");
  });
  

export default router;
