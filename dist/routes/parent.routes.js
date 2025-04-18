"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/parent.routes.ts
const express_1 = __importDefault(require("express"));
const parent_controller_1 = require("../controllers/parent.controller");
const verifyParent_middleware_1 = require("../middlewars/verifyParent.middleware");
const router = express_1.default.Router();
// GET /api/parents/player/:playerId
// → only parents can call, and only for players they own
router.get("/player/:playerId", verifyParent_middleware_1.verifyParent, parent_controller_1.getPlayerAndMatchesForParent);
exports.default = router;
