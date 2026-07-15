import { Response, NextFunction } from "express";
import { BranchService } from "../services/branchService";
import { sendSuccess } from "../responses/responseHelper";
import { BadRequestError } from "../errors/appErrors";
import { writeAuditLog } from "../logging/auditLogger";
import { AuthenticatedRequest } from "../types";

const branchService = new BranchService();

export async function listBranches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const orgIdRaw = req.query.orgId || req.body.orgId;
    if (!orgIdRaw) {
      throw new BadRequestError("Missing organization context (orgId)");
    }
    const orgId = parseInt(orgIdRaw as string, 10);
    if (isNaN(orgId)) {
      throw new BadRequestError("Invalid organization context format (orgId)");
    }
    const results = await branchService.getBranches(orgId);
    return sendSuccess(res, results);
  } catch (err) {
    next(err);
  }
}

export async function createBranch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { orgId, name, location } = req.body;
    if (!name) {
      throw new BadRequestError("Branch name is required");
    }
    const newBranch = await branchService.createBranch(orgId, name, location);

    // Write structured audit log
    await writeAuditLog({
      userId: req.userId || null,
      orgId,
      action: "CREATE_BRANCH",
      details: `Created branch: "${name}" at location: "${location || 'Default'}"`,
      requestId: req.id,
    });

    return sendSuccess(res, newBranch, "Branch created successfully", 201);
  } catch (err) {
    next(err);
  }
}
