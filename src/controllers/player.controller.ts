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


//find the attendance of the player

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { playerId, source } = req.body;

    if (!playerId) {
       res.status(400).json({ error: "playerId is required" });
       return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight

    // Check if the player exists
    const player = await Player.findById(playerId);
    if (!player) {
     res.status(404).json({ error: "Player not found" });
     return
    }

    // Check if attendance already marked for today
    const alreadyMarked = player.attendance?.some(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
       recordDate.getTime() === today.getTime();
       return;
    });

    if (alreadyMarked) {
     res.status(200).json({ message: "Attendance already marked for today" });
     return;
    }

    // Push new attendance record
    player.attendance?.push({
      date: new Date(),
      present: true,
      checkedInAt: new Date(),
      source: source || "face_recognition"
    });

    await player.save();

    res.status(200).json({ message: "Attendance marked", playerId: player._id });
    return;
  } catch (err) {
    console.error("Attendance error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



// ... existing markAttendance here ...

export const getAttendanceByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
       res.status(400).json({ error: "Please provide a valid date in YYYY-MM-DD format." });
       return;
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: "Invalid date format." });
      return;
    }

    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find players who have an attendance record matching the date
    const players = await Player.find({
      attendance: {
        $elemMatch: {
          date: {
            $gte: targetDate,
            $lt: nextDay
          }
        }
      }
    }).select("_id short_name attendance");

    // Filter to include only attendance records from that day
    const result = players.map(player => {
      const attendanceOnDate = player.attendance?.filter(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        recordDate.getTime() === targetDate.getTime();
        return;
      }) || [];

      return {
        playerId: player._id,
        name: player.short_name,
        attendance: attendanceOnDate
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ... other functions ...

export const markMultipleAttendances = async (req: Request, res: Response) => {
  try {
    const { playerIds, source } = req.body;
    const { teamId } = req.query;

    if (!teamId || typeof teamId !== "string") {
      res.status(400).json({ error: "teamId is required in query params." });
      return;
    }

    if (!Array.isArray(playerIds)) {
      res.status(400).json({ error: "playerIds must be an array." });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const teamPlayers = await Player.find({ Team_name: teamId });

    const markedPlayers = {
      present: [] as { playerId: string, name: string }[],
      absent: [] as { playerId: string, name: string }[]
    };

    for (const player of teamPlayers) {
      const isPresent = playerIds.includes(player._id.toString());

      player.attendance = player.attendance || [];

      const existingIndex = player.attendance.findIndex(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });

      const newAttendance = {
        date: new Date(),
        present: isPresent,
        checkedInAt: isPresent ? new Date() : undefined,
        source: isPresent ? (source || "face_recognition") : "auto_marked"
      };

      if (existingIndex !== -1) {
        // update existing
        player.attendance[existingIndex] = newAttendance;
      } else {
        // add new
        player.attendance.push(newAttendance);
      }

      await player.save();

      const record = { playerId: player._id.toString(), name: player.short_name };
      if (isPresent) {
        markedPlayers.present.push(record);
      } else {
        markedPlayers.absent.push(record);
      }
    }

    res.status(200).json({
      message: `Attendance marked for ${markedPlayers.present.length} present and ${markedPlayers.absent.length} absent players.`,
      marked: markedPlayers
    });
  } catch (err) {
    console.error("Error in multi-attendance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



//get full attendance
export const getFullAttendanceByDate = async (req: Request, res: Response) => {
  try {
    const { date, teamId } = req.query;

    if (!date || typeof date !== "string") {
      res.status(400).json({ error: "Please provide a valid date in YYYY-MM-DD format." });
      return;
    }

    if (!teamId || typeof teamId !== "string") {
      res.status(400).json({ error: "Please provide a valid teamId." });
      return;
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: "Invalid date format." });
      return;
    }

    targetDate.setHours(0, 0, 0, 0);

    const players = await Player.find({ Team_name: teamId }).select("_id short_name attendance");

    const result = players.map(player => {
      const attendanceRecord = player.attendance?.find(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === targetDate.getTime();
      });

      return {
        playerId: player._id,
        name: player.short_name,
        attendance: attendanceRecord?.present ?? null // true / false / null (not marked)
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching team attendance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



//get player by parent ID
export const getPlayerByParent = async (req: Request, res: Response) => {
  try {
    const authReq = req as Request & { user?: any };
    const parentId = authReq.user?.id; // assuming JWT has user.id

    if (!parentId) {
       res.status(401).json({ error: "Unauthorized" });
       return;
    }

    const player = await Player.findOne({ parentId });

    if (!player) {
      res.status(404).json({ error: "No player found for this parent" });
      return;
    }

    res.status(200).json(player);
  } catch (err) {
    console.error("Error fetching player's data for parent:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};