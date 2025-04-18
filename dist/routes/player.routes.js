"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const player_controller_1 = require("../controllers/player.controller");
const auth_middleware_1 = require("../middlewars/auth.middleware"); // Your auth middleware for verifying JWT token
const router = express_1.default.Router();
// These endpoints are protected; only authorized admins or coaches (via the JWT token) can perform them.
router.post("/", auth_middleware_1.protect, player_controller_1.addPlayer);
router.get("/", auth_middleware_1.protect, player_controller_1.getAllPlayers); // Endpoint to add a new player
router.put("/:id", auth_middleware_1.protect, player_controller_1.updatePlayer); // Endpoint to update a player by id
router.delete("/:id", auth_middleware_1.protect, player_controller_1.deletePlayer); // Endpoint to delete a player by id
exports.default = router;
