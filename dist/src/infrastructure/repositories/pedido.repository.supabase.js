"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidoRepositorySupabase = void 0;
const supabase_1 = require("@config/supabase");
const SELECT_DETALLE = `
  *,
  usuario:users(nombre, apellido, celular, zona),
  vianda:viandas(nombre, tipo, tamano)
`;
class PedidoRepositorySupabase {
    async create(pedido) {
        const { data, error } = await supabase_1.supabase
            .from('pedidos')
            .insert(pedido)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async findAll(estado) {
        let query = supabase_1.supabase
            .from('pedidos')
            .select(SELECT_DETALLE)
            .order('created_at', { ascending: false });
        if (estado)
            query = query.eq('estado', estado);
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return (data ?? []);
    }
    async findById(id) {
        const { data, error } = await supabase_1.supabase
            .from('pedidos')
            .select(SELECT_DETALLE)
            .eq('id', id)
            .single();
        if (error)
            return null;
        return data;
    }
    async findByUsuario(usuarioId) {
        const { data, error } = await supabase_1.supabase
            .from('pedidos')
            .select(SELECT_DETALLE)
            .eq('usuario_id', usuarioId)
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return (data ?? []);
    }
    async updateEstado(id, estado) {
        const { data, error } = await supabase_1.supabase
            .from('pedidos')
            .update({ estado })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async delete(id) {
        const { error } = await supabase_1.supabase.from('pedidos').delete().eq('id', id);
        if (error)
            throw new Error(error.message);
    }
}
exports.PedidoRepositorySupabase = PedidoRepositorySupabase;
//# sourceMappingURL=pedido.repository.supabase.js.map