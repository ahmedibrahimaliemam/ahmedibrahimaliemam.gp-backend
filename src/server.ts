import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.config";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import coachRoutes from "./routes/coach.routes";

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coach", coachRoutes);
//router.get("/teams", adminAuthMiddleware, getAllTeamsWithCoaches);
//router.get("/teams/:teamId/results", adminAuthMiddleware, getTeamMatchResults);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
