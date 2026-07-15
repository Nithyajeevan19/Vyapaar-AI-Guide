import { OrganizationRepository } from "../repositories/organizationRepository";

export class OrganizationService {
  private orgRepository = new OrganizationRepository();

  async getUserOrganizations(userId: string) {
    return this.orgRepository.listByUserId(userId);
  }

  async createOrganization(name: string, userId: string) {
    return this.orgRepository.create(name, userId);
  }

  async getBusinessProfile(orgId: number) {
    const profile = await this.orgRepository.getBusinessProfile(orgId);
    if (!profile) {
      return {
        orgId,
        tagline: "My Catchy Slogan",
        primaryColor: "#6366f1",
        shortDescription: "A trusted local business operation.",
        category: "General Business",
      };
    }
    return profile;
  }

  async updateBusinessProfile(orgId: number, data: any) {
    return this.orgRepository.updateBusinessProfile(orgId, data);
  }
}
