import { z } from "zod";

export const UrlSchema = z.object({
  originalUrl: z.string().url("Invalid URL format"),
});
