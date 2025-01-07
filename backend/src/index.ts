import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoutes";
import urlRouter from "./routes/urlRoutes";
import analyticsRouter from "./routes/analyticsRoute";
import redirectRouter from "./routes/redirectRoute";
import { connectToDb, pgClient } from "./db/connectToDb";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["https://zipp2.netlify.app", "https://zipp2.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(cookieParser());
dotenv.config();
const port = process.env.PORT || 3000;

app.use("/auth", authRouter);
app.use("/url", urlRouter);
app.use("/analytics", analyticsRouter);
app.use("/", redirectRouter);

process.on("SIGTERM", async () => {
  await pgClient.end();
  process.exit(0);
});

app.listen(port, async () => {
  await connectToDb();
  console.log(`Server running on port http://localhost:${port}`);
});
