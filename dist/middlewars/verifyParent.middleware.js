"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyParent = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Call this after your JWT “protect” middleware if you have one.
// Or merge into your existing protect, checking role === 'parent'.
const verifyParent = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!(auth === null || auth === void 0 ? void 0 : auth.startsWith("Bearer "))) {
        res.status(401).json({ message: "Missing token" });
        return;
    }
    const token = auth.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "parent") {
            res.status(403).json({ message: "Forbidden: Parents only" });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};
exports.verifyParent = verifyParent;
