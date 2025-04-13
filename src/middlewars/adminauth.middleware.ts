import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model";

export const adminAuthMiddleware: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string };

    const admin = await Admin.findById(decoded._id);
    if (!admin) {
      res.status(403).json({ message: "Not authorized as admin" });
      return;
    }

    (req as any).user = admin;
    next(); // ✅ only next() is returned
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
