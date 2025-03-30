import express from "express";
import { registerPlayer,registerAdmin,login, getAllAdmins,  validateRegistration,
    handleValidationErrors,
    verifyAdmin,
    registerCoach, } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register/player",verifyAdmin, validateRegistration, handleValidationErrors, registerPlayer);
router.post("/register/coach",verifyAdmin, validateRegistration, handleValidationErrors, registerCoach);
router.post("/register/admin",validateRegistration, handleValidationErrors , registerAdmin);
router.post("/login", login);
router.get("/admins",getAllAdmins) ;

export default router;
