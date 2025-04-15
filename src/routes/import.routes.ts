// src/routes/import.routes.ts
import express from 'express';
import { importPlayersFromExcel } from '../controllers/import.controller';
import { upload } from '../middlewars/upload';

const router = express.Router();

// POST /api/import/players - uploads an Excel file with player data.
router.post('/players', upload.single('file'), importPlayersFromExcel);

export default router;
