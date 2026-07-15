import { Router } from "express";
import {
  listOrganizations,
  createOrganization,
  switchOrganization,
  getBusinessProfile,
  updateBusinessProfile,
} from "../controllers/organizationController";
import { requireOrgMembership } from "../middlewares/requireOrgMembership";
import { validate } from "../middlewares/validate";
import { z } from "zod";

const router = Router();

const createOrgSchema = z.object({
  name: z.string().min(1),
});

const updateProfileSchema = z.object({
  orgId: z.number(),
  logoUrl: z.string().url().optional().nullable(),
  tagline: z.string().optional().nullable(),
  primaryColor: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  businessHours: z.any().optional().nullable(),
});

// GET /organizations - List user's organizations
router.get("/", listOrganizations);

// POST /organizations - Create organization
router.post("/", validate(createOrgSchema), createOrganization);

// POST /organizations/:orgId/switch - Switch organization
router.post("/:orgId/switch", requireOrgMembership, switchOrganization);

// GET /business-profile - Fetch profile details
router.get("/business-profile", requireOrgMembership, getBusinessProfile);

// PUT /business-profile - Update profile details
router.put("/business-profile", requireOrgMembership, validate(updateProfileSchema), updateBusinessProfile);

export default router;
