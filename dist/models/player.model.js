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
const mongoose_1 = __importStar(require("mongoose"));
const PlayerSchema = new mongoose_1.Schema({
    _id: { type: String, required: true },
    short_name: { type: String, required: true },
    coachName: { type: String, ref: "Coach" },
    parentId: { type: String, ref: "Parent" }, // ✅ Add this
    Team_name: { type: String, ref: "Team", required: true },
    preferred_foot: { type: String },
    club_position: { type: String },
    weak_foot: { type: Number },
    weight_kg: { type: Number },
    pace: { type: Number },
    attacking_crossing: { type: Number },
    shooting: { type: Number },
    passing: { type: Number },
    dribbling: { type: Number },
    height_cm: { type: Number },
    defending: { type: Number },
    overall: { type: Number },
    physic: { type: Number },
    club_name: { type: String },
    player_face_url: { type: String },
    goalkeeping_diving: { type: Number },
    goalkeeping_handling: { type: Number },
    goalkeeping_kicking: { type: Number },
    goalkeeping_positioning: { type: Number },
    goalkeeping_reflexes: { type: Number },
    goalkeeping_speed: { type: Number },
    attendance: [{
            date: { type: Date, required: true },
            present: { type: Boolean, required: true },
            checkedInAt: { type: Date },
            source: { type: String }
        }]
}, { timestamps: true });
exports.default = mongoose_1.default.model("Player", PlayerSchema);
