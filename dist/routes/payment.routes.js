"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const verifyParent_middleware_1 = require("../middlewars/verifyParent.middleware");
const verifyParentSubscrib_1 = require("../middlewars/verifyParentSubscrib");
const router = express_1.default.Router();
// POST /api/payment/initiate
router.post("/initiate", verifyParent_middleware_1.verifyParent, payment_controller_1.initiateSubscriptionPayment);
router.post("/paymob/callback", verifyParent_middleware_1.verifyParent, payment_controller_1.paymobCallback);
router.get("/paymob/callback", (req, res) => {
    res.send("Callback URL is working (GET). Use POST for real payment updates.");
});
// Example protected route
router.get("/parent/dashboard", verifyParent_middleware_1.verifyParent, verifyParentSubscrib_1.verifyParentSubscription, (req, res) => {
    res.json({ message: "Access to subscribed dashboard granted." });
});
exports.default = router;
