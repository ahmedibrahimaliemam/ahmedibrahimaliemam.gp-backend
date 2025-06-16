// src/controllers/parent.controller.ts
import { RequestHandler } from "express";
import Parent from "../models/parent.model";
import Player from "../models/player.model";
import Match from "../models/match.model";
import axios from 'axios';


export const getPlayerAndMatchesForParent: RequestHandler = async (req, res) => {
  try {
    const parentId = (req as any).user._id;         // from verifyParent
    const { playerId } = req.params;

    // 1) Load parent and verify they own this player
    const parent = await Parent.findById(parentId);
    if (!parent) {
      res.status(404).json({ message: "Parent not found" });
      return
    }
    if (!parent.players.includes(playerId)) {
       res.status(403).json({ message: "You are not authorized to view this player" });
       return;
    }

    // 2) Load the player profile
    const player = await Player.findById(playerId).select("-password");
    if (!player) {
      res.status(404).json({ message: "Player not found" });
      return;
    }

    // 3) Load all matches where this player’s team plays
    const teamId = player.Team_name;
    const matches = await Match.find({
      $or: [{ team1: teamId }, { team2: teamId }]
    }).sort({ date: -1 });

    // 4) Return everything
    res.json({ player, matches });
  } catch (error) {
    console.error("Error in parent fetching player:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

