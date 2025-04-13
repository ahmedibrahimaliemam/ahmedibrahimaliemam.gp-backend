"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const coach_controller_1 = require("../controllers/coach.controller");
const auth_middleware_1 = require("../middlewars/auth.middleware");
const router = express_1.default.Router();
router.post("/add-match", coach_controller_1.addMatch);
router.post("/update-match", coach_controller_1.updateMatchResult);
router.delete("/delete-match/:id", auth_middleware_1.protect, coach_controller_1.deleteMatch);
router.get("/matches", auth_middleware_1.protect, coach_controller_1.getMatchesByCoach);
// In src/routes/coach.routes.ts
router.get("/test", (req, res) => {
    res.send("Coach routes are working!");
});
exports.default = router;
