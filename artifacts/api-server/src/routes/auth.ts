import { Router } from "express";
import { db, users, organizations, organizationMembers, branches, businessProfiles, languagePreferences } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { mockStore } from "../lib/mockStore";
import { validate } from "../middlewares/validate";

const router = Router();

const syncUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().optional().nullable(),
});

router.post("/sync", validate(syncUserSchema), async (req, res) => {
  const { id, email, displayName } = req.body;

  // Database Path
  if (process.env.DATABASE_URL) {
    try {
      // 1. Sync User
      let existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (existingUser.length === 0) {
        await db.insert(users).values({
          id,
          email,
          displayName: displayName || email.split("@")[0],
        });
        existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
      }

      // 2. Sync Default Organization
      let userOrgs = await db
        .select({
          org: organizations,
        })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.orgId, organizations.id))
        .where(eq(organizationMembers.userId, id))
        .limit(1);

      let activeOrg;
      if (userOrgs.length === 0) {
        // Create first organization
        const [newOrg] = await db
          .insert(organizations)
          .values({
            name: `${displayName || email.split("@")[0]}'s Vyapaar`,
          })
          .returning();
        
        await db.insert(organizationMembers).values({
          orgId: newOrg.id,
          userId: id,
          role: "owner",
        });

        await db.insert(businessProfiles).values({
          orgId: newOrg.id,
          tagline: "Digitizing Indian Small Business",
          primaryColor: "#6366f1",
          shortDescription: "My digital business powered by Vyapaar AI OS.",
        });

        activeOrg = newOrg;
      } else {
        activeOrg = userOrgs[0].org;
      }

      // 3. Sync Default Branch
      let orgBranches = await db.select().from(branches).where(eq(branches.orgId, activeOrg.id)).limit(1);
      let activeBranch;
      if (orgBranches.length === 0) {
        const [newBranch] = await db
          .insert(branches)
          .values({
            orgId: activeOrg.id,
            name: "Main Branch",
            location: "Default Location",
          })
          .returning();
        activeBranch = newBranch;
      } else {
        activeBranch = orgBranches[0];
      }

      return res.json({
        success: true,
        user: existingUser[0],
        organization: activeOrg,
        branch: activeBranch,
      });
    } catch (err: any) {
      console.error("Postgres Sync Error, falling back to mock storage:", err.message);
    }
  }

  // Fallback Path (In-memory mockStore)
  let mockUser = mockStore.users.find((u) => u.id === id);
  if (!mockUser) {
    mockUser = { id, email, displayName: displayName || email.split("@")[0] };
    mockStore.users.push(mockUser);
  }

  let mockMember = mockStore.organizationMembers.find((m) => m.userId === id);
  let mockOrg;
  if (!mockMember) {
    mockOrg = {
      id: mockStore.organizations.length + 1,
      name: `${mockUser.displayName}'s Vyapaar`,
    };
    mockStore.organizations.push(mockOrg);
    mockStore.organizationMembers.push({
      id: mockStore.organizationMembers.length + 1,
      orgId: mockOrg.id,
      userId: id,
      role: "owner",
    });
    mockStore.businessProfiles.push({
      orgId: mockOrg.id,
      tagline: "Digitizing Indian Small Business",
      primaryColor: "#6366f1",
      shortDescription: "My digital business powered by Vyapaar AI OS.",
    });
  } else {
    mockOrg = mockStore.organizations.find((o) => o.id === mockMember.orgId);
  }

  let mockBranch = mockStore.branches.find((b) => b.orgId === mockOrg.id);
  if (!mockBranch) {
    mockBranch = {
      id: mockStore.branches.length + 1,
      orgId: mockOrg.id,
      name: "Main Branch",
      location: "Default Location",
    };
    mockStore.branches.push(mockBranch);
  }

  return res.json({
    success: true,
    user: mockUser,
    organization: mockOrg,
    branch: mockBranch,
  });
});

// GET /auth/language-preference
router.get("/language-preference", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || "mock-user-1";
  
  if (process.env.DATABASE_URL) {
    try {
      const results = await db.select().from(languagePreferences).where(eq(languagePreferences.userId, userId)).limit(1);
      if (results.length > 0) {
        return res.json({ language: results[0].language });
      }
    } catch {}
  }
  return res.json({ language: "en" });
});

// PUT /auth/language-preference
router.put("/language-preference", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || "mock-user-1";
  const { language } = req.body;

  if (process.env.DATABASE_URL) {
    try {
      await db.insert(languagePreferences).values({ userId, language }).onConflictDoUpdate({
        target: languagePreferences.userId,
        set: { language, updatedAt: new Date() }
      });
      return res.json({ success: true });
    } catch {}
  }

  return res.json({ success: true });
});

export default router;
