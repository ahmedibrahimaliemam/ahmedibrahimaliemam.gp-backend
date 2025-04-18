"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_config_1 = require("./config/db.config");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const coach_routes_1 = __importDefault(require("./routes/coach.routes"));
const player_routes_1 = __importDefault(require("./routes/player.routes"));
const import_routes_1 = __importDefault(require("./routes/import.routes"));
const match_routes_1 = __importDefault(require("./routes/match.routes"));
const parent_routes_1 = __importDefault(require("./routes/parent.routes"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Call this after connecting to MongoDB
(0, db_config_1.connectDB)().then(() => (0, db_config_1.syncPlayerIndexes)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/coach", coach_routes_1.default);
app.use("/api/players", player_routes_1.default);
app.use("/api/match", match_routes_1.default);
//app.use("/api",attendanceRoutes);
app.use("/api/parents", parent_routes_1.default);
const uploadPath = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
app.use('/api/import', import_routes_1.default);
//router.get("/teams", adminAuthMiddleware, getAllTeamsWithCoaches);
//router.get("/teams/:teamId/results", adminAuthMiddleware, getTeamMatchResults);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
