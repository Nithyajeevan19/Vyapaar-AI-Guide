import { Router } from "express";
import { listBranches, createBranch } from "../controllers/branchController";
import { requireOrgMembership } from "../middlewares/requireOrgMembership";
import { validate } from "../middlewares/validate";
import { z } from "zod";

const router = Router();

const createBranchSchema = z.object({
  orgId: z.number(),
  name: z.string().min(1),
  location: z.string().optional().nullable(),
});

// GET /branches - List branches in active organization
router.get("/", requireOrgMembership, listBranches);

// POST /branches - Create branch
router.post("/", requireOrgMembership, validate(createBranchSchema), createBranch);

export default router;
