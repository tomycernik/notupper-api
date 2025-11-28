import { supabase } from "@config/supabase";
import { IBadgeRepository } from "@domain/repositories/badge.repository";
import { Badge } from "@domain/models/badge.model";

export class BadgeRepositorySupabase implements IBadgeRepository {

  async getAllBadgesWithUser(profileId: string): Promise<Array<Badge & { acquired: boolean }>> {
    const { data: allBadges, error: allError } = await supabase
      .from('badge')
      .select('id, badge_description, badge_image, badge_code, coin_reward');
    if (allError) throw new Error(allError.message);

    const { data: userBadges, error: userError } = await supabase
      .from('user_badge')
      .select('badge_id')
      .eq('profile_id', profileId);
    if (userError) throw new Error(userError.message);

    const acquiredIds = new Set((userBadges || []).map((row: any) => row.badge_id));

    return (allBadges || []).map((row: any) => ({
      id: row.id,
      description: row.badge_description || undefined,
      imageUrl: row.badge_image || undefined,
      code: row.badge_code || undefined,
      coin_reward: row.coin_reward ?? undefined,
      acquired: acquiredIds.has(row.id)
    }));
  }

  async getAllBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badge')
      .select('id, badge_description, badge_image, badge_code, coin_reward');
    if (error) throw new Error(error.message);
    return (data || []).map((row: any) => ({
      id: row.id,
      description: row.badge_description || undefined,
      imageUrl: row.badge_image || undefined,
      code: row.badge_code || undefined,
      coin_reward: row.coin_reward ?? undefined,
    }));
  }

  async getUserBadges(profileId: string): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('user_badge')
      .select('badge:badge_id ( id, badge_description, badge_image, coin_reward, mission_id )')
      .eq('profile_id', profileId);

    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => ({
      id: row.badge.id,
      description: row.badge.badge_description || undefined,
      imageUrl: row.badge.badge_image || undefined,
      code: row.badge.badge_code || undefined,
      coin_reward: row.badge.coin_reward ?? undefined,
      mission_id: row.badge.mission_id || undefined,
    }));
  }

  async getBadgeById(badgeId: string): Promise<Badge | null> {
    const { data, error } = await supabase
      .from('badge')
      .select('id, badge_description, badge_image, badge_code, coin_reward')
      .eq('id', badgeId)
      .single();

    if (error) return null;
    if (!data) return null;

    return {
      id: data.id,
      description: data.badge_description || undefined,
      imageUrl: data.badge_image || undefined,
      code: data.badge_code || undefined,
      coin_reward: data.coin_reward ?? undefined,
    };
  }

  async awardBadge(profileId: string, badgeId: string): Promise<void> {

    const { error } = await supabase
      .from('user_badge')
      .upsert({ profile_id: profileId, badge_id: badgeId }, { onConflict: 'profile_id,badge_id' });

    if (error) throw new Error(error.message);
  }

  async getUserFeaturedBadges(profileId: string): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('user_badge')
      .select('badge:badge_id ( id, badge_description, badge_image, badge_code, coin_reward, mission_id ), featured_order')
      .eq('profile_id', profileId)
      .not('featured_order', 'is', null)
      .order('featured_order', { ascending: true })
      .limit(3);

    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => ({
      id: row.badge.id,
      description: row.badge.badge_description || undefined,
      imageUrl: row.badge.badge_image || undefined,
      code: row.badge.badge_code || undefined,
      coin_reward: row.badge.coin_reward ?? undefined,
      mission_id: row.badge.mission_id || undefined,
    }));
  }

  async setUserFeaturedBadges(profileId: string, badgeIds: string[]): Promise<void> {
    // limpiar el featured_order de todas las insignias del usuario
    const { error: clearError } = await supabase
      .from('user_badge')
      .update({ featured_order: null })
      .eq('profile_id', profileId);
    if (clearError) throw new Error(clearError.message);

    // asigna featured_order a las insignias seleccionadas
    for (let i = 0; i < badgeIds.length; i++) {
      const badgeId = badgeIds[i];
      const { error } = await supabase
        .from('user_badge')
        .update({ featured_order: i + 1 })
        .eq('profile_id', profileId)
        .eq('badge_id', badgeId);
      if (error) throw new Error(error.message);
    }
  }
}
