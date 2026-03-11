import { supabase } from '@config/supabase';
import { IViandaRepository } from '@domain/repositories/vianda.repository';
import { IVianda, IViandaConComidas } from '@domain/interfaces/vianda.interface';

export class ViandaRepositorySupabase implements IViandaRepository {
  async create(vianda: IVianda): Promise<IVianda> {
    const { data, error } = await supabase
      .from('viandas')
      .insert({ ...vianda, activo: vianda.activo ?? false })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as IVianda;
  }

  async findAll(soloActivas?: boolean): Promise<IViandaConComidas[]> {
    let query = supabase
      .from('viandas')
      .select(`*, vianda_comidas(orden, comidas(*))`)
      .order('created_at', { ascending: false });

    if (soloActivas) query = query.eq('activo', true);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data ?? []).map((v: any) => ({
      ...v,
      comidas: (v.vianda_comidas ?? [])
        .sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0))
        .map((vc: any) => vc.comidas),
    }));
  }

  async findById(id: string): Promise<IViandaConComidas | null> {
    const { data, error } = await supabase
      .from('viandas')
      .select(`*, vianda_comidas(orden, comidas(*))`)
      .eq('id', id)
      .single();

    if (error) return null;

    return {
      ...data,
      comidas: (data.vianda_comidas ?? [])
        .sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0))
        .map((vc: any) => vc.comidas),
    };
  }

  async update(id: string, data: Partial<IVianda>): Promise<IVianda> {
    const { data: updated, error } = await supabase
      .from('viandas').update(data).eq('id', id).select().single();

    if (error) throw new Error(error.message);
    return updated as IVianda;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('viandas').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async toggleActivo(id: string): Promise<IVianda> {
    const current = await this.findById(id);
    if (!current) throw new Error('Vianda no encontrada');
    return this.update(id, { activo: !current.activo });
  }

  async asignarComidas(
    viandaId: string,
    comidas: { comidaId: string; orden?: number }[]
  ): Promise<void> {
    // Elimina las existentes y reinserta (reemplazo total)
    await supabase.from('vianda_comidas').delete().eq('vianda_id', viandaId);

    const rows = comidas.map(({ comidaId, orden }, i) => ({
      vianda_id: viandaId,
      comida_id: comidaId,
      orden: orden ?? i,
    }));

    const { error } = await supabase.from('vianda_comidas').insert(rows);
    if (error) throw new Error(error.message);
  }

  async quitarComida(viandaId: string, comidaId: string): Promise<void> {
    const { error } = await supabase
      .from('vianda_comidas')
      .delete()
      .eq('vianda_id', viandaId)
      .eq('comida_id', comidaId);

    if (error) throw new Error(error.message);
  }
}
