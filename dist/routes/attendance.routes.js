"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewars/auth.middleware");
const attendance_controller_1 = require("../controllers/attendance.controller");
const router = express_1.default.Router();
// src/routes/attendance.routes.ts
router.post("/face", auth_middleware_1.protect, attendance_controller_1.takeAttendance);
exports.default = router;
