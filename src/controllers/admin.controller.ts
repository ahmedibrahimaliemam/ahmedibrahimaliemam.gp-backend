import { Request, Response } from "express";
import Team from "../models/team.model";
import { RequestHandler } from "express";
import Coach from "../models/coach.model";
import Match from "../models/match.model";
import mongoose from "mongoose";
import coachModel from "../models/coach.model";
import teamModel from "../models/team.model";

export const addTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, logo } = req.body; // _id is the team id (string)
    
    // Create a new Team document; players and matchSchedule start as empty arrays.
    const newTeam = new Team({ _id:name, name, logo, players: [], matchSchedule: [] });
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
    const teams = await Team.find()
      .populate("coachId")
      .populate("players");

    const teamsWithFilteredMatches = await Promise.all(
      teams.map(async (team) => {
        // Fetch matches where team is either team1 or team2
        const filteredMatches = await Match.find({
          $or: [{ team1: team._id }, { team2: team._id }],
        });

        return {
          ...team.toObject(),
          matchSchedule: filteredMatches, 
        };
      })
    );

    res.status(200).json({ teams: teamsWithFilteredMatches });
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

  /**
 * GET /api/admin/teams/:teamId
 * Admin can get details of a specific team
 */
  export const getTeamByCoachId: RequestHandler = async (req, res) => {
    try {
      const { coachId } = req.params; // Changed from teamId to coachId
  
      const coach = await coachModel.findById(coachId);
      if (!coach) {
         res.status(404).json({ message: "Coach not found" });
         return;
      }
  
      const team = await teamModel.findById(coach.teamId)
        .populate("players")
        .populate("coachId");
  
      if (!team) {
        res.status(404).json({ message: "Team not found for this coach" });
        return;
      }
  
      // Get matches where team is either team1 or team2
      const matches = await Match.find({
        $or: [{ team1: team._id }, { team2: team._id }]
      });
  
      const teamWithMatches = {
        ...team.toObject(),
        matchSchedule: matches // Replace with actual matches from query
      };
  
      res.status(200).json({ team: teamWithMatches });
    } catch (error) {
      res.status(500).json({ message: "Error fetching team by coachId", error });
    }
  };
  
/**
 * DELETE /api/admin/teams/:teamId
 * Admin can delete a specific team
 */
export const deleteTeam: RequestHandler = async (req, res) => {
  try {
    const { teamId } = req.params;

    const deletedTeam = await Team.findByIdAndDelete(teamId);

    if (!deletedTeam) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    res.status(200).json({ message: "Team deleted successfully", deletedTeam });
  } catch (error) {
    res.status(500).json({ message: "Error deleting team", error });
  }
};
