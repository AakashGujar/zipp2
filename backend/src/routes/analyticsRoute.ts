import UAParser from "@amplitude/ua-parser-js";
import { pgClient } from "../db/connectToDb";
import { verifyToken } from "../handlers/createAndVerifyToken";
import { queries } from "../queries/queries";
import { Router, Request, Response } from "express";

const router = Router();

router.get("/:urlId", verifyToken, async (req: Request, res: Response): Promise<void> => {
  const client = await pgClient.connect();
  try {
    const { urlId } = req.params;
    const analyticsResult = await client.query(queries.GET_URL_ANALYTICS, [urlId]);
    if (analyticsResult.rows.length === 0) {
      res.status(404).json({ message: "URL not found" });
      return;
    }
    res.json({
      message: "Analytics fetched successfully",
      data: analyticsResult.rows[0],
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Error fetching analytics" });
  } finally {
    client.release();
  }
});

router.get("/test/user-info", async (req: Request, res: Response): Promise<void> => {
  const userAgent = req.headers["user-agent"] || "";
  const parser = new UAParser();
  parser.setUA(userAgent);
  const uaResult = parser.getResult();

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
        city: geo.city,
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

export default router;
