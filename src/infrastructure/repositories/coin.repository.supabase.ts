import { supabase } from "../../config/supabase";
import { ICoinRepository } from "../../domain/repositories/coin.repository";
export class CoinRepositorySupabase implements ICoinRepository {
  
  async getPackageById(packageId: string): Promise<{ id: string; description: string; price: number; coins: number; bonus: number } | null> {
      const { data, error } = await supabase
        .from('coin_package')
        .select('id, description, price, coins, bonus')
        .eq('id', packageId)
        .single();
      if (error || !data) return null;
      return data;
  }

  async registerMovement(profileId: string, amount: number, type: 'ingreso' | 'egreso', description: string): Promise<void> {
      const { error } = await supabase
        .from('coin_movement')
        .insert({
          profile_id: profileId,
          amount,
          type,
          description,
          created_at: new Date().toISOString()
        });
      if (error) throw new Error(error.message);
  }
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

  async getMovements(profileId: string): Promise<Array<{ description: string; value: number; sign: '+' | '-'; date: string; time: string }>> {
    const { data, error } = await supabase
      .from('coin_movement')
      .select('amount, type, description, created_at')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .range(0, 9);
    if (error) throw new Error(error.message);
    return (data || []).map((m: any) => ({
      description: m.description,
      value: m.amount,
      sign: m.type === 'ingreso' ? '+' : '-',
      date: m.created_at ? m.created_at.split('T')[0] : '',
      time: m.created_at ? m.created_at.split('T')[1]?.slice(0,5) : ''
    }));
  }
}
