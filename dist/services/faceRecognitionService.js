"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFaceRecognition = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const runFaceRecognition = () => {
    return new Promise((resolve, reject) => {
        const pythonPath = "C:\\Users\\Ahmed Farhan\\AppData\\Local\\Programs\\Python\\Python313\\python.exe"; // ✅ Use full path
        const scriptPath = path_1.default.join(__dirname, "../../scripts/recognize.py");
        console.log("Running recognition script at:", scriptPath);
        const pythonProcess = (0, child_process_1.spawn)(pythonPath, [scriptPath]);
        let data = "";
        let error = "";
        pythonProcess.stdout.on("data", (chunk) => {
            data += chunk.toString();
        });
        pythonProcess.stderr.on("data", (chunk) => {
            error += chunk.toString();
        });
        pythonProcess.on("close", (code) => {
            if (code === 0) {
                const recognizedPlayers = data.trim().split("\n").filter(Boolean);
                resolve(recognizedPlayers);
            }
            else {
                reject(`Python error: ${error}`);
            }
        });
        pythonProcess.on("error", (err) => {
            reject(`Failed to start Python process: ${err.message}`);
        });
    });
};
exports.runFaceRecognition = runFaceRecognition;
