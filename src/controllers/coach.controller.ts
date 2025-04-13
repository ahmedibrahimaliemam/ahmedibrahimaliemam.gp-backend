import { Request, Response, RequestHandler } from "express";
import Match from "../models/match.model";
import Coach from "../models/coach.model";
import Team from "../models/team.model";
interface AuthenticatedRequest extends Request {
    user?: any;
  }
// Add Match: if match date is in the future, the match status will show the scheduled date;
// if the match is now or in the past, it will show "live".
export const addMatch: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { _id, team1, team2, date } = req.body; // _id is the match id provided by the client
    const matchDate = new Date(date);
    const now = new Date();
    
    // Determine status based on matchDate and current time.
    let status: string;
    if (matchDate > now) {
      // Future match: status displays the formatted future date.
      status = matchDate.toLocaleString();
    } else {
      // Match is now (or in the past): status is "live"
      status = "live";
    }

    const newMatch = new Match({
      _id,
      team1,
      team2,
      date: matchDate,
      team1Score: 0,
      team2Score: 0,
      status,
    });
    await newMatch.save();

    res.status(201).json({ message: "Match added successfully", match: newMatch });
  } catch (error) {
    res.status(500).json({ message: "Error adding match", error });
  }
};

// Update Match Result: updates the scores and sets the status to "finished" once a result is posted.
export const updateMatchResult: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { matchId, team1Score, team2Score } = req.body;
    const match = await Match.findById(matchId);
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }

    match.team1Score = team1Score;
    match.team2Score = team2Score;
    match.status = "finished";
    await match.save();

    res.status(200).json({ message: "Match result updated", match });
  } catch (error) {
    res.status(500).json({ message: "Error updating match result", error });
  }
};

export const getMatchesByCoach: RequestHandler = async (req, res): Promise<void> => {
    try {
      // req.user should be populated from the auth middleware (e.g., via JWT decode)
      const authReq = req as Request & { user?: any };
      const coachId = authReq.user?.id;
      console.log("id ",authReq.user) ;
      if (!coachId) {
        res.status(403).json({ message: "Not authorized" });
        return;
      }
  
      // Find the coach document
      const coach = await Coach.findById(coachId);
      if (!coach) {
        res.status(404).json({ message: "Coach not found" });
        return;
      }
  
      // Get the team id from the coach document
      console.log('coach',coach);
      
      const teamId = coach.teamId;
      if (!teamId) {
        res.status(404).json({ message: "Team not assigned to this coach" });
        return;
      }
  
      // Find the team document by its id
      const team = await Team.findById(teamId);
      if (!team) {
        res.status(404).json({ message: "Team not found" });
        return;
      }
  
      // Retrieve matches using the matchSchedule array from the team document
      const matches = await Match.find({
        $or: [{ team1: teamId }, { team2: teamId }],
      });  
      // Alternatively, if you prefer, you could query for matches where team1 equals the team's id:
      // const matches = await Match.find({ team1: teamId });
  
      res.status(200).json({ message: "Matches retrieved successfully", matches });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving matches", error });
    }
  };
// Delete Match
export const deleteMatch: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
  
      const match = await Match.findById(id);
      if (!match) {
        res.status(404).json({ message: "Match not found" });
        return;
      }
  
      await Match.findByIdAndDelete(id);
      res.status(200).json({ message: "Match deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting match", error });
    }
  };