import { Request, Response, NextFunction, RequestHandler } from "express";
import { check, validationResult, ValidationChain } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Team from "../models/team.model";
import Parent, { IParent } from "../models/parent.model";
import Coach from "../models/coach.model";
import Admin from "../models/admin.model";
import Player from "../models/player.model";



dotenv.config();

// ✅ Generate JWT Token
const generateToken = (_id: string, role: string): string => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

// ✅ Middleware to Verify Admin Token
const verifyAdmin: RequestHandler = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string; role: string };

    if (decoded.role !== "admin") {
      res.status(403).json({ message: "Forbidden: Only admins can perform this action" });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// ✅ Validation Middleware
const validateRegistration: ValidationChain[] = [
  check("email").isEmail().withMessage("Invalid email format"),
  check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  check("name").notEmpty().withMessage("Name is required"),
  check("secretCode").optional().notEmpty().withMessage("Secret code is required"),
];

// ✅ Handle Validation Errors Middleware
const handleValidationErrors: RequestHandler = (req, res, next): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// ✅ Register Admin
const registerAdmin: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { name, email, password, secretCode } = req.body;

    if (secretCode !== process.env.ADMIN_SECRET) {
      res.status(403).json({ message: "Invalid secret code" });
      return;
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({_id:name, name, email, password: hashedPassword });

    res.status(201).json({ message: "Admin registered", token: generateToken(admin._id, "admin") });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error });
  }
};

// ✅ Register Coach
export const registerCoach: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { name, email, phoneNumber, teamId, password } = req.body;

    // Check if coach with the given email already exists.
    const existingCoach = await Coach.findOne({ email });
    if (existingCoach) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    // Check if the provided teamId exists in the Team collection.
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(400).json({ message: "Team does not exist" });
      return;
      
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the coach; here _id is set to name (adjust as required for your application)
    const coach = await Coach.create({ _id: name, name, email, phoneNumber, teamId, password: hashedPassword });

    res.status(201).json({ message: "Coach registered", token: generateToken(coach._id, "coach") });
    
  } catch (error) {
    res.status(500).json({ message: "Error registering coach", error });
  }
};

// ✅ Register Parent (Admin only)
 const registerParent: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { phoneNumber, name, email, password, players } = req.body;

    // Check if parent's email is already in use
    const existingParent = await Parent.findOne({ email });
    if (existingParent) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    // Verify that each player in the players array exists in the database
    if (players && Array.isArray(players) && players.length > 0) {
      for (const playerId of players) {
        const playerExists = await Player.findById(playerId);
        if (!playerExists) {
          res.status(400).json({ message: `Player with id ${playerId} does not exist` });
          return;
        }
      }
    }

    // Hash the parent's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the parent record, using name as _id (adjust as needed)
    const parent = await Parent.create({
      _id: name,
      phoneNumber,
      name,
      email,
      password: hashedPassword,
      players,
    });

    res.status(201).json({ message: "Parent registered successfully", parent });
  } catch (error) {
    res.status(500).json({ message: "Error registering parent", error });
  }
};
// ✅ Login


const login: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      res.status(400).json({ message: "Email, password, and role are required" });
      return;
    }

    let user: any;

    if (role === "coach") {
      user = await Coach.findOne({ email });
    } else if (role === "admin") {
      user = await Admin.findOne({ email });
    } else if (role === "parent") {
      user = await Parent.findOne({ email });
    } else {
      res.status(400).json({ message: "Invalid role provided" });
      return;
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user._id, role);

    if (role === "parent") {
      const parent = user as IParent;

      const players = await Player.find({
        _id: { $in: parent.players },
      }).select("-password");

      res.json({
        message: "Login successful",
        token,
        parent: {
          id: parent._id,
          name: parent.name,
          email: parent.email,
        },
        players,
      });
    } else {
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          role,
          name: user.name,
          email: user.email,
        },
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
};



// ✅ Get All Admins
const getAllAdmins: RequestHandler = async (req, res): Promise<void> => {
  try {
    const admins = await Admin.find({}, "_id name");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving admins", error });
  }
};

export {
  registerAdmin,
  registerParent,
  login,
  getAllAdmins,
  validateRegistration,
  handleValidationErrors,
  verifyAdmin,
};
