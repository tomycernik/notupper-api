import {
  IMembership,
  IMembershipTier,
  IMembershipFeature,
} from "@domain/interfaces/membership.interface";
import { IMembershipRepository } from "@domain/repositories/membership.repository";

export interface IMembershipTierWithFeatures extends IMembershipTier {
  features: IMembershipFeature[];
}

export class MembershipService {
  constructor(private membershipRepository: IMembershipRepository) {}

  async getMembershipById(id: number): Promise<IMembershipTierWithFeatures | null> {
    const tier = await this.membershipRepository.getMembershipById(id);
    if (!tier) return null;

    const features = await this.membershipRepository.getMembershipFeaturesByTierId(id);
    return { ...tier, features };
  }

  async getMembershipByName(name: string): Promise<IMembershipTierWithFeatures | null> {
    const tier = await this.membershipRepository.getMembershipByName(name);
    if (!tier) return null;

    const features = await this.membershipRepository.getMembershipFeaturesByTierId(tier.id);
    return { ...tier, features };
  }

  generateMembershipPeriod(durationMonths: number): { start: Date; end: Date } {
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    return { start, end };
  }

  async buildMembershipForTier(tier: IMembershipTier): Promise<IMembership> {
    const { start, end } = this.generateMembershipPeriod(tier.duration_months);

    return {
      membership_id: tier.id,
      membership_start_date: start.toISOString(),
      membership_end_date: end.toISOString(),
    };
  }

  async getUserMembership(userId: string): Promise<IMembershipTier | null> {
    return await this.membershipRepository.getUserMembership(userId);
  }
}
