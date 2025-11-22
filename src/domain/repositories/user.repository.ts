import { LoginDTO } from "@infrastructure/dtos/user/login.dto";
import { IMembership } from "@domain/interfaces/membership.interface";
import { IRepositoryUser, IUser } from "@domain/interfaces/user.interface";

export interface IUserRepository {
  findUserAvatarUrlById(userId: string): Promise<string | null>;
  findUserNameById(userId: string): Promise<string | null>;
  findByDreamNodeId(dreamNodeId: string): Promise<IUser | null>;
  register(user: IUser): Promise<IRepositoryUser>;
  login(userCredentials: LoginDTO): Promise<IRepositoryUser>;
  updateMembership(userId: string, membership: IMembership): Promise<void>;
  addCoins(userId: string, amount: number): Promise<void>;
  findById(id: string): Promise<IUser | null>;
}
