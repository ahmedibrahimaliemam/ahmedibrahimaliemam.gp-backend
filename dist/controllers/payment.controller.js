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
exports.initiateSubscriptionPayment = void 0;
const axios_1 = __importDefault(require("axios"));
const parent_model_1 = __importDefault(require("../models/parent.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//payment
const initiateSubscriptionPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { parentId, amount } = req.body;
    const parent = yield parent_model_1.default.findById(parentId);
    if (!parent) {
        res.status(404).json({ message: "Parent not found" });
        return;
    }
    try {
        // 1. Get Auth Token
        const { data: authResp } = yield axios_1.default.post("https://accept.paymob.com/api/auth/tokens", {
            api_key: process.env.PAYMOB_API_KEY
        });
        const token = authResp.token;
        // 2. Create Order
        const { data: orderResp } = yield axios_1.default.post("https://accept.paymob.com/api/ecommerce/orders", {
            auth_token: token,
            delivery_needed: false,
            amount_cents: (amount * 100).toString(),
            currency: "EGP",
            items: []
        });
        // 3. Payment Key
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
                last_name: "Farhan",
                state: "Cairo"
            },
            currency: "EGP",
            integration_id: Number(process.env.PAYMOB_INTEGRATION_ID)
        });
        const paymentToken = payKeyResp.token;
        // 4. Send iframe link to frontend
        const iframeURL = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
        res.json({ iframeURL });
    }
    catch (error) {
        console.error("Payment error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({ message: "Error initiating payment", error });
    }
});
exports.initiateSubscriptionPayment = initiateSubscriptionPayment;
