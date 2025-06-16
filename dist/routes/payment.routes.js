"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const verifyParent_middleware_1 = require("../middlewars/verifyParent.middleware");
const router = express_1.default.Router();
// POST /api/payment/initiate
router.post("/initiate", verifyParent_middleware_1.verifyParent, payment_controller_1.initiateSubscriptionPayment);
exports.default = router;
