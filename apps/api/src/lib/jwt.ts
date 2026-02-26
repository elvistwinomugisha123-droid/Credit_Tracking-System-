import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

const DEFAULT_EXPIRES_IN = "24h" as const;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

function getExpiresIn(): StringValue | number {
  const value = process.env.JWT_EXPIRES_IN;
  if (!value) return DEFAULT_EXPIRES_IN;
  const asNumber = Number(value);
  if (!Number.isNaN(asNumber)) return asNumber;
  return value as StringValue;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: getExpiresIn() });
}

export function verifyToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, getJwtSecret());
  if (typeof decoded === "string" || !decoded || !("userId" in decoded)) {
    throw new Error("Invalid token payload");
  }
  return decoded as unknown as { userId: string };
}
