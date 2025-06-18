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
exports.verifyParentSubscription = void 0;
const parent_model_1 = __importDefault(require("../models/parent.model"));
const verifyParentSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const parentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const parent = yield parent_model_1.default.findById(parentId);
    if (!parent) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    if (parent.subscriptionExpiresAt && new Date() > parent.subscriptionExpiresAt) {
        parent.isSubscribed = false;
        yield parent.save();
    }
    if (!parent.isSubscribed) {
        res.status(403).json({ message: "Subscription expired. Please renew." });
        return;
    }
    next();
});
exports.verifyParentSubscription = verifyParentSubscription;
