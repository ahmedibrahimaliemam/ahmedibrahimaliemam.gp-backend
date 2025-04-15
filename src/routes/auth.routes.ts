import express from "express";
import {registerAdmin,login, getAllAdmins,  validateRegistration,
    handleValidationErrors,
    verifyAdmin,
    registerCoach,
    registerParent, } from "../controllers/auth.controller";

const router = express.Router();

//router.post("/register/player",verifyAdmin, validateRegistration, handleValidationErrors, registerPlayer);
router.post("/register/coach",verifyAdmin, handleValidationErrors, registerCoach);
router.post("/register/parent",verifyAdmin,handleValidationErrors,registerParent)
router.post("/register/admin",validateRegistration, handleValidationErrors , registerAdmin);
router.post("/login", login);
router.get("/admins",getAllAdmins) ;

export default router;
