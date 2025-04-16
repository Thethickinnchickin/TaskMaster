import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User"; // adjust path as needed

export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.authToken;

  if (!token) {
    res.status(401).json({ message: "❌ No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, "process.env.JWT_SECRET");
    const user = await User.findOne({ email: (decoded as any).email });

    if (!user) {
      res.status(404).json({ message: "❌ User not found" });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Token error:", error);
    res.status(401).json({ message: "❌ Invalid or expired token" });
  }
};
