import { Pool } from "pg";
import { createTableQuery } from "../model/initDBModel";

export const pgClient = new Pool({
  connectionString: process.env.NEON_DB_CONNECTION_URI,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
  max: 50,
  idleTimeoutMillis: 600000,
  connectionTimeoutMillis: 5000,
});

export const connectToDb = async () => {
  try {
    await pgClient.query(createTableQuery);
    console.log("Connected to the database");
  } catch (error) {
    if (error instanceof Error) {
      console.log("Database connection error:", error.message);
    } else {
      console.log("Unexpected error occurred:", error);
    }
  }
};
