import { Request, Response, NextFunction, RequestHandler } from "express";
import { check, validationResult, ValidationChain } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Player from "../models/player.model";
import Coach from "../models/coach.model";
import Admin from "../models/admin.model";
import Parent from "../models/parent.model";

dotenv.config();

// ✅ Generate JWT Token
const generateToken = (_id: string, role: string): string => {
  return jwt.sign({ _id, role  }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

// ✅ Middleware to Verify Admin Token
const verifyAdmin: RequestHandler = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };

    if (decoded.role !== "admin") {
      res.status(403).json({ message: "Forbidden: Only admins can perform this action" });
      return;
    }

    req.user = decoded; // Attach user info to request
    next(); // Move to next middleware
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
    return; // Ensures function exits correctly
  }
  next(); // Continue if no validation errors
};


// ✅ Register Admin
const registerAdmin: RequestHandler = async (req, res): Promise<void> => {
  console.log(`helooooooooo`)
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
    const admin = await Admin.create({  name, email, password: hashedPassword });
    console.log(email,"hahahha");
    

    res.status(201).json({ message: "Admin registered11", token: generateToken(admin._id, "admin") });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error });
  }
};

// ✅ Register Coach (Only Admin Can Register)
const registerCoach: RequestHandler = async (req, res): Promise<void> => {
  try {
    const {name, email, phoneNumber, teamId, password } = req.body;

    const existingCoach = await Coach.findOne({ email });
    if (existingCoach) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const coach = await Coach.create({_id:phoneNumber,  name, email, phoneNumber, teamId, password: hashedPassword });

    res.status(201).json({ message: "Coach registered", token: generateToken(coach._id, "coach") });
  } catch (error) {
    res.status(500).json({ message: "Error registering coach", error });
  }
};

// ✅ Register Player (Only Admin Can Register)
const registerPlayer: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { name, email, position, coachId, teamId, password } = req.body;

    const existingPlayer = await Player.findOne({ email });
    if (existingPlayer) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const player = await Player.create({  name, email, position, coachId, teamId, password: hashedPassword });

    res.status(201).json({ message: "Player registered", token: generateToken(player._id, "player") });
  } catch (error) {
    res.status(500).json({ message: "Error registering player", error });
  }
};

// ✅ Login
// ✅ Login with Auto-Registration for Parents
const login: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      res.status(400).json({ message: "Email, password, and role are required" });
      return;
    }

    let user;

    if (role === "player") {
      user = await Player.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(400).json({ message: "Invalid email or password" });
        return;
      }
    } else if (role === "coach") {
      user = await Coach.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(400).json({ message: "Invalid email or password" });
        return;
      }
    } else if (role === "admin") {
      user = await Admin.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(400).json({ message: "Invalid email or password" });
        return;
      }
    } else if (role === "parent") {
      // Try to find the parent
      user = await Parent.findOne({ email });

      // Auto-register if not found
      if (!user) {
        // You may choose a default name or require the parent to send one in the request
        const defaultName = req.body.name || "Parent";
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await Parent.create({ name: defaultName, email, password: hashedPassword });
      } else {
        // Validate the password if the parent exists
        if (!(await bcrypt.compare(password, user.password))) {
          res.status(400).json({ message: "Invalid email or password" });
          return;
        }
      }
    } else {
      res.status(400).json({ message: "Invalid role provided" });
      return;
    }

    res.json({ message: "Login successful", token: generateToken(user._id, role) });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};


// ✅ Get All Admins
const getAllAdmins: RequestHandler = async (req, res): Promise<void> => {
  try {
    const admins = await Admin.find({}, "_id name"); // Fetch only necessary fields
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving admins", error });
  }
};

export {
  registerAdmin,
  registerCoach,
  registerPlayer,
  login,
  getAllAdmins,
  validateRegistration,
  handleValidationErrors,
  verifyAdmin,
};
