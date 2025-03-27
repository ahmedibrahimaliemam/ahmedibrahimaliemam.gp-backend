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
exports.login = exports.registerPlayer = exports.registerAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const player_model_1 = __importDefault(require("../models/player.model"));
const coach_model_1 = __importDefault(require("../models/coach.model"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
dotenv_1.default.config();
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
// ✅ Register Admin (Fixed)
const registerAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, name, password, secretCode } = req.body;
        if (secretCode !== process.env.ADMIN_SECRET) {
            res.status(403).json({ message: "Invalid secret code" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const admin = yield admin_model_1.default.create({ _id, name, password: hashedPassword });
        res.status(201).json({ message: "Admin registered", token: generateToken(admin._id, "admin") });
    }
    catch (error) {
        res.status(500).json({ message: "Error registering admin" });
    }
});
exports.registerAdmin = registerAdmin;
// ✅ Register Player (Fixed)
const registerPlayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, name, position, coachId, teamId, password } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const player = yield player_model_1.default.create({ _id, name, position, coachId, teamId, password: hashedPassword });
        res.status(201).json({ message: "Player registered", token: generateToken(player._id, "player") });
    }
    catch (error) {
        res.status(500).json({ message: "Error registering player" });
    }
});
exports.registerPlayer = registerPlayer;
// ✅ Login (Fixed)
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, password, role } = req.body;
        let user;
        if (role === "player")
            user = yield player_model_1.default.findById(_id);
        else if (role === "coach")
            user = yield coach_model_1.default.findById(_id);
        else if (role === "admin")
            user = yield admin_model_1.default.findById(_id);
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        res.json({ message: "Login successful", token: generateToken(user._id, role) });
    }
    catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
});
exports.login = login;
