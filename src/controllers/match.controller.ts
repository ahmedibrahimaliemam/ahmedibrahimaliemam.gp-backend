// src/controllers/match.controller.ts
import { Request, Response, RequestHandler } from "express";
import Match from "../models/match.model";
import coachModel from "../models/coach.model";
import teamModel from "../models/team.model";

/**
 * Compute match status based on its date:
 * - Returns ISO date string if the match is in the future
 * - "live" if now is within 90 minutes after start
 * - "finished" if more than 90 minutes have passed
 */
function computeStatus(date: Date): string {
  const now = Date.now();
  const matchTime = date.getTime();
  const ninetyMins = 90 * 60 * 1000;

  if (now < matchTime) {
    return date.toISOString();
  } else if (now - matchTime <= ninetyMins) {
    return "live";
  } else {
    return "finished";
  }
}

/**
 * POST /api/matches
 * Coach adds a new match.
 */
export const addMatch: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as Request & { user?: any };
    const coach = authReq.user;
    const {_id, team2, date } = req.body;
    console.log("the coach team id is ",coach);
    const AllCoach=await coachModel.findById(coach._id);
    console.log(`all coach is `,AllCoach);
    
    if (!AllCoach?.teamId) {
      res.status(400).json({ message: "Coach is not assigned to any team" });
      return;
    }



    if (!team2 || !date) {
      res.status(400).json({ message: "team2 and date are required" });
      return;
    }

    const newMatch = await Match.create({
      _id,
      team1:AllCoach?.teamId,
      team2,
      date: new Date(date),
      team1Score: null,
      team2Score: null,
    });

    const matchObj = newMatch.toObject();
    matchObj.status = computeStatus(newMatch.date);

    res.status(201).json({ message: "Match added", match: matchObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding match", error: err });
  }
};

/**
 * PATCH /api/matches/:id
 * Partial update to a match (e.g. to set scores or reschedule).
 */
export const updateMatch: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const match = await Match.findById(id);
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }

    Object.assign(match, updates);
    await match.save();

    const matchObj = match.toObject();
    matchObj.status = computeStatus(match.date);

    res.status(200).json({ message: "Match updated", match: matchObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating match", error: err });
  }
};

/**
 * DELETE /api/matches/:id
 * Remove a match.
 */
export const deleteMatch: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Match.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "Match not found" });
      return;
    }
    res.status(200).json({ message: "Match deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting match", error: err });
  }
};
