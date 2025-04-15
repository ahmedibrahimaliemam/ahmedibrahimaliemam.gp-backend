import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connectDB,syncPlayerIndexes} from "./config/db.config";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import coachRoutes from "./routes/coach.routes";
import playerRoutes from "./routes/player.routes";
import importRoutes from "./routes/import.routes";
import fs from 'fs';
import path from 'path';

dotenv.config();
const app = express();
// Call this after connecting to MongoDB
connectDB().then(() => syncPlayerIndexes());

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/players", playerRoutes);
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use('/api/import', importRoutes);
//router.get("/teams", adminAuthMiddleware, getAllTeamsWithCoaches);
//router.get("/teams/:teamId/results", adminAuthMiddleware, getTeamMatchResults);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
