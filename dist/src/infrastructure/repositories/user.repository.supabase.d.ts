import { IUserRepository } from '@domain/repositories/user.repository';
import { IUser, IUserContext, IAuthUser } from '@domain/interfaces/user.interface';
export declare class UserRepositorySupabase implements IUserRepository {
    private buildToken;
    register(user: IUser): Promise<IAuthUser>;
    login(email: string, password: string): Promise<IAuthUser>;
    findById(id: string): Promise<IUserContext | null>;
    findAll(): Promise<IUserContext[]>;
    update(id: string, data: Partial<IUser>): Promise<IUserContext>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=user.repository.supabase.d.ts.map