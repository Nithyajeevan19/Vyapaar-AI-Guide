import { Router } from "express";
import { db, organizations, organizationMembers, businessProfiles } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { mockStore } from "../lib/mockStore";
import { validate } from "../middlewares/validate";
import { requireOrgMembership } from "../middlewares/requireOrgMembership";

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
router.get("/", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || "mock-user-1";

  if (process.env.DATABASE_URL) {
    try {
      const results = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          createdAt: organizations.createdAt,
        })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.orgId, organizations.id))
        .where(eq(organizationMembers.userId, userId));

      return res.json(results);
    } catch (err: any) {
      console.error("DB List Orgs Error:", err.message);
    }
  }

  // Fallback
  const userMemberships = mockStore.organizationMembers.filter((m) => m.userId === userId);
  const userOrgs = userMemberships.map((m) => {
    const org = mockStore.organizations.find((o) => o.id === m.orgId);
    return org ? { ...org, createdAt: new Date().toISOString() } : null;
  }).filter(Boolean);

  return res.json(userOrgs);
});

// POST /organizations - Create organization
router.post("/", validate(createOrgSchema), async (req, res) => {
  const userId = req.headers["x-user-id"] as string || "mock-user-1";
  const { name } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      const [newOrg] = await db.insert(organizations).values({ name }).returning();
      await db.insert(organizationMembers).values({
        orgId: newOrg.id,
        userId,
        role: "owner",
      });
      await db.insert(businessProfiles).values({
        orgId: newOrg.id,
        tagline: "Your catchphrase",
        primaryColor: "#4f46e5",
        shortDescription: "A fine business organization.",
      });

      return res.json(newOrg);
    } catch (err: any) {
      console.error("DB Create Org Error:", err.message);
    }
  }

  // Fallback
  const newOrg = {
    id: mockStore.organizations.length + 1,
    name,
    createdAt: new Date().toISOString(),
  };
  mockStore.organizations.push(newOrg);
  mockStore.organizationMembers.push({
    id: mockStore.organizationMembers.length + 1,
    orgId: newOrg.id,
    userId,
    role: "owner",
  });
  mockStore.businessProfiles.push({
    orgId: newOrg.id,
    tagline: "Your catchphrase",
    primaryColor: "#4f46e5",
    shortDescription: "A fine business organization.",
  });

  return res.json(newOrg);
});

// POST /organizations/:orgId/switch - Switch organization
router.post("/:orgId/switch", requireOrgMembership, (req, res) => {
  const { orgId } = req.params;
  return res.json({ success: true, orgId: parseInt(orgId as string) });
});

// GET /business-profile - Fetch profile details
router.get("/business-profile", requireOrgMembership, async (req, res) => {
  const orgId = parseInt(req.query.orgId as string || "1");

  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, orgId)).limit(1);
      if (results.length > 0) {
        return res.json(results[0]);
      }
    } catch (err: any) {
      console.error("DB Get Business Profile Error:", err.message);
    }
  }

  // Fallback
  const profile = mockStore.businessProfiles.find((bp) => bp.orgId === orgId) || {
    orgId,
    tagline: "My Catchy Slogan",
    primaryColor: "#6366f1",
    shortDescription: "A trusted local business operation.",
    category: "General Business",
  };
  return res.json(profile);
});

// PUT /business-profile - Update profile details
router.put("/business-profile", requireOrgMembership, validate(updateProfileSchema), async (req, res) => {
  const { orgId, logoUrl, tagline, primaryColor, shortDescription, category, phone, address, businessHours } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      const existing = await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, orgId)).limit(1);
      
      let updated;
      if (existing.length > 0) {
        [updated] = await db
          .update(businessProfiles)
          .set({ logoUrl, tagline, primaryColor, shortDescription, category, phone, address, businessHours, updatedAt: new Date() })
          .where(eq(businessProfiles.orgId, orgId))
          .returning();
      } else {
        [updated] = await db
          .insert(businessProfiles)
          .values({ orgId, logoUrl, tagline, primaryColor, shortDescription, category, phone, address, businessHours })
          .returning();
      }
      return res.json(updated);
    } catch (err: any) {
      console.error("DB Update Business Profile Error:", err.message);
    }
  }

  // Fallback
  let profileIdx = mockStore.businessProfiles.findIndex((bp) => bp.orgId === orgId);
  const updated = {
    orgId,
    logoUrl,
    tagline,
    primaryColor,
    shortDescription,
    category,
    phone,
    address,
    businessHours,
  };

  if (profileIdx >= 0) {
    mockStore.businessProfiles[profileIdx] = { ...mockStore.businessProfiles[profileIdx], ...updated };
  } else {
    mockStore.businessProfiles.push(updated);
  }

  return res.json(updated);
});

export default router;
