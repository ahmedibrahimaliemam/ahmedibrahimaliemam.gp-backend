import express from "express";
import { addPlayer, updatePlayer, deletePlayer, getAllPlayers , updatePlayerPosition, markAttendance, getAttendanceByDate, markMultipleAttendances, getFullAttendanceByDate } from "../controllers/player.controller";
import { protect } from "../middlewars/auth.middleware"; // Your auth middleware for verifying JWT token

const router = express.Router();

// These endpoints are protected; only authorized admins or coaches (via the JWT token) can perform them.
router.post("/", protect, addPlayer); 
router.post("/attendance",protect,markAttendance);

router.post("/multipleAttendance",protect,markMultipleAttendances);
router.get("/attendance",protect,getAttendanceByDate);
router.get("/getFullAttendance",protect,getFullAttendanceByDate);
router.get("/",protect,getAllPlayers);            // Endpoint to add a new player
router.put("/:id", protect, updatePlayer);           // Endpoint to update a player by id
router.delete("/:id", protect, deletePlayer);        // Endpoint to delete a player by id
router.patch("/:id/position", protect,updatePlayerPosition); // PATCH /players/123/position

export default router;
