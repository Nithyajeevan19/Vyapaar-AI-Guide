import { Request, Response, NextFunction } from "express";
import { AppError } from "./appErrors";
import { logger } from "../lib/logger";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const isProduction = process.env.NODE_ENV === "production";
  
  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "Internal Server Error";
  let details = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    message = err.message;
    // Log unexpected errors with full stack trace
    logger.error({
      msg: "Unexpected error encountered during request execution",
      error: err.message,
      stack: err.stack,
      path: req.originalUrl || req.path,
      method: req.method,
      requestId: (req as any).id,
    });
  } else {
    logger.error({
      msg: "Non-error object thrown",
      thrownObject: err,
      requestId: (req as any).id,
    });
  }

  // Send standardized JSON response
  res.status(statusCode).json({
    error: code,
    message,
    details: isProduction ? null : details || (err instanceof Error ? { stack: err.stack } : null),
  });
}
