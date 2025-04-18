"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
//router.post("/register/player",verifyAdmin, validateRegistration, handleValidationErrors, registerPlayer);
router.post("/register/coach", auth_controller_1.verifyAdmin, auth_controller_1.handleValidationErrors, auth_controller_1.registerCoach);
router.post("/register/parent", auth_controller_1.verifyAdmin, auth_controller_1.handleValidationErrors, auth_controller_1.registerParent);
router.post("/register/admin", auth_controller_1.validateRegistration, auth_controller_1.handleValidationErrors, auth_controller_1.registerAdmin);
router.post("/login", auth_controller_1.login);
router.get("/admins", auth_controller_1.getAllAdmins);
exports.default = router;
