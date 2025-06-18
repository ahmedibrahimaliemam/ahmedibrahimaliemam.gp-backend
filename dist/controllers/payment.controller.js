"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymobCallback = exports.initiateSubscriptionPayment = void 0;
const axios_1 = __importDefault(require("axios"));
const parent_model_1 = __importDefault(require("../models/parent.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// STEP 1: Initiate Subscription Payment
const initiateSubscriptionPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { amount } = req.body;
    const parentId = req.user._id;
    const parent = yield parent_model_1.default.findById(parentId);
    if (!parent) {
        res.status(404).json({ message: "Parent not found" });
        return;
    }
    try {
        // Get Paymob Token
        const { data: authResp } = yield axios_1.default.post("https://accept.paymob.com/api/auth/tokens", {
            api_key: process.env.PAYMOB_API_KEY,
        });
        const token = authResp.token;
        // Create Order
        const { data: orderResp } = yield axios_1.default.post("https://accept.paymob.com/api/ecommerce/orders", {
            auth_token: token,
            delivery_needed: false,
            amount_cents: (amount * 100).toString(),
            currency: "EGP",
            items: [],
        });
        // Save Paymob Order ID to Parent
        parent.paymobOrderId = orderResp.id;
        yield parent.save();
        // Create Payment Key
        const { data: payKeyResp } = yield axios_1.default.post("https://accept.paymob.com/api/acceptance/payment_keys", {
            auth_token: token,
            amount_cents: (amount * 100).toString(),
            expiration: 3600,
            order_id: orderResp.id,
            billing_data: {
                apartment: "NA",
                email: parent.email,
                floor: "NA",
                first_name: parent.name,
                street: "NA",
                building: "NA",
                phone_number: parent.phoneNumber,
                shipping_method: "NA",
                postal_code: "NA",
                city: "Cairo",
                country: "EG",
                last_name: "N/A",
                state: "Cairo"
            },
            currency: "EGP",
            integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
        });
        const iframeURL = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${payKeyResp.token}`;
        res.json({ iframeURL });
    }
    catch (error) {
        console.error("Payment error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({ message: "Error initiating payment", error });
    }
});
exports.initiateSubscriptionPayment = initiateSubscriptionPayment;
const paymobCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("Paymob callback received:", req.body);
        const { obj } = req.body;
        if (!((_a = obj === null || obj === void 0 ? void 0 : obj.order) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(400).json({ message: "Invalid callback payload" });
            return;
        }
        const parent = yield parent_model_1.default.findOne({ paymobOrderId: obj.order.id });
        if (!parent) {
            res.status(404).json({ message: "Parent not found for order" });
            return;
        }
        if (obj.success) {
            parent.isSubscribed = true;
            parent.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            yield parent.save();
        }
        res.status(200).json({ message: "Payment status processed" });
    }
    catch (err) {
        console.error("Callback error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.paymobCallback = paymobCallback;
