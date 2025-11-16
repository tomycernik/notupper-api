import { supabase } from "../../config/supabase";
import { ICoinRepository } from "../../domain/repositories/coin.repository";

export class CoinRepositorySupabase implements ICoinRepository {

  async getUserCoins(profileId: string): Promise<number> {
    const { data, error } = await supabase
      .from('profile')
      .select('coin_amount')
      .eq('id', profileId)
      .single();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Profile not found');
    return data.coin_amount;
  }

  async addCoins(profileId: string, amount: number): Promise<void> {
    const { error } = await supabase.rpc('add_coins', { profile_id: profileId, amount });
    if (error) throw new Error(error.message);
  }

  async deductCoins(profileId: string, amount: number): Promise<void> {
    const coins = await this.getUserCoins(profileId);
    if (coins < amount) throw new Error('Saldo insuficiente');
    const { error } = await supabase.rpc('subtract_coins', { profile_id: profileId, amount });
    if (error) throw new Error(error.message);
  }
}
