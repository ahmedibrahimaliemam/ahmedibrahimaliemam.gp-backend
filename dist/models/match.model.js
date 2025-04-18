"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/match.model.ts
const mongoose_1 = __importStar(require("mongoose"));
const MatchSchema = new mongoose_1.Schema({
    _id: { type: String, required: true },
    team1: { type: String, ref: "Team", required: true },
    team2: { type: String, ref: "Team", required: true },
    date: { type: Date, required: true },
    team1Score: { type: Number, default: null },
    team2Score: { type: Number, default: null },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual `status` computed at runtime
MatchSchema.virtual("status").get(function () {
    const now = Date.now();
    const matchTime = this.date.getTime();
    const ninetyMins = 90 * 60 * 1000;
    if (now < matchTime) {
        // match in future → return ISO date string
        return this.date.toISOString();
    }
    else if (now - matchTime <= ninetyMins) {
        // within 90 minutes of start → live
        return "live";
    }
    else {
        // more than 90 minutes past → finished
        return "finished";
    }
});
exports.default = mongoose_1.default.model("Match", MatchSchema);
