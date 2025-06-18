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
      return;
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const playersData = xlsx.utils.sheet_to_json<any>(worksheet);

    const validPlayers = [];
    const rejectedPlayers = [];

    for (const player of playersData) {
      const teamId = player.Team_name?._id || player.Team_name; // لو جاي من الإكسل كـ object

      const teamExists = await Team.exists({ _id: teamId });

      if (teamExists) {
        const formattedPlayer = {
          ...player,
          Team_name: teamId,       
          parentId: player.parentId || undefined, 
          _id: player._id || player.short_name,           
        };

        validPlayers.push(formattedPlayer);

       
        const team = await Team.findById(teamId);
        if (team) {
          team.players.push(formattedPlayer._id); 
          await team.save();
        }

      } else {
        rejectedPlayers.push({
          player,
          reason: `Team '${teamId}' not found in database`,
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
