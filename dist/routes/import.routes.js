"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/import.routes.ts
const express_1 = __importDefault(require("express"));
const import_controller_1 = require("../controllers/import.controller");
const upload_1 = require("../middlewars/upload");
const router = express_1.default.Router();
// POST /api/import/players - uploads an Excel file with player data.
router.post('/players', upload_1.upload.single('file'), import_controller_1.importPlayersFromExcel);
exports.default = router;
