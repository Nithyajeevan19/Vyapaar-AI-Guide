import { Response } from "express";

/**
 * Standardized success response helper.
 * Since the API/frontend client expects raw objects/arrays rather than enveloped data
 * (i.e. returning a list of organizations directly in the body, not under `{ success: true, data: results }`),
 * this helper sends the exact data payload to prevent breaking existing UI bindings.
 */
export function sendSuccess(res: Response, data: any, message?: string, statusCode = 200) {
  return res.status(statusCode).json(data);
}
