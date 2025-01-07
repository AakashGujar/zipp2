import bcrypt from "bcrypt";
import { Router, Request, Response } from "express";
import { pgClient } from "../db/connectToDb";
import {
  generateTokenAndSetCookie,
  verifyToken,
} from "../handlers/createAndVerifyToken";
import { LoginSchema, UserSchema } from "../schema/authSchema";
import { queries } from "../queries/queries";
import { validateRequest } from "../schema/validateSchema";

const router = Router();

router.post(
  "/signup",
  validateRequest(UserSchema),
  async (req: Request, res: Response): Promise<void> => {
    const client = await pgClient.connect();
    try {
      const { name, email, password } = req.body;
      const existingUserResult = await client.query(queries.EXISTING_USER, [
        email,
      ]);

      if (existingUserResult.rows.length > 0) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insertResponse = await client.query(queries.INSERT_USER, [
        name,
        email,
        hashedPassword,
      ]);

      const token = generateTokenAndSetCookie(insertResponse.rows[0].id, res);
      res.status(201).json({
        message: "User created successfully",
        data: insertResponse.rows[0],
        token,
      });
    } catch (error) {
      console.log("Signup error:", error);
      res.status(500).json({ message: "Error while signing up" });
    } finally {
      client.release();
    }
  }
);

router.post(
  "/signin",
  validateRequest(LoginSchema),
  async (req: Request, res: Response): Promise<void> => {
    const client = await pgClient.connect();
    try {
      const { email, password } = req.body;
      const userResult = await client.query(queries.GET_USER_BY_EMAIL, [email]);

      if (userResult.rows.length === 0) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const user = userResult.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      try {
        const token = generateTokenAndSetCookie(user.id, res);
        res.json({
          message: "Login successful",
          user: { id: user.id, name: user.name, email: user.email },
          token,
        });
      } catch (tokenError) {
        const errorMessage =
          tokenError instanceof Error ? tokenError.message : "Unknown error";
        res.status(500).json({
          message: "Error generating authentication token",
          error:
            process.env.NODE_ENV === "development" ? errorMessage : undefined,
        });
      }
    } catch (error) {
      console.log("Signin error:", error);
      res.status(500).json({ message: "Error while signing in" });
    } finally {
      client.release();
    }
  }
);

router.get("/logout", async (req, res): Promise<void> => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      secure: true,
      httpOnly: true,
      path: "/",
      sameSite: "strict",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Logout error:", error);
    res.status(500).json({ message: "Error while logging out" });
  }
});

router.get(
  "/verify",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    const client = await pgClient.connect();
    try {
      const userId = req.userId?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const userResult = await client.query(
        "SELECT id, name, email FROM users WHERE id = $1",
        [userId]
      );

      if (userResult.rows.length === 0) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      res.json({
        message: "Token verified successfully",
        user: userResult.rows[0],
      });
    } catch (error) {
      console.log("Verification error:", error);
      res.status(500).json({ message: "Error during verification" });
    } finally {
      client.release();
    }
  }
);

export default router;
