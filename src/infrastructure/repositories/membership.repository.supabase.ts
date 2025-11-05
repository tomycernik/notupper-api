import { supabase } from "@config/supabase";
import {
  IMembershipTier,
  IMembershipFeature,
} from "@domain/interfaces/membership.interface";
import { IMembershipRepository } from "@domain/repositories/membership.repository";

export class MembershipRepositorySupabase implements IMembershipRepository {
  async getMembershipById(id: number): Promise<IMembershipTier | null> {
    const { data, error } = await supabase
      .from("membership_tier")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error al obtener tier:", error);
      return null;
    }

    return data as IMembershipTier;
  }

  async getMembershipByName(name: string): Promise<IMembershipTier | null> {
    const { data, error } = await supabase
      .from("membership_tier")
      .select("*")
      .eq("name", name)
      .single();

    if (error) {
      console.error("Error al obtener tier por nombre:", error);
      return null;
    }

    return data as IMembershipTier;
  }

  async getMembershipFeaturesByTierId(
    membershipId: number
  ): Promise<IMembershipFeature[]> {
    const { data, error } = await supabase
      .from("membership_feature")
      .select(
        `
        allowed,
        feature:feature_id(name)
      `
      )
      .eq("membership_id", membershipId);

    if (error) {
      console.error("Error al obtener features del membership:", error);
      return [];
    }

    return (data ?? []).map((row: any) => ({
      name: row.feature.name,
      allowed: row.allowed,
    }));
  }

  async getUserMembership(userId: string): Promise<IMembershipTier | null> {
    const { data, error } = await supabase
      .from("profile")
      .select("membership_id")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error al obtener membership del usuario:", error);
      return null;
    }

    return await this.getMembershipById(data.membership_id);
  }
}
