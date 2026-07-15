import { db, activityLogs } from "@workspace/db";
import { mockStore } from "../lib/mockStore";
import { logger } from "../lib/logger";
import { AuditLogOptions } from "../types";

export async function writeAuditLog(options: AuditLogOptions) {
  const { userId, orgId, action, details, requestId } = options;

  logger.info({
    msg: "Structured Audit Log Event",
    orgId,
    userId,
    action,
    details,
    requestId,
    timestamp: new Date().toISOString(),
  });

  try {
    if (process.env.DATABASE_URL) {
      await db.insert(activityLogs).values({
        orgId,
        userId: userId || null,
        action,
        details: details || null,
      });
    } else {
      mockStore.activityLogs.push({
        id: mockStore.activityLogs.length + 1,
        orgId,
        userId: userId || null,
        action,
        details: details || null,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    logger.error({
      msg: "Failed to insert audit log into database",
      error: err.message,
      orgId,
      userId,
      action,
    });
  }
}
