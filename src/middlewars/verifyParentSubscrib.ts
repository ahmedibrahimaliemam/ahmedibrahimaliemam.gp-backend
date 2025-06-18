import { RequestHandler } from "express";
import Parent from "../models/parent.model";

export const verifyParentSubscription: RequestHandler = async (req, res, next) => {
  const parentId = (req as any).user?._id;

  const parent = await Parent.findById(parentId);
  if (!parent)
    { 
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

  if (parent.subscriptionExpiresAt && new Date() > parent.subscriptionExpiresAt) {
    parent.isSubscribed = false;
    await parent.save();
  }

  if (!parent.isSubscribed) {
    res.status(403).json({ message: "Subscription expired. Please renew." });
    return;
  }

  next();
};
