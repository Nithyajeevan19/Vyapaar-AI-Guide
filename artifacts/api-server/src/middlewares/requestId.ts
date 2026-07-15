import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const reqId = (req.headers["x-request-id"] as string) || crypto.randomUUID();
  (req as any).id = reqId;
  res.setHeader("x-request-id", reqId);
  next();
}
