import { Request, Response } from "express";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../services/auth.service";
import { HttpError } from "../lib/errors/HttpError";
import { HttpResponse, validateSchema } from "../lib/utils/common";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  TokenPayload,
} from "../lib/utils/tokens";
import bcrypt from "bcrypt";
import { User } from "@db/prisma/types";
import { OAuth2Client } from "google-auth-library";
import * as z from "zod";

const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const GoogleOAuthSchema = z.object({
  accessToken: z.string(),
});

const oAuth2Client = new OAuth2Client();

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = validateSchema(req.body, RegisterSchema);

  const user = await findUserByEmail(email);

  if (user) {
    throw HttpError.BadRequest("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await createUser({
    name,
    email,
    password: hashedPassword,
    authProvider: "credential",
  });

  return issueSession(res, newUser, 201, "User registered successfully");
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = validateSchema(req.body, LoginSchema);

  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password || ""))) {
    throw HttpError.BadRequest("Invalid email or password");
  }

  return issueSession(res, user, 200, "Login successful");
};

export const googleOAuth = async (req: Request, res: Response) => {
  const { accessToken } = validateSchema(req.body, GoogleOAuthSchema);
  if (!accessToken)
    throw HttpError.BadRequest("Google access token is required");

  oAuth2Client.setCredentials({ access_token: accessToken });
  const { data } = await oAuth2Client.request<{
    email: string;
    name: string;
    picture: string;
  }>({ url: "https://www.googleapis.com/oauth2/v3/userinfo" });

  if (!data.email)
    throw HttpError.BadRequest("Could not retrieve email from Google");

  let user = await findUserByEmail(data.email);
  if (!user) {
    user = await createUser({
      name: data.name,
      email: data.email,
      image: data.picture,
      authProvider: "google",
    });
  }

  return issueSession(res, user, 200, "Login successful");
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (!token) throw HttpError.Unauthorized("No refresh token provided");

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw HttpError.Unauthorized("Invalid or expired refresh token");
  }

  const user = await findUserById(payload.userId);
  if (!user) throw HttpError.Unauthorized("User not found");

  // TODO: implement refresh token rotation with DB storage
  // DB table:
  // RefreshToken {
  //   id
  //   userId
  //   tokenHash
  //   expiresAt
  // }
  // Add CSRF token for extra security, if needed

  const isProd = process.env.NODE_ENV === "production";
  res.cookie("access_token", generateAccessToken(toTokenPayload(user)), {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  return HttpResponse(res, 200, { message: "Token refreshed" });
};

export const logout = async (req: Request, res: Response) => {
  clearAuthCookies(res);
  return HttpResponse(res, 200, { message: "Logged out successfully" });
};

function toTokenPayload(user: User): TokenPayload {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
  if (user.image) payload.image = user.image;
  return payload;
}

function toUserResponse(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}

function issueSession(
  res: Response,
  user: User,
  statusCode: number,
  message: string,
) {
  const payload = toTokenPayload(user);
  setAuthCookies(
    res,
    generateAccessToken(payload),
    generateRefreshToken({ userId: user.id }),
  );
  return HttpResponse(res, statusCode, { message, user: toUserResponse(user) });
}
