"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const adminauth_middleware_1 = require("../middlewars/adminauth.middleware");
const router = express_1.default.Router();
router.post("/add-team", admin_controller_1.addTeam);
router.get("/teams", admin_controller_1.getAllTeamsWithCoaches);
router.get("/teams/:teamId/results", adminauth_middleware_1.adminAuthMiddleware, admin_controller_1.getTeamMatchResults);
exports.default = router;
