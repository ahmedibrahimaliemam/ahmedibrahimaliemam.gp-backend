import express from "express";
import {  initiateSubscriptionPayment, paymobCallback } from "../controllers/payment.controller";
import { verifyParent } from "../middlewars/verifyParent.middleware";
import { verifyParentSubscription } from "../middlewars/verifyParentSubscrib";

const router = express.Router();

// POST /api/payment/initiate
router.post("/initiate",verifyParent,initiateSubscriptionPayment);
router.post("/paymob/callback", verifyParent,paymobCallback);
router.get("/paymob/callback", (req, res) => {
  res.send("Callback URL is working (GET). Use POST for real payment updates.");
});

// Example protected route
router.get("/parent/dashboard", verifyParent, verifyParentSubscription, (req, res) => {
  res.json({ message: "Access to subscribed dashboard granted." });
});
export default router;
