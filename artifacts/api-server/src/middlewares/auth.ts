import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * Authentication middleware that extracts user contexts and enforces security boundaries.
 * Restricts unauthorized anonymous access in production mode.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"] as string;

  if (!userId) {
    // SECURITY NOTE: Double-gate checks for local development mode authentication fallback.
    // In order to prevent accidental credentials exposure or data leaks in staging/production,
    // we require BOTH process.env.NODE_ENV !== "production" and process.env.ALLOW_DEV_AUTH_FALLBACK === "true"
    // to be explicitly configured to permit mock credentials context fallback.
    // If either gate is absent, requests without x-user-id will automatically receive a 401 Unauthorized block.
    const allowFallback = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_AUTH_FALLBACK === "true";

    if (allowFallback) {
      console.warn(
        `🚨 [SECURITY ALERT] DEVELOPER AUTHENTICATION FALLBACK IS ACTIVE!\n` +
        `   Path: ${req.method} ${req.originalUrl || req.path}\n` +
        `   Missing x-user-id header. Context defaulting to mock-user-1 credentials context.`
      );
      req.userId = "mock-user-1";
      return next();
    }

    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing credentials context. Request header x-user-id is required.",
    });
  }

  req.userId = userId;
  next();
}

