import { Response, NextFunction } from "express";
import { OrganizationService } from "../services/organizationService";
import { sendSuccess } from "../responses/responseHelper";
import { BadRequestError } from "../errors/appErrors";
import { writeAuditLog } from "../logging/auditLogger";
import { AuthenticatedRequest } from "../types";

const orgService = new OrganizationService();

export async function listOrganizations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.headers["x-user-id"] as string || "mock-user-1";
    const results = await orgService.getUserOrganizations(userId);
    return sendSuccess(res, results);
  } catch (err) {
    next(err);
  }
}

export async function createOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.headers["x-user-id"] as string || "mock-user-1";
    const { name } = req.body;
    if (!name) {
      throw new BadRequestError("Organization name is required");
    }
    const newOrg = await orgService.createOrganization(name, userId);

    // Audit Log Creation
    await writeAuditLog({
      userId,
      orgId: newOrg.id,
      action: "CREATE_ORGANIZATION",
      details: `Created organization: "${name}"`,
      requestId: req.id,
    });

    return sendSuccess(res, newOrg, "Organization created successfully", 201);
  } catch (err) {
    next(err);
  }
}

export async function switchOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.headers["x-user-id"] as string || "mock-user-1";
    const { orgId } = req.params;
    const orgIdNum = parseInt(orgId as string, 10);
    if (isNaN(orgIdNum)) {
      throw new BadRequestError("Invalid organization ID format (orgId)");
    }

    // Audit Log Switch Context
    await writeAuditLog({
      userId,
      orgId: orgIdNum,
      action: "SWITCH_ORGANIZATION",
      details: `Switched active organization to ID: ${orgIdNum}`,
      requestId: req.id,
    });

    return sendSuccess(res, { success: true, orgId: orgIdNum });
  } catch (err) {
    next(err);
  }
}

export async function getBusinessProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const orgIdRaw = req.query.orgId || req.body.orgId;
    if (!orgIdRaw) {
      throw new BadRequestError("Missing organization context (orgId)");
    }
    const orgId = parseInt(orgIdRaw as string, 10);
    if (isNaN(orgId)) {
      throw new BadRequestError("Invalid organization ID format (orgId)");
    }
    const profile = await orgService.getBusinessProfile(orgId);
    return sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function updateBusinessProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.headers["x-user-id"] as string || "mock-user-1";
    const { orgId, logoUrl, tagline, primaryColor, shortDescription, category, phone, address, businessHours } = req.body;
    
    const profile = await orgService.updateBusinessProfile(orgId, {
      logoUrl,
      tagline,
      primaryColor,
      shortDescription,
      category,
      phone,
      address,
      businessHours,
    });

    // Audit Log Profile Updates
    await writeAuditLog({
      userId,
      orgId,
      action: "UPDATE_BUSINESS_PROFILE",
      details: `Updated profile details. Slogan: "${tagline || ''}", Category: "${category || ''}"`,
      requestId: req.id,
    });

    return sendSuccess(res, profile, "Business profile updated successfully");
  } catch (err) {
    next(err);
  }
}
