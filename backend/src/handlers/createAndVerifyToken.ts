import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId: number, res: Response) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign({ id: userId }, jwtSecret as string, {
      expiresIn: "15d",
    });
    res.cookie("jwt", token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    return token;
  } catch (error) {
    console.log("Error in setting token:", error);
  }
};

interface JwtPayload {
  id: number;
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const token = req.cookies?.jwt;
    if (!token) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }
    const decoded = jwt.verify(token, jwtSecret as string) as JwtPayload;
    req.userId = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid token" });
    return;
  }
};
