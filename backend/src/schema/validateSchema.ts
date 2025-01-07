import { Router, Request, Response } from "express";
import { NextFunction, RequestHandler } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validateRequest = (schema: AnyZodObject): RequestHandler => {
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
