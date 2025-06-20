// src/controllers/parent.controller.ts
import { RequestHandler } from "express";
import Parent from "../models/parent.model";
import Player from "../models/player.model";
import Match from "../models/match.model";
import axios from 'axios';




export const getPlayerAndMatchesForParent: RequestHandler = async (req, res) => {
  try {
   
    const parentId = (req as any).user._id;

    const parent = await Parent.findById(parentId);
    if (!parent) {
      res.status(404).json({ message: "Parent not found" });
      return;
    }

    const players = await Player.find({ _id: { $in: parent.players } }).select("-password");

    if (!players.length) {
      res.status(404).json({ message: "No players found for this parent" });
      return;
    }

    const playersWithMatches = await Promise.all(
      players.map(async (player) => {
        const matches = await Match.find({
          $or: [{ team1: player.Team_name }, { team2: player.Team_name }]
        }).sort({ date: -1 });

        return {
          player,
          matches
        };
      })
    );

    res.json({ players: playersWithMatches });
  } catch (error) {
    console.error("Error fetching parent’s player data:", error);
    res.status(500).json({ message: "Server error", error });
  }
};



