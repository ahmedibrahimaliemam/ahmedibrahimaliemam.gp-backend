import { Request, Response } from "express";
import Team from "../models/team.model";
import { RequestHandler } from "express";
import Coach from "../models/coach.model";
import Match from "../models/match.model";
import mongoose from "mongoose";

export const addTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { _id, name, coachId } = req.body; // _id is the team id (string)
    
    // Create a new Team document; players and matchSchedule start as empty arrays.
    const newTeam = new Team({ _id, name, coachId, players: [], matchSchedule: [] });
    await newTeam.save();

    res.status(201).json({ message: "Team added successfully", team: newTeam });
  } catch (error) {
    res.status(500).json({ message: "Error adding team", error });
  }
};

/**
 * GET /api/admin/teams
 * Admin can view all teams and their assigned coaches.
 */
export const getAllTeamsWithCoaches: RequestHandler = async (req, res) => {
    try {
      const teams = await Team.find().populate("coachId", "name _id");
      res.status(200).json({ teams });
    } catch (error) {
      res.status(500).json({ message: "Error fetching teams", error });
    }
  };



  /**
 * GET /api/admin/teams/:teamId/results
 * Admin can view the match results for a given team.
 */
export const getTeamMatchResults:RequestHandler = async (req,res) => {
    try {
      const { teamId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(teamId)) {
         res.status(400).json({ message: "Invalid team ID" });
         return
      }
  
      const matches = await Match.find({
        $or: [{ team1: teamId }, { team2: teamId }],
      }).populate("team1", "name").populate("team2", "name");
  
      const results = matches.map(match => {
        let status = "pending";
        const now = new Date();
        const matchDate = new Date(match.date);
  
        if (matchDate < now && match.team1Score !== null && match.team2Score !== null) {
          status = "finished";
        } else if (matchDate.toDateString() === now.toDateString()) {
          status = "live";
        }
  
        return {
          matchId: match._id,
          date: match.date,
          status,
          team1: match.team1,
          team2: match.team2,
          team1Score: match.team1Score,
          team2Score: match.team2Score,
        };
      });
  
      res.status(200).json({ teamId, results });
    } catch (error) {
      res.status(500).json({ message: "Error fetching match results", error });
    }
  };