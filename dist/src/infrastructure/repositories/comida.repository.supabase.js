"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComidaRepositorySupabase = void 0;
const supabase_1 = require("@config/supabase");
class ComidaRepositorySupabase {
    async create(comida) {
        const { data, error } = await supabase_1.supabase
            .from('comidas')
            .insert({ ...comida, activa: comida.activa ?? true })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async findAll(soloActivas) {
        let query = supabase_1.supabase.from('comidas').select('*').order('created_at', { ascending: false });
        if (soloActivas)
            query = query.eq('activa', true);
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return (data ?? []);
    }
    async findById(id) {
        const { data, error } = await supabase_1.supabase
            .from('comidas').select('*').eq('id', id).single();
        if (error)
            return null;
        return data;
    }
    async update(id, data) {
        const { data: updated, error } = await supabase_1.supabase
            .from('comidas').update(data).eq('id', id).select().single();
        if (error)
            throw new Error(error.message);
        return updated;
    }
    async delete(id) {
        const { error } = await supabase_1.supabase.from('comidas').delete().eq('id', id);
        if (error)
            throw new Error(error.message);
    }
    async toggleActiva(id) {
        const current = await this.findById(id);
        if (!current)
            throw new Error('Comida no encontrada');
        return this.update(id, { activa: !current.activa });
    }
}
exports.ComidaRepositorySupabase = ComidaRepositorySupabase;
//# sourceMappingURL=comida.repository.supabase.js.map