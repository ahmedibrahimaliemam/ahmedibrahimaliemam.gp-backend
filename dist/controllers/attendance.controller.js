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
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelPrediction = modelPrediction;
const faceRecognitionService_1 = require("../services/faceRecognitionService");
function modelPrediction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inputData = req.body;
            // Validate input data here
            const result = yield (0, faceRecognitionService_1.predict)(inputData);
            res.json({ prediction: result });
        }
        catch (error) {
            console.error('Prediction error:', error);
            res.status(500).json({ error: 'Prediction failed' });
        }
    });
}
