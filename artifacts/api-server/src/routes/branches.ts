import { Router } from "express";
import { db, branches } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { mockStore } from "../lib/mockStore";
import { validate } from "../middlewares/validate";
import { requireOrgMembership } from "../middlewares/requireOrgMembership";

const router = Router();

const createBranchSchema = z.object({
  orgId: z.number(),
  name: z.string().min(1),
  location: z.string().optional().nullable(),
});

// GET /branches - List branches in active organization
router.get("/", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(branches).where(eq(branches.orgId, orgId));
      return res.json(results);
    } catch (err: any) {
      console.error("DB Get Branches Error:", err.message);
    }
  }

  // Fallback
  const orgBranches = mockStore.branches.filter((b) => b.orgId === orgId);
  return res.json(orgBranches);
});

// POST /branches - Create branch
router.post("/", requireOrgMembership, validate(createBranchSchema), async (req, res) => {
  const { orgId, name, location } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      const [newBranch] = await db
        .insert(branches)
        .values({
          orgId,
          name,
          location,
        })
        .returning();
      return res.json(newBranch);
    } catch (err: any) {
      console.error("DB Create Branch Error:", err.message);
    }
  }

  // Fallback
  const newBranch = {
    id: mockStore.branches.length + 1,
    orgId,
    name,
    location,
  };
  mockStore.branches.push(newBranch);
  return res.json(newBranch);
});

export default router;
