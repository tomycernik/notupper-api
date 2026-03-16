import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '@config/supabase';
import { envs } from '@config/envs';
import { IUserRepository } from '@domain/repositories/user.repository';
import { IUser, IUserContext, IAuthUser } from '@domain/interfaces/user.interface';

export class UserRepositorySupabase implements IUserRepository {
  private buildToken(user: IUserContext): string {
    return jwt.sign({ id: user.id, rol: user.rol }, envs.JWT_SECRET, { expiresIn: '7d' });
  }

  async register(user: IUser): Promise<IAuthUser> {
    // Verificar si el email ya existe
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (existing) throw new Error('Ya existe una cuenta con ese email. Ingresá o usá otro email.');

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({ ...user, password: hashedPassword, rol: 'USER' })
      .select()
      .single();

    if (error) {
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        throw new Error('Ya existe una cuenta con ese email. Ingresá o usá otro email.');
      }
      throw new Error('Error al crear la cuenta. Intentá de nuevo.');
    }

    const { password: _, ...userContext } = data as IUser & { id: string };
    return { ...(userContext as IUserContext), token: this.buildToken(userContext as IUserContext) };
  }

  async login(email: string, password: string): Promise<IAuthUser> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) throw new Error('No encontramos una cuenta con ese email.');

    const valid = await bcrypt.compare(password, data.password);
    if (!valid) throw new Error('La contraseña es incorrecta.');

    const { password: _, ...userContext } = data as IUser & { id: string };
    return { ...(userContext as IUserContext), token: this.buildToken(userContext as IUserContext) };
  }

  async findById(id: string): Promise<IUserContext | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellido, email, celular, zona, rol')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as IUserContext;
  }

  async findAll(): Promise<IUserContext[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellido, email, celular, zona, rol')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as IUserContext[];
  }

  async update(id: string, data: Partial<IUser>): Promise<IUserContext> {
    const { password, ...safeData } = data;
    const { data: updated, error } = await supabase
      .from('users')
      .update(safeData)
      .eq('id', id)
      .select('id, nombre, apellido, email, celular, zona, rol')
      .single();

    if (error) throw new Error(error.message);
    return updated as IUserContext;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}