"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViandaRepositorySupabase = void 0;
const supabase_1 = require("@config/supabase");
class ViandaRepositorySupabase {
    async create(vianda) {
        const { data, error } = await supabase_1.supabase
            .from('viandas')
            .insert({ ...vianda, activo: vianda.activo ?? false })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async findAll(soloActivas) {
        let query = supabase_1.supabase
            .from('viandas')
            .select(`*, vianda_comidas(orden, comidas(*))`)
            .order('created_at', { ascending: false });
        if (soloActivas)
            query = query.eq('activo', true);
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return (data ?? []).map((v) => ({
            ...v,
            comidas: (v.vianda_comidas ?? [])
                .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
                .map((vc) => vc.comidas),
        }));
    }
    async findById(id) {
        const { data, error } = await supabase_1.supabase
            .from('viandas')
            .select(`*, vianda_comidas(orden, comidas(*))`)
            .eq('id', id)
            .single();
        if (error)
            return null;
        return {
            ...data,
            comidas: (data.vianda_comidas ?? [])
                .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
                .map((vc) => vc.comidas),
        };
    }
    async update(id, data) {
        const { data: updated, error } = await supabase_1.supabase
            .from('viandas').update(data).eq('id', id).select().single();
        if (error)
            throw new Error(error.message);
        return updated;
    }
    async delete(id) {
        const { error } = await supabase_1.supabase.from('viandas').delete().eq('id', id);
        if (error)
            throw new Error(error.message);
    }
    async toggleActivo(id) {
        const current = await this.findById(id);
        if (!current)
            throw new Error('Vianda no encontrada');
        return this.update(id, { activo: !current.activo });
    }
    async asignarComidas(viandaId, comidas) {
        // Elimina las existentes y reinserta (reemplazo total)
        await supabase_1.supabase.from('vianda_comidas').delete().eq('vianda_id', viandaId);
        const rows = comidas.map(({ comidaId, orden }, i) => ({
            vianda_id: viandaId,
            comida_id: comidaId,
            orden: orden ?? i,
        }));
        const { error } = await supabase_1.supabase.from('vianda_comidas').insert(rows);
        if (error)
            throw new Error(error.message);
    }
    async quitarComida(viandaId, comidaId) {
        const { error } = await supabase_1.supabase
            .from('vianda_comidas')
            .delete()
            .eq('vianda_id', viandaId)
            .eq('comida_id', comidaId);
        if (error)
            throw new Error(error.message);
    }
}
exports.ViandaRepositorySupabase = ViandaRepositorySupabase;
//# sourceMappingURL=vianda.repository.supabase.js.map