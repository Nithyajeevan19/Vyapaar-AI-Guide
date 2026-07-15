import { db, organizations, organizationMembers, businessProfiles } from "@workspace/db";
import { eq } from "drizzle-orm";
import { mockStore } from "../lib/mockStore";

export class OrganizationRepository {
  async listByUserId(userId: string) {
    if (process.env.DATABASE_URL) {
      return db
        .select({
          id: organizations.id,
          name: organizations.name,
          createdAt: organizations.createdAt,
        })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.orgId, organizations.id))
        .where(eq(organizationMembers.userId, userId));
    }
    
    const userMemberships = mockStore.organizationMembers.filter((m) => m.userId === userId);
    return userMemberships.map((m) => {
      const org = mockStore.organizations.find((o) => o.id === m.orgId);
      return org ? { ...org, createdAt: new Date().toISOString() } : null;
    }).filter(Boolean);
  }

  async create(name: string, userId: string) {
    if (process.env.DATABASE_URL) {
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
      return newOrg;
    }

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
    return newOrg;
  }

  async getBusinessProfile(orgId: number) {
    if (process.env.DATABASE_URL) {
      const results = await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, orgId)).limit(1);
      return results[0] || null;
    }
    return mockStore.businessProfiles.find((bp) => bp.orgId === orgId) || null;
  }

  async updateBusinessProfile(orgId: number, data: any) {
    if (process.env.DATABASE_URL) {
      const existing = await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, orgId)).limit(1);
      let updated;
      if (existing.length > 0) {
        [updated] = await db
          .update(businessProfiles)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(businessProfiles.orgId, orgId))
          .returning();
      } else {
        [updated] = await db
          .insert(businessProfiles)
          .values({ orgId, ...data })
          .returning();
      }
      return updated;
    }

    let profileIdx = mockStore.businessProfiles.findIndex((bp) => bp.orgId === orgId);
    const updated = { orgId, ...data };
    if (profileIdx >= 0) {
      mockStore.businessProfiles[profileIdx] = { ...mockStore.businessProfiles[profileIdx], ...updated };
    } else {
      mockStore.businessProfiles.push(updated);
    }
    return updated;
  }
}
