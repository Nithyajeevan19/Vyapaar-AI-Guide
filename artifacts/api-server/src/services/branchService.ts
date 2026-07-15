import { BranchRepository } from "../repositories/branchRepository";

export class BranchService {
  private branchRepository = new BranchRepository();

  async getBranches(orgId: number) {
    return this.branchRepository.listByOrgId(orgId);
  }

  async createBranch(orgId: number, name: string, location?: string | null) {
    return this.branchRepository.create({ orgId, name, location });
  }
}
