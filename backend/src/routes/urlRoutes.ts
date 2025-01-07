import { Router, Request, Response } from "express";
import { verifyToken } from "../handlers/createAndVerifyToken";
import { pgClient } from "../db/connectToDb";
import { randomBytes } from "crypto";
const router = Router();
import QRCode from "qrcode";
import { queries } from "../queries/queries";
import { validateRequest } from "../schema/validateSchema";
import { UrlSchema } from "../schema/urlSchema";

router.post(
  "/shorten",
  verifyToken,
  validateRequest(UrlSchema),
  async (req: Request, res: Response): Promise<void> => {
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

router.get(
  "/urls",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
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
  }
);

router.get(
  "/search",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
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
  }
);

router.delete(
  "/:urlId",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
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
        return;
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
  }
);

export default router;
