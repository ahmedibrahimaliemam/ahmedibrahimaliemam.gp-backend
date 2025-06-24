import express from "express";
import {registerAdmin,login, getAllAdmins,  validateRegistration,
    handleValidationErrors,
    verifyAdmin,
    registerCoach,
    registerParent,
    changePassword, } from "../controllers/auth.controller";
import { protect } from "../middlewars/auth.middleware";

const router = express.Router();

//router.post("/register/player",verifyAdmin, validateRegistration, handleValidationErrors, registerPlayer);
router.post("/register/coach",verifyAdmin, handleValidationErrors, registerCoach);
router.post("/register/parent",verifyAdmin,handleValidationErrors,registerParent)
router.post("/register/admin",validateRegistration, handleValidationErrors , registerAdmin);
router.post("/login", login);
router.get("/admins",getAllAdmins) ;
router.post("/change-password",protect,changePassword);

export default router;
