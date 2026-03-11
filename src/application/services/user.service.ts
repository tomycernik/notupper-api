import { IUserRepository } from '@domain/repositories/user.repository';
import { IUser, IUserContext, IAuthUser } from '@domain/interfaces/user.interface';
import { RegisterUserDTO } from '@infrastructure/dtos/user/user.dto';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(data: RegisterUserDTO): Promise<IAuthUser> {
    const user: IUser = { ...data, rol: 'USER' } as IUser;
    return this.userRepository.register(user);
  }

  async login(email: string, password: string): Promise<IAuthUser> {
    return this.userRepository.login(email, password);
  }

  async getById(id: string): Promise<IUserContext> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  async getAll(): Promise<IUserContext[]> {
    return this.userRepository.findAll();
  }

  async update(id: string, data: Partial<IUser>): Promise<IUserContext> {
    await this.getById(id);
    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    return this.userRepository.delete(id);
  }
}