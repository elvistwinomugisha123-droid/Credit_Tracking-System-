import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Authentication required" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}
