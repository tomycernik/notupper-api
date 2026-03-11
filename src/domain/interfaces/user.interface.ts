export type UserRol = 'USER' | 'ADMIN';

export interface IUser {
  id?: string;
  nombre: string;
  apellido: string;
  email?: string;
  celular: string;
  zona: string;
  password: string;
  rol: UserRol;
  created_at?: string;
}

export interface IUserContext {
  id: string;
  nombre: string;
  apellido: string;
  email?: string;
  celular: string;
  zona: string;
  rol: UserRol;
}

export interface IAuthUser extends IUserContext {
  token: string;
}
