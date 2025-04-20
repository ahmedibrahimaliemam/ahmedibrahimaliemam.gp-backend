"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const coach_controller_1 = require("../controllers/coach.controller");
const auth_middleware_1 = require("../middlewars/auth.middleware");
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
//router.post("/add-match", protect,addMatch);
//router.post("/update-match", protect ,updateMatchResult);
//router.delete("/delete-match/:id", protect, deleteMatch);
router.get("/matches", auth_middleware_1.protect, coach_controller_1.getMatchesByCoach);
router.get("/", auth_controller_1.verifyAdmin, coach_controller_1.getAllCoachesWithTeamsAndPlayers);
router.get('/my-team', auth_middleware_1.protect, coach_controller_1.getTeamForCurrentCoach);
// In src/routes/coach.routes.ts
router.get("/test", (req, res) => {
    res.send("Coach routes are working!");
});
exports.default = router;
