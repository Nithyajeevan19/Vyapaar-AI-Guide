import { db, branches } from "@workspace/db";
import { eq } from "drizzle-orm";
import { mockStore } from "../lib/mockStore";

export class BranchRepository {
  async listByOrgId(orgId: number) {
    if (process.env.DATABASE_URL) {
      return db.select().from(branches).where(eq(branches.orgId, orgId));
    }
    return mockStore.branches.filter((b) => b.orgId === orgId);
  }

  async create(data: { orgId: number; name: string; location?: string | null }) {
    if (process.env.DATABASE_URL) {
      const [newBranch] = await db.insert(branches).values(data).returning();
      return newBranch;
    }
    const newBranch = {
      id: mockStore.branches.length + 1,
      orgId: data.orgId,
      name: data.name,
      location: data.location || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockStore.branches.push(newBranch);
    return newBranch;
  }
}
