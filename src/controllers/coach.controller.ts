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
      const coachId = authReq.user?._id;
      console.log("id hhhhh",authReq.user) ;
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
// export const deleteMatch: RequestHandler = async (req, res) => {
//     try {
//       const { id } = req.params;
  
//       const match = await Match.findById(id);
//       if (!match) {
//         res.status(404).json({ message: "Match not found" });
//         return;
//       }
  
//       await Match.findByIdAndDelete(id);
//       res.status(200).json({ message: "Match deleted successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Error deleting match", error });
//     }
//   };

 // src/controllers/coach.controller.ts

export const getAllCoachesWithTeamsAndPlayers: RequestHandler = async (req, res) => {
  try {
    // 1) Load coaches and populate their single team
    const coaches = await Coach.find(
      {}, 
      "_id name email phoneNumber teamId"
    )
    .populate({
      path: "teamId",
      select: "_id name players",
      populate: {
        path: "players",
        select: "_id short_name Team_name",
      },
    })
    .exec();

    // 2) Shape the response
    const result = coaches.map((coach) => ({
      coachId: coach._id,
      coachName: coach.name,
      email: coach.email,
      phoneNumber: coach.phoneNumber,
      team: coach.teamId

    }));

     res.status(200).json({ coaches: result });
     return;
  } catch (error) {
    console.error("Error fetching coaches:", error);
      res
      .status(500)
      .json({ message: "Error fetching coaches", error });
      return;
  }
};
export const getTeamForCurrentCoach: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const coachId = authReq.user?._id;

    if (!coachId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    // Find coach with deep population
    const coach = await Coach.findById(coachId)
      .populate({
        path: 'teamId',
        model: 'Team',
        populate: {
          path: 'players',
          model: 'Player' // Remove select to get all fields
        }
      })
      .lean()
      .exec();

    if (!coach) {
      res.status(404).json({ message: "Coach not found" });
      return;
    }

    if (!coach.teamId || typeof coach.teamId === 'string') {
      res.status(404).json({ message: "No team assigned to this coach" });
      return;
    }

    // Type guard for populated team
    const team = coach.teamId as unknown as {
      _id: string;
      name: string;
      logo: string;
      players: Array<{
        _id: string;
        short_name: string;
        Team_name: string;
        overall: number;
        height_cm: number;
        weight_kg: number;
        club_position: string;
        attacking_crossing: number;
        club_name: string;
        preferred_foot?: string;
        weak_foot?: number;
        pace?: number;
        shooting?: number;
        passing?: number;
        dribbling?: number;
        defending?: number;
        physic?: number;
        player_face_url?: string;
        goalkeeping_diving?: number;
        goalkeeping_handling?: number;
        goalkeeping_kicking?: number;
        goalkeeping_positioning?: number;
        goalkeeping_reflexes?: number;
        goalkeeping_speed?: number;
      }>;
    };

    // Build response with all player attributes
    const response = {
      coach: {
        _id: coach._id,
        name: coach.name,
        email: coach.email,
        phoneNumber: coach.phoneNumber
      },
      team: {
        _id: team._id,
        name: team.name,
        logo: team.logo,
        players: team.players.map(player => ({
          // Player identity
          id: player._id,
          shortName: player.short_name,
          teamName: player.Team_name,
          
          // Physical attributes
          overall: player.overall,
          height: player.height_cm,
          weight: player.weight_kg,
          
          // Positional info
          clubPosition: player.club_position,
          clubName: player.club_name,
          
          // Technical attributes
          attackingCrossing: player.attacking_crossing,
          preferredFoot: player.preferred_foot,
          weakFoot: player.weak_foot,
          
          // Stats
          pace: player.pace,
          shooting: player.shooting,
          passing: player.passing,
          dribbling: player.dribbling,
          defending: player.defending,
          physic: player.physic,
          
          // Goalkeeping stats
          goalkeeping: {
            diving: player.goalkeeping_diving,
            handling: player.goalkeeping_handling,
            kicking: player.goalkeeping_kicking,
            positioning: player.goalkeeping_positioning,
            reflexes: player.goalkeeping_reflexes,
            speed: player.goalkeeping_speed
          },
          
          // Media
          playerFaceUrl: player.player_face_url
        }))
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching coach's team:", error);
    res.status(500).json({ 
      message: "Error retrieving team details",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};