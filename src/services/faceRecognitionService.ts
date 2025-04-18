import { spawn } from "child_process";
import path from "path";

export const runFaceRecognition = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const pythonPath = "C:\\Users\\Ahmed Farhan\\AppData\\Local\\Programs\\Python\\Python313\\python.exe"; // ✅ Use full path
    const scriptPath = path.join(__dirname,"../../scripts/recognize.py");
    console.log("Running recognition script at:", scriptPath);

    const pythonProcess = spawn(pythonPath, [scriptPath]);

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
      } else {
        reject(`Python error: ${error}`);
      }
    });

    pythonProcess.on("error", (err) => {
      reject(`Failed to start Python process: ${err.message}`);
    });
  });
};
