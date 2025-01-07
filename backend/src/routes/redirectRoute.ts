import { Router, Request, Response } from "express";
import { pgClient } from "../db/connectToDb";
import { queries } from "../queries/queries";
import UAParser from "@amplitude/ua-parser-js";

const router = Router();

router.get("/z/:shortUrl", async (req: Request, res: Response): Promise<void> => {
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

export default router;
