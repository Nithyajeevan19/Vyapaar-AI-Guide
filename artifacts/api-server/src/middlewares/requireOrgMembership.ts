import { Request, Response, NextFunction } from "express";
import { db, organizationMembers } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { mockStore } from "../lib/mockStore";

/**
 * Express middleware that checks if the authenticated user has membership in the requested organization.
 * Checks orgId from query params, body parameters, or route parameters.
 */
export async function requireOrgMembership(req: Request, res: Response, next: NextFunction) {
  let userId = (req as any).userId || (req.headers["x-user-id"] as string);

  if (!userId) {
    const allowFallback = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_AUTH_FALLBACK === "true";
    if (allowFallback) {
      console.warn(
        `🚨 [SECURITY ALERT] DEVELOPER AUTHENTICATION FALLBACK IS ACTIVE IN MEMBERSHIP CHECK!\n` +
        `   Path: ${req.method} ${req.originalUrl || req.path}\n` +
        `   Missing x-user-id header. Context defaulting to mock-user-1 credentials context.`
      );
      userId = "mock-user-1";
    } else {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing credentials context. Request header x-user-id is required.",
      });
    }
  }


  // Ensure userId is attached to request context for subsequent routing controllers
  (req as any).userId = userId;

  // Extract orgId from query, body, or route parameters
  const orgIdRaw = req.query.orgId || req.body.orgId || req.params.orgId;

  if (!orgIdRaw) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Missing organization identifier context (orgId).",
    });
  }

  const orgId = parseInt(orgIdRaw as string, 10);
  if (isNaN(orgId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Invalid organization identifier context format (orgId).",
    });
  }

  // 1. PostgreSQL DB Path
  if (process.env.DATABASE_URL) {
    try {
      const results = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.userId, userId),
            eq(organizationMembers.orgId, orgId)
          )
        )
        .limit(1);

      if (results.length > 0) {
        return next();
      }

      return res.status(403).json({
        error: "Forbidden",
        message: `Unauthorized access. User does not have membership permissions for organization ${orgId}.`,
      });
    } catch (err: any) {
      console.error("Postgres membership authorization check failed, falling back to mockStore:", err.message);
    }
  }

  // 2. Fallback Path (In-memory mockStore)
  const isMember = mockStore.organizationMembers.some(
    (m) => m.userId === userId && m.orgId === orgId
  );

  if (isMember) {
    return next();
  }

  return res.status(403).json({
    error: "Forbidden",
    message: `Unauthorized access. User does not have membership permissions for organization ${orgId}.`,
  });
}
