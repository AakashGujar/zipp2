import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import { AnyZodObject, z, ZodError } from "zod";
import { randomBytes } from "crypto";
import QRCode from "qrcode";
import UAParser from "@amplitude/ua-parser-js";
import cors from "cors";

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
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(cookieParser());
dotenv.config();
const port = process.env.PORT || 3000;

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_url VARCHAR(255) NOT NULL UNIQUE,
    domain_prefix VARCHAR(255),
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    qr_code TEXT NOT NULL,
    url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clicks (
    id SERIAL PRIMARY KEY,
    url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    city VARCHAR(255),
    device VARCHAR(255),
    country VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const pgClient = new Pool({
  connectionString: process.env.NEON_DB_CONNECTION_URI,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
  max: 50,
  idleTimeoutMillis: 600000,
  connectionTimeoutMillis: 5000,
});

const connectToDb = async () => {
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

const generateTokenAndSetCookie = (userId: number, res: Response) => {
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
      // domain: ".onrender.com",
    });
    // res.cookie("jwt", token, {
    //   maxAge: 30 * 24 * 60 * 60 * 1000,
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
    //   domain: process.env.NODE_ENV === "production" ? '.onrender.com' : undefined
    // });
    return token;
  } catch (error) {
    console.log("Error in setting token:", error);
  }
};

interface JwtPayload {
  id: number;
}

const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const token = req.cookies?.jwt;
    if (!token) {
      res.status(401).json({ message: "Unauthorized No token provided" });
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

const queries = {
  EXISTING_USER: `SELECT * FROM users WHERE email = $1`,
  INSERT_USER: `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
  GET_USER_BY_EMAIL: `SELECT * FROM users WHERE email = $1`,
  CREATE_URL: `INSERT INTO urls (original_url, short_url, user_id, qr_code) VALUES ($1, $2, $3, $4) RETURNING *`,
  GET_URLS_BY_USER: `SELECT * FROM urls WHERE user_id = $1 ORDER BY created_at DESC`,
  SEARCH_QUERY: `SELECT * FROM urls 
  WHERE user_id = $1 
  AND (original_url ILIKE $2 OR short_url ILIKE $2 OR title ILIKE $2)`,
  DELETE_URL: "DELETE FROM urls WHERE id = $1 AND user_id = $2 RETURNING *",
  GET_URL_BY_SHORT: `SELECT * FROM urls WHERE short_url = $1`,
  RECORD_CLICK: `INSERT INTO clicks (url_id, city, device, country)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
  GET_URL_ANALYTICS: `
      SELECT 
        u.*,
        COUNT(c.id) as total_clicks,
        json_agg(json_build_object(
          'id', c.id,
          'city', c.city,
          'device', c.device,
          'country', c.country,
          'created_at', c.created_at
        )) as click_details
      FROM urls u
      LEFT JOIN clicks c ON u.id = c.url_id
      WHERE u.id = $1
      GROUP BY u.id
    `,
};

const validateRequest = (schema: AnyZodObject): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Validation Error",
          details: error.errors,
        });
      } else {
        res.status(500).json({
          error: "Internal Server Error while validating request",
        });
      }
    }
  };
};

const UserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

app.post(
  "/auth/signup",
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
      res.status(500).json({ message: "Error while signup" });
    } finally {
      client.release();
    }
  }
);

const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

app.post(
  "/auth/signin",
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
      res.status(500).json({ message: "Error while signin" });
    } finally {
      client.release();
    }
  }
);

app.get("/auth/logout", async (req, res): Promise<void> => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.json({ message: "Logged out successfully" });
    return;
  } catch (error) {
    console.log("Logout error:", error);
    res.status(500).json({ message: "Error while logging out" });
  }
});

const UrlSchema = z.object({
  originalUrl: z.string().url("Invalid URL format"),
});

app.post(
  "/url/shorten",
  verifyToken,
  validateRequest(UrlSchema),
  async (req, res): Promise<void> => {
    const client = await pgClient.connect();
    try {
      const { originalUrl } = req.body;
      const userId = req.userId?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const shortUrl = randomBytes(3).toString("hex");
      const fullShortUrl = `${process.env.PRODUCTION_URL}/${shortUrl}`;
      const generateQrCode = async (url: string): Promise<string> => {
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(url, {
            errorCorrectionLevel: "H",
            margin: 1,
            width: 300,
          });
          return qrCodeDataUrl;
        } catch (error) {
          console.log("Error generating QR code:", error);
          throw new Error("Failed to generate QR code");
        }
      };
      const qrCode = await generateQrCode(fullShortUrl);
      const newUrl = await client.query(queries.CREATE_URL, [
        originalUrl,
        shortUrl,
        userId,
        qrCode,
      ]);
      res.status(201).json({
        message: "URL shortened successfully",
        data: { ...newUrl.rows[0], short_url: fullShortUrl },
      });
    } catch (error) {
      console.log("Error generating short URL:", error);
      res.status(500).json({ message: "Error generating short URL" });
    } finally {
      client.release();
    }
  }
);

app.get("/url/urls", verifyToken, async (req, res): Promise<void> => {
  const client = await pgClient.connect();
  try {
    const userId = req.userId?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const urlsResult = await client.query(queries.GET_URLS_BY_USER, [userId]);
    res.json({ message: "URLs fetched successfully", data: urlsResult.rows });
  } catch (error) {
    console.log("Error fetching URLs:", error);
    res.status(500).json({ message: "Error fetching URLs" });
  } finally {
    client.release();
  }
});

app.get("/url/search", verifyToken, async (req, res): Promise<void> => {
  const client = await pgClient.connect();
  try {
    const query = req.query.query as string;
    const userId = req.userId?.id;
    const searchResults = await pgClient.query(`${queries.SEARCH_QUERY}`, [
      userId,
      `%${query}%`,
    ]);
    res.json({
      message: "Search results fetched successfully",
      data: searchResults.rows,
    });
  } catch (error) {
    console.log("Error searching URLs:", error);
    res.status(500).json({ message: "Error searching URLs" });
  } finally {
    client.release();
  }
});

app.delete("/url/:urlId", verifyToken, async (req, res): Promise<void> => {
  const client = await pgClient.connect();
  try {
    const { urlId } = req.params;
    const userId = req.userId?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const result = await client.query(queries.DELETE_URL, [urlId, userId]);
    if (result.rows.length === 0) {
      res.status(404).json({
        message: "URL not found or you don't have permission to delete it",
      });
    }
    res.json({
      message: "URL deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.log("Error deleting URL:", error);
    res.status(500).json({ message: "Error deleting URL" });
  } finally {
    client.release();
  }
});

app.get("/analytics/:urlId", verifyToken, async (req, res): Promise<void> => {
  const client = await pgClient.connect();
  try {
    const { urlId } = req.params;
    const analyticsResult = await pgClient.query(queries.GET_URL_ANALYTICS, [
      urlId,
    ]);
    if (analyticsResult.rows.length === 0) {
      res.status(404).json({ message: "URL not found" });
      return;
    }
    res.json({
      message: "Analytics fetched successfully",
      data: analyticsResult.rows[0],
    });
  } catch (error) {
    console.log("Error fetching analytics:", error);
    res.status(500).json({ message: "Error fetching analytics" });
  } finally {
    client.release();
  }
});

app.get("/:shortUrl", async (req, res): Promise<void> => {
  const client = await pgClient.connect();
  try {
    const { shortUrl } = req.params;
    const urlResult = await client.query(queries.GET_URL_BY_SHORT, [shortUrl]);
    if (urlResult.rows.length === 0) {
      res.status(404).json({ message: "URL not found" });
      return;
    }

    const url = urlResult.rows[0];

    (async () => {
      try {
        const userAgent = req.headers["user-agent"] || "";
        const parser = new UAParser();
        parser.setUA(userAgent);
        const result = parser.getResult();

        const geoResponse = await fetch(`https://ipapi.co/json`);
        const geo = await geoResponse.json();

        await client.query(queries.RECORD_CLICK, [
          url.id,
          geo?.city || "Unknown",
          result.os.name || "Unknown",
          geo?.country || "Unknown",
        ]);
      } catch (error) {
        console.error("Analytics error:", error);
      } finally {
        client.release();
      }
    })();

    res.json({
      success: true,
      data: {
        originalUrl: url.original_url,
        shortUrl: url.short_url,
        id: url.id,
      },
    });
  } catch (error) {
    console.error("Error processing redirect:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/test/user-info", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const parser = new UAParser();
  parser.setUA(userAgent);
  const uaResult = parser.getResult();

  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "Unknown";

  try {
    const geoResponse = await fetch(`https://ipapi.co/json`);
    const geo = await geoResponse.json();

    res.json({
      userAgent: {
        browser: uaResult.browser.name,
        cpu: uaResult.cpu.architecture,
        os: uaResult.os.name,
      },
      geo: {
        ip: geo.ip,
        city: geo.ip,
        region: geo.region,
        region_code: geo.region_code,
        country_name: geo.country_name,
        timezone: geo.timezone,
      },
    });
  } catch (error) {
    console.error("Error fetching geo-location data:", error);
    res.status(500).send("Error fetching geo-location data");
  }
});

app.get(
  "/auth/verify",
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

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", message: "Service is working" });
});

process.on("SIGTERM", async () => {
  await pgClient.end();
  process.exit(0);
});

app.listen(port, async () => {
  await connectToDb();
  console.log(`Server running on port http://localhost:${port}`);
});
