import { IAuthUser, IUser, IUserContext } from '@domain/interfaces/user.interface';

export interface IUserRepository {
  register(user: IUser): Promise<IAuthUser>;
  login(email: string, password: string): Promise<IAuthUser>;
  findById(id: string): Promise<IUserContext | null>;
  findAll(): Promise<IUserContext[]>;
  update(id: string, data: Partial<IUser>): Promise<IUserContext>;
  delete(id: string): Promise<void>;
}
