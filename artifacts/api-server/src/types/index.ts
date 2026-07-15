import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export interface AuditLogOptions {
  userId?: string | null;
  orgId: number;
  action: string;
  details?: string | null;
  requestId?: any; // Keep lax to support Express 5 ReqId type
}
