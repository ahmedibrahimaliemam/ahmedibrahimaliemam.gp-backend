import express from "express";
import { initiateSubscriptionPayment } from "../controllers/payment.controller";
import { verifyParent } from "../middlewars/verifyParent.middleware";

const router = express.Router();

// POST /api/payment/initiate
router.post("/initiate",verifyParent,initiateSubscriptionPayment);

export default router;
