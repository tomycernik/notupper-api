import { IUserRepository } from '@domain/repositories/user.repository';
import { IUser, IUserContext, IAuthUser } from '@domain/interfaces/user.interface';
import { RegisterUserDTO } from '@infrastructure/dtos/user/user.dto';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    register(data: RegisterUserDTO): Promise<IAuthUser>;
    login(email: string, password: string): Promise<IAuthUser>;
    getById(id: string): Promise<IUserContext>;
    getAll(): Promise<IUserContext[]>;
    update(id: string, data: Partial<IUser>): Promise<IUserContext>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map