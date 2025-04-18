// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { promises } from "dns";

dotenv.config();

// Call this after your JWT “protect” middleware if you have one.
// Or merge into your existing protect, checking role === 'parent'.
export const verifyParent: RequestHandler = (req: any, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
     res.status(401).json({ message: "Missing token" });
     return
  }

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string; role: string };
    if (decoded.role !== "parent") {
       res.status(403).json({ message: "Forbidden: Parents only" });
       return
    }
    req.user = decoded;
    next();
  } catch (err) {
     res.status(401).json({ message: "Invalid token" });
     return;
  }
};
