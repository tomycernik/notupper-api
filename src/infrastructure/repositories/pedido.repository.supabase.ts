import { supabase } from '@config/supabase';
import { IPedidoRepository } from '@domain/repositories/pedido.repository';
import { IPedido, IPedidoDetalle, PedidoEstado } from '@domain/interfaces/pedido.interface';

const SELECT_DETALLE = `
  *,
  usuario:users(nombre, apellido, celular, zona),
  vianda:viandas(nombre, tipo)
`;

export class PedidoRepositorySupabase implements IPedidoRepository {
  async create(pedido: IPedido): Promise<IPedido> {
    const { data, error } = await supabase
      .from('pedidos')
      .insert(pedido)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as IPedido;
  }

  async findAll(estado?: PedidoEstado): Promise<IPedidoDetalle[]> {
    let query = supabase
      .from('pedidos')
      .select(SELECT_DETALLE)
      .order('created_at', { ascending: false });

    if (estado) query = query.eq('estado', estado);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as IPedidoDetalle[];
  }

  async findById(id: string): Promise<IPedidoDetalle | null> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(SELECT_DETALLE)
      .eq('id', id)
      .single();

    if (error) return null;
    return data as IPedidoDetalle;
  }

  async findByUsuario(usuarioId: string): Promise<IPedidoDetalle[]> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(SELECT_DETALLE)
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as IPedidoDetalle[];
  }

  async updateEstado(id: string, estado: PedidoEstado): Promise<IPedido> {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as IPedido;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('pedidos').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}