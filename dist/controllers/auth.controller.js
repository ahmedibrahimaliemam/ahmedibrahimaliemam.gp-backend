"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = exports.handleValidationErrors = exports.validateRegistration = exports.getAllAdmins = exports.login = exports.registerParent = exports.registerAdmin = exports.registerCoach = void 0;
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const team_model_1 = __importDefault(require("../models/team.model"));
const parent_model_1 = __importDefault(require("../models/parent.model"));
const coach_model_1 = __importDefault(require("../models/coach.model"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const player_model_1 = __importDefault(require("../models/player.model"));
dotenv_1.default.config();
// ✅ Generate JWT Token
const generateToken = (_id, role) => {
    return jsonwebtoken_1.default.sign({ _id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
// ✅ Middleware to Verify Admin Token
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            res.status(403).json({ message: "Forbidden: Only admins can perform this action" });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
});
exports.verifyAdmin = verifyAdmin;
// ✅ Validation Middleware
const validateRegistration = [
    (0, express_validator_1.check)("email").isEmail().withMessage("Invalid email format"),
    (0, express_validator_1.check)("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.check)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.check)("secretCode").optional().notEmpty().withMessage("Secret code is required"),
];
exports.validateRegistration = validateRegistration;
// ✅ Handle Validation Errors Middleware
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// ✅ Register Admin
const registerAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, secretCode } = req.body;
        if (secretCode !== process.env.ADMIN_SECRET) {
            res.status(403).json({ message: "Invalid secret code" });
            return;
        }
        const existingAdmin = yield admin_model_1.default.findOne({ email });
        if (existingAdmin) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const admin = yield admin_model_1.default.create({ _id: name, name, email, password: hashedPassword });
        res.status(201).json({ message: "Admin registered", token: generateToken(admin._id, "admin") });
    }
    catch (error) {
        res.status(500).json({ message: "Error registering admin", error });
    }
});
exports.registerAdmin = registerAdmin;
// ✅ Register Coach
const registerCoach = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phoneNumber, teamId, password } = req.body;
        // Check if coach with the given email already exists.
        const existingCoach = yield coach_model_1.default.findOne({ email });
        if (existingCoach) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
        // Check if the provided teamId exists in the Team collection.
        const team = yield team_model_1.default.findById(teamId);
        if (!team) {
            res.status(400).json({ message: "Team does not exist" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create the coach; here _id is set to name (adjust as required for your application)
        const coach = yield coach_model_1.default.create({ _id: name, name, email, phoneNumber, teamId, password: hashedPassword });
        res.status(201).json({ message: "Coach registered", token: generateToken(coach._id, "coach") });
    }
    catch (error) {
        res.status(500).json({ message: "Error registering coach", error });
    }
});
exports.registerCoach = registerCoach;
// ✅ Register Parent (Admin only)
const registerParent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, name, email, password, players } = req.body;
        // Check if parent's email is already in use
        const existingParent = yield parent_model_1.default.findOne({ email });
        if (existingParent) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
        // Verify that each player in the players array exists in the database
        if (players && Array.isArray(players) && players.length > 0) {
            for (const playerId of players) {
                const playerExists = yield player_model_1.default.findById(playerId);
                if (!playerExists) {
                    res.status(400).json({ message: `Player with id ${playerId} does not exist` });
                    return;
                }
            }
        }
        // Hash the parent's password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create the parent record, using name as _id (adjust as needed)
        const parent = yield parent_model_1.default.create({
            _id: name,
            phoneNumber,
            name,
            email,
            password: hashedPassword,
            players,
        });
        res.status(201).json({ message: "Parent registered successfully", parent });
    }
    catch (error) {
        res.status(500).json({ message: "Error registering parent", error });
    }
});
exports.registerParent = registerParent;
// ✅ Login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            res.status(400).json({ message: "Email, password, and role are required" });
            return;
        }
        let user;
        if (role === "coach") {
            user = yield coach_model_1.default.findOne({ email });
        }
        else if (role === "admin") {
            user = yield admin_model_1.default.findOne({ email });
        }
        else if (role === "parent") {
            user = yield parent_model_1.default.findOne({ email });
        }
        else {
            res.status(400).json({ message: "Invalid role provided" });
            return;
        }
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }
        const token = generateToken(user._id, role);
        res.json({
            message: "Login successful",
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error logging in", error });
    }
});
exports.login = login;
// ✅ Get All Admins
const getAllAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield admin_model_1.default.find({}, "_id name");
        res.status(200).json(admins);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving admins", error });
    }
});
exports.getAllAdmins = getAllAdmins;
