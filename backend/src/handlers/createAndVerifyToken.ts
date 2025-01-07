import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const generateToken = (userId: number) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign({ id: userId }, jwtSecret as string, {
      expiresIn: "15d",
    });
    return token;
  } catch (error) {
    console.log("Error generating token:", error);
    throw error;
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
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret as string) as JwtPayload;
    req.userId = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid token" });
    return;
  }
};