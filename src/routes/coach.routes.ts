import express from "express";
import { addMatch, updateMatchResult ,getMatchesByCoach,deleteMatch, getAllCoachesWithTeamsAndPlayers } from "../controllers/coach.controller";
import { protect } from "../middlewars/auth.middleware";
import { verifyAdmin } from "../controllers/auth.controller";
const router = express.Router();

router.post("/add-match", protect,addMatch);
router.post("/update-match", protect ,updateMatchResult);
router.delete("/delete-match/:id", protect, deleteMatch);
router.get("/matches", protect,getMatchesByCoach);
router.get("/", verifyAdmin, getAllCoachesWithTeamsAndPlayers);
// In src/routes/coach.routes.ts
router.get("/test", (req, res) => {
    res.send("Coach routes are working!");
  });
  

export default router;
