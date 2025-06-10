import { Request, Response, RequestHandler } from "express";
import Player, { IPlayer } from "../models/player.model";
import Team from "../models/team.model";

// Helper function to check if user is admin or coach.
const isAdminOrCoach = (user: any): boolean => {
  return user && (user.role === "admin" || user.role === "coach");
};

/**
 * Add a new Player.
 * Only accessible by admin and coach.
 *
 * Note: 'password' and 'position' are removed from this endpoint.
 * Adjust your model accordingly if these fields are required.
 */
export const addPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        short_name,
        coachName,
        Team_name,
        preferred_foot,
        club_position,
        weak_foot,
        weight_kg,
        height_cm,
        overall,
        pace,
        shooting,
        passing,
        dribbling,
        defending,
        physic,
        player_face_url,
        goalkeeping_diving,
        goalkeeping_handling,
        goalkeeping_kicking,
        goalkeeping_positioning,
        goalkeeping_reflexes,
        goalkeeping_speed,
      } = req.body;
  
      // ✅ Check if the team exists
      const team = await Team.findById(Team_name);
      if (!team) {
        res.status(400).json({ message: `Team '${Team_name}' does not exist` });
        return;
      }
  
      // ✅ Create and save player
      const newPlayer = new Player({
        _id:short_name,
        short_name,
        coachName,
        Team_name,
        preferred_foot,
        club_position,
        weak_foot,
        weight_kg,
        height_cm,
        overall,
        pace,
        shooting,
        passing,
        dribbling,
        defending,
        physic,
        player_face_url,
        goalkeeping_diving,
        goalkeeping_handling,
        goalkeeping_kicking,
        goalkeeping_positioning,
        goalkeeping_reflexes,
        goalkeeping_speed,
      });
  
      await newPlayer.save();
  
      // ✅ Optionally, push player to the team.players array
      if (!team.players.includes(short_name)) {
        team.players.push(short_name);
        await team.save();
      }
  
      res.status(201).json({ message: "Player added successfully", player: newPlayer });
    } catch (error) {
      console.error("Error adding player:", error);
      res.status(500).json({ message: "Error adding player", error });
    }
  };
/**
 * Update an existing Player.
 * Only accessible by admin and coach.
 *
 * Note: The fields 'password' and 'position' will not be updated by this endpoint.
 */
export const updatePlayer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as Request & { user?: any };
    const user = authReq.user;
    if (!isAdminOrCoach(user)) {
      res.status(403).json({ message: "Unauthorized: Only admins and coaches can update players" });
      return;
    }

    // Find the player document.
    const player = await Player.findById(id);
    if (!player) {
      res.status(404).json({ message: "Player not found" });
      return;
    }

    // Remove password and position if included in the request body.
    const { password, position, ...updates } = req.body;

    // Merge updates into the player document.
    Object.assign(player, updates);
    await player.save();

    res.status(200).json({ message: "Player updated successfully", player });
    return;
  } catch (error) {
    console.error("Error updating player:", error);
    res.status(500).json({ message: "Error updating player", error });
    return;
  }
};

/**
 * Delete an existing Player.
 * Only accessible by admin and coach.
 */
export const deletePlayer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as Request & { user?: any };
    const user = authReq.user;
    if (!isAdminOrCoach(user)) {
      res.status(403).json({ message: "Unauthorized: Only admins and coaches can delete players" });
      return;
    }

    const player = await Player.findByIdAndDelete(id);
    if (!player) {
      res.status(404).json({ message: "Player not found" });
      return;
    }

    res.status(200).json({ message: "Player deleted successfully" });
    return;
  } catch (error) {
    console.error("Error deleting player:", error);
    res.status(500).json({ message: "Error deleting player", error });
    return;
  }
};
// ✅ Get All Players
export const getAllPlayers: RequestHandler = async (req, res): Promise<void> => {
    try {
      const players = await Player.find({}).populate("Team_name", "name coachId");
      res.status(200).json(players);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving players", error });
    }
  };

/**
 * Update ONLY the position of a player.
 * Only accessible by admin and coach.
 */
export const updatePlayerPosition: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { club_position } = req.body; // Expecting only 'club_position' in the request body
    const authReq = req as Request & { user?: any };
    const user = authReq.user;
    // Check if user is admin or coach
    if (!isAdminOrCoach(user)) {
      res.status(403).json({ 
        message: "Unauthorized: Only admins and coaches can update player positions" 
      });
      return;
    }

    // Find and update ONLY the player's position
    const updatedPlayer = await Player.findByIdAndUpdate(
      id,
      { club_position }, // Update only the position field
      { new: true } // Return the updated player
    );

    if (!updatedPlayer) {
     res.status(404).json({ message: "Player not found" });
     return;
    }

    res.status(200).json({ 
      message: "Player position updated successfully",
      player: updatedPlayer 
    });

  } catch (error) {
    console.error("Error updating player position:", error);
    res.status(500).json({ 
      message: "Error updating player position", 
      error 
    });
  }
};