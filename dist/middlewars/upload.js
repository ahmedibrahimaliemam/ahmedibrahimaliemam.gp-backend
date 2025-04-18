"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// src/middleware/upload.ts
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads')); // adjust the path as needed
    },
    filename: (req, file, cb) => {
        // Create a unique file name based on Date.now()
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
exports.upload = (0, multer_1.default)({ storage });
