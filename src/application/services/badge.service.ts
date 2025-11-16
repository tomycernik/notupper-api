import { Badge } from "@domain/models/badge.model";
import { IBadgeRepository } from "@domain/repositories/badge.repository";

export class BadgeService {
  constructor(private badgeRepository: IBadgeRepository) {}

  async getUserBadges(profileId: string): Promise<Badge[]> {
    return this.badgeRepository.getUserBadges(profileId);
  }

  async getUserFeaturedBadges(profileId: string): Promise<Badge[]> {
    return this.badgeRepository.getUserFeaturedBadges(profileId);
  }

  async setUserFeaturedBadges(profileId: string, badgeIds: string[]): Promise<void> {
    return this.badgeRepository.setUserFeaturedBadges(profileId, badgeIds);
  }
}
