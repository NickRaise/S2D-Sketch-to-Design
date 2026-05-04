import jwt from "jsonwebtoken";
import { Response } from "express";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const isProd = process.env.NODE_ENV === "production";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  image?: string;
}
 
export interface RefreshTokenPayload {
  userId: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  const base = { httpOnly: true, secure: isProd, sameSite: "lax" as const, path: "/" };
  res.cookie("access_token", accessToken, { ...base, maxAge: 15 * 60 * 1000 }); // 15 minutes
  res.cookie("refresh_token", refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
}
