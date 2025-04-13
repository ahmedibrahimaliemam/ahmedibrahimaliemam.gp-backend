import { Request, Response } from "express";
import Match from "../models/match.model";
import Coach from "../models/coach.model";

// Add Match
export const addMatch = async (req: Request, res: Response) => {
  try {
    const authReq = req as Request & { user?: any };
    const coach = authReq.user;

    const { team2, date } = req.body;
    if (!team2 || !date) {
      return res.status(400).json({ message: "team2 and date are required" });
    }

    const newMatch = await Match.create({
      team1: coach.teamId,
      team2,
      date,
      status: new Date(date) > new Date() ? "pending" : "live",
    });

    res.status(201).json({ message: "Match added", match: newMatch });
  } catch (err) {
    res.status(500).json({ message: "Error adding match", error: err });
  }
};

// Update Match
export const updateMatch = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.id;
    const updates = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    Object.assign(match, updates);
    match.status = new Date(match.date) > new Date() ? "pending" : "live";

    await match.save();
    res.status(200).json({ message: "Match updated", match });
  } catch (err) {
    res.status(500).json({ message: "Error updating match", error: err });
  }
};

// Delete Match
export const deleteMatch = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.id;

    const match = await Match.findByIdAndDelete(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    res.status(200).json({ message: "Match deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting match", error: err });
  }
};
