"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepositorySupabase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("@config/supabase");
const envs_1 = require("@config/envs");
class UserRepositorySupabase {
    buildToken(user) {
        return jsonwebtoken_1.default.sign({ id: user.id, rol: user.rol }, envs_1.envs.JWT_SECRET, { expiresIn: '7d' });
    }
    async register(user) {
        const hashedPassword = await bcryptjs_1.default.hash(user.password, 10);
        const { data, error } = await supabase_1.supabase
            .from('users')
            .insert({ ...user, password: hashedPassword, rol: 'USER' })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        const { password: _, ...userContext } = data;
        return { ...userContext, token: this.buildToken(userContext) };
    }
    async login(email, password) {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error || !data)
            throw new Error('Credenciales inválidas');
        const valid = await bcryptjs_1.default.compare(password, data.password);
        if (!valid)
            throw new Error('Credenciales inválidas');
        const { password: _, ...userContext } = data;
        return { ...userContext, token: this.buildToken(userContext) };
    }
    async findById(id) {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('id, nombre, apellido, email, celular, zona, rol')
            .eq('id', id)
            .single();
        if (error)
            return null;
        return data;
    }
    async findAll() {
        const { data, error } = await supabase_1.supabase
            .from('users')
            .select('id, nombre, apellido, email, celular, zona, rol')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return (data ?? []);
    }
    async update(id, data) {
        const { password, ...safeData } = data;
        const { data: updated, error } = await supabase_1.supabase
            .from('users')
            .update(safeData)
            .eq('id', id)
            .select('id, nombre, apellido, email, celular, zona, rol')
            .single();
        if (error)
            throw new Error(error.message);
        return updated;
    }
    async delete(id) {
        const { error } = await supabase_1.supabase.from('users').delete().eq('id', id);
        if (error)
            throw new Error(error.message);
    }
}
exports.UserRepositorySupabase = UserRepositorySupabase;
//# sourceMappingURL=user.repository.supabase.js.map