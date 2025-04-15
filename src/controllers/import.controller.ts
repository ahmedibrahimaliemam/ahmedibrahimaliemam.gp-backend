// src/controllers/import.controller.ts
import { Request, Response, RequestHandler } from 'express';
import xlsx from 'xlsx';
import fs from 'fs';
import Player from '../models/player.model';
import Team from '../models/team.model';

export const importPlayersFromExcel: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const playersData = xlsx.utils.sheet_to_json<any>(worksheet);

    const validPlayers = [];
    const rejectedPlayers = [];

    for (const player of playersData) {
      const teamExists = await Team.exists({ _id: player.Team_name });

      if (teamExists) {
        validPlayers.push(player);
        const team = await Team.findById(player.Team_name);

              // ✅ Optionally, push player to the team.players array
              team?.players.push(player);
             await team?.save();
      
      } else {
        rejectedPlayers.push({
          player,
          reason: `Team '${player.Team_name}' not found in database`,
        });
      }
    }

    const insertedPlayers = await Player.insertMany(validPlayers);

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: 'Import complete',
      insertedCount: insertedPlayers.length,
      rejectedCount: rejectedPlayers.length,
      insertedPlayers,
      rejectedPlayers,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Error importing players', error });
  }
};
