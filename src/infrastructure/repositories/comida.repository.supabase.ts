import { supabase } from '@config/supabase';
import { IComidaRepository } from '@domain/repositories/comida.repository';
import { IComida } from '@domain/interfaces/comida.interface';

export class ComidaRepositorySupabase implements IComidaRepository {
  async create(comida: IComida): Promise<IComida> {
    const { data, error } = await supabase
      .from('comidas')
      .insert({ ...comida, activa: comida.activa ?? true })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as IComida;
  }

  async findAll(soloActivas?: boolean): Promise<IComida[]> {
    let query = supabase.from('comidas').select('*').order('created_at', { ascending: false });
    if (soloActivas) query = query.eq('activa', true);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as IComida[];
  }

  async findById(id: string): Promise<IComida | null> {
    const { data, error } = await supabase
      .from('comidas').select('*').eq('id', id).single();

    if (error) return null;
    return data as IComida;
  }

  async update(id: string, data: Partial<IComida>): Promise<IComida> {
    const { data: updated, error } = await supabase
      .from('comidas').update(data).eq('id', id).select().single();

    if (error) throw new Error(error.message);
    return updated as IComida;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('comidas').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async toggleActiva(id: string): Promise<IComida> {
    const current = await this.findById(id);
    if (!current) throw new Error('Comida no encontrada');
    return this.update(id, { activa: !current.activa });
  }
}
