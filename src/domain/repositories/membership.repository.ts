import { IMembershipTier, IMembershipFeature } from "@domain/interfaces/membership.interface";

export interface IMembershipRepository {
  getMembershipById(id: number): Promise<IMembershipTier | null>;
  getMembershipByName(name: string): Promise<IMembershipTier | null>;
  getMembershipFeaturesByTierId(id: number): Promise<IMembershipFeature[]>;
  getUserMembership(userId: string): Promise<IMembershipTier | null>;
}
