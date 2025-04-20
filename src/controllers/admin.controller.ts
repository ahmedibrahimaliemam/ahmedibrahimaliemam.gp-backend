import { Request, Response } from "express";
import Team from "../models/team.model";
import Player from "../models/player.model";
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

export const addMatch: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { _id, team1, team2, date } = req.body;

    // Validate required fields
    if (!_id || !team1 || !team2 || !date) {
      res.status(400).json({ message: "Missing required fields: _id, team1, team2, date" });
      return;
    }

    // Validate teams exist
    const [team1Exists] = await Promise.all([
      Team.findById(team1),
    ]);

    if (!team1Exists) {
      res.status(404).json({ message: "the Team not found" });
      return;
    }

    if (team1 === team2) {
      res.status(400).json({ message: "A team cannot play against itself" });
      return;
    }

    // Validate date format
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    // Check for existing match ID
    const existingMatch = await Match.findById(_id);
    if (existingMatch) {
      res.status(409).json({ message: "Match ID already exists" });
      return;
    }

    // Create new match
    const newMatch = new Match({
      _id,
      team1,
      team2,
      date: parsedDate,
      // team1Score and team2Score will default to null
    });

    await newMatch.save();

    // Update both teams' match schedules
    await Promise.all([
      Team.updateOne({ _id: team1 }, { $push: { matchSchedule: _id } }),
      Team.updateOne({ _id: team2 }, { $push: { matchSchedule: _id } })
    ]);

    // Return match with virtual status
    const createdMatch = await Match.findById(_id)
      .populate('team1', 'name')
      .populate('team2', 'name')
      .lean();

    res.status(201).json({ 
      message: "Match created successfully",
      match: {
        ...createdMatch,
        status: createdMatch?.status // Virtual field will be populated
      }
    });
  } catch (error) {
    console.error("Error adding match:", error);
    res.status(500).json({ 
      message: "Error adding match",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

//add player to team
export const addPlayerToTeam: RequestHandler = async (req, res) => {
  try {
    const { teamId } = req.params;
    const playerData = req.body;

    // Validate required fields
    if (!playerData.short_name) {
      res.status(400).json({ message: "Missing required  short_name" });
      return;
    }

    // 1. Validate team exists
    const team = await Team.findById(teamId);
   
    
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }


    // 3. Check for existing player
    if (await Player.exists({ _id: playerData.short_name })) {
      res.status(409).json({ message: "Player with this name already exists" });
      return;
    }

    // 4. Create player document
    const newPlayer = new Player({
      ...playerData,
      _id:playerData.short_name,
      Team_name: team._id, // team._id is the team name (from Team model)
      coachName: team.coachId
    });

    // 5. Save player and update team
    await Promise.all([
      newPlayer.save(),
      Team.findByIdAndUpdate(
        teamId,
        { $push: { players: newPlayer._id } },
        { new: true }
      )
    ]);

    // 6. Return response
    const createdPlayer = await Player.findById(newPlayer._id)
      .populate('Team_name', 'name logo')
      .lean();

    res.status(201).json({
      message: "Player added to team successfully",
      player: {
        ...createdPlayer,
        team: createdPlayer?.Team_name,
        Team_name: undefined // Remove the raw reference
      }
    });

  } catch (error) {
    console.error("Error adding player:", error);
    res.status(500).json({
      message: "Error adding player to team",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
export const getAllMatches: RequestHandler = async (req, res) => {
  try {
    const matches = await Match.find()
      .sort({ date: -1 }) // Sort by most recent first
      .lean();

    const formattedMatches = matches.map(match => ({
      _id: match._id,
      team1: match.team1,
      team2: match.team2,
      date: match.date,
      team1Score: match.team1Score,
      team2Score: match.team2Score,
      status: match.status // Virtual field from schema
    }));

    res.status(200).json({ matches: formattedMatches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ 
      message: "Error retrieving matches",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
export const getMatchesByTeamId: RequestHandler = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Validate team exists
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const matches = await Match.find({
      $or: [{ team1: teamId }, { team2: teamId }]
    })
    .sort({ date: 1 }) // Sort by upcoming matches first
    .lean();

    if (matches.length === 0) {
      res.status(404).json({ message: "No matches found for this team" });
      return;
    }

    const formattedMatches = matches.map(match => ({
      _id: match._id,
      team1: match.team1,
      team2: match.team2,
      date: match.date,
      team1Score: match.team1Score,
      team2Score: match.team2Score,
      status: match.status, // Virtual field
      isHomeGame: match.team1 === teamId // Add extra useful field
    }));

    res.status(200).json({
      teamId,
      teamName: team.name,
      matches: formattedMatches
    });
  } catch (error) {
    console.error("Error fetching team matches:", error);
    res.status(500).json({ 
      message: "Error retrieving team matches",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};