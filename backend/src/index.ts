import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoutes";
import urlRouter from "./routes/urlRoutes";
import analyticsRouter from "./routes/analyticsRoute";
import redirectRouter from "./routes/redirectRoute";
import { connectToDb, pgClient } from "./db/connectToDb";
import fetch from "node-fetch";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://zipp2.netlify.app",
      "https://zipp2.onrender.com",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

app.use("/auth", authRouter);
app.use("/url", urlRouter);
app.use("/analytics", analyticsRouter);
app.use("/", redirectRouter);

app.get("/", (req, res) => {
  res.json({ message: "Working perfectly" });
});

const keepAlive = () => {
  const url = "https://zipp2.onrender.com";
  setInterval(async () => {
    try {
      const response = await fetch(url);
      console.log("Keep-alive ping sent, status:", response.status);
    } catch (error) {
      console.error("Keep-alive ping failed:", error);
    }
  }, 840000);
};
keepAlive();

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await pgClient.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await pgClient.end();
  process.exit(0);
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await connectToDb();
  console.log(`Server running on port http://localhost:${port}`);
});
