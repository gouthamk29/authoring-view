import type { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/responses.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";
  const isDev = process.env.NODE_ENV === "development";

  console.error(err);
  errorResponse(res, statusCode, {
    message,
    ...(isDev && { stack: err.stack }),
  });
}
