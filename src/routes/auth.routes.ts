import express from "express";
import { registerPlayer,registerAdmin,login } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register/player", registerPlayer);
router.post("/register/admin", registerAdmin);
router.post("/login", login);

export default router;
