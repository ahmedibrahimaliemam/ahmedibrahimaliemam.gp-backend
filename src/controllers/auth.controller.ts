import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Player from "../models/player.model";
import Coach from "../models/coach.model";
import Admin from "../models/admin.model";

dotenv.config();

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

// ✅ Register Admin (Fixed)
export const registerAdmin: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { _id, name, password, secretCode } = req.body;

    if (secretCode !== process.env.ADMIN_SECRET) {
      res.status(403).json({ message: "Invalid secret code" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ _id, name, password: hashedPassword });

    res.status(201).json({ message: "Admin registered", token: generateToken(admin._id, "admin") });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin" });
  }
};

// ✅ Register Player (Fixed)
export const registerPlayer: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { _id, name, position, coachId, teamId, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const player = await Player.create({ _id, name, position, coachId, teamId, password: hashedPassword });

    res.status(201).json({ message: "Player registered", token: generateToken(player._id, "player") });
  } catch (error) {
    res.status(500).json({ message: "Error registering player" });
  }
};

// ✅ Login (Fixed)
export const login: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { _id, password, role } = req.body;
    let user;

    if (role === "player") user = await Player.findById(_id);
    else if (role === "coach") user = await Coach.findById(_id);
    else if (role === "admin") user = await Admin.findById(_id);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    res.json({ message: "Login successful", token: generateToken(user._id, role) });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};
export const getAllAdmins: RequestHandler = async (req, res): Promise<void> => {
  try {
    const admins = await Admin.find({}, "_id name"); // Fetch only necessary fields
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving admins" });
  }
};