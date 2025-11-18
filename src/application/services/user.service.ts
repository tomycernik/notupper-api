import { IUser } from "@domain/interfaces/user.interface";
import { IUserRepository } from "@domain/repositories/user.repository";
import { LoginDTO } from "@infrastructure/dtos/user/login.dto";
import { RegisterUserDTO } from "@infrastructure/dtos/user/register-user.dto";
import { UserInfoResponseDto } from "@infrastructure/dtos/user/user-info-response.dto";
import { MembershipService } from "@application/services/membership.service";
import { RoomService } from "@application/services/room.service";
import { supabase } from "@config/supabase";

export class UserService {

  async getUserIdByDreamNodeId(dreamNodeId: string): Promise<string> {
    const user = await this.userRepository.findByDreamNodeId(dreamNodeId);
    if (!user) throw new Error("Usuario no encontrado");
    return user.id!
  }

  async getAvatarUrlById(userId: string): Promise<string>{
    const avatarUrl = await this.userRepository.findUserAvatarUrlById(userId);
    if(!avatarUrl) throw new Error("Usuario no encontrado");
    return avatarUrl;
  }

  async getUserNameById(userId: string): Promise<string>{
    const userName = await this.userRepository.findUserNameById(userId);
    if(!userName) throw new Error("Usuario no encontrado");
    return userName;
  }

  constructor(
    private userRepository: IUserRepository,
    private membershipService: MembershipService,
    private roomService: RoomService
  ) { }

  async register(userInfo: RegisterUserDTO) {
    const user: IUser = {
      coin_amount: 0,
      membership_id: 1,
      ...userInfo,
    };

    return await this.userRepository.register(user);
  }

  async login(userCredentials: LoginDTO) {
    return await this.userRepository.login(userCredentials);
  }

  async updateMembership(userId: string, newTierName: string): Promise<void> {
    const tier = await this.membershipService.getMembershipByName(newTierName);
    if (!tier) throw new Error("Membership tier not found");

    const newMembership = await this.membershipService.buildMembershipForTier(
      tier
    );
    await this.userRepository.updateMembership(userId, newMembership);
  }

  async addCoins(userId: string, amount: number) {
    return await this.userRepository.addCoins(userId, amount);
  }

  async getUserInfo(userId: string): Promise<UserInfoResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");

    let avatar_url: string | undefined = undefined;
    let username: string | undefined = undefined;
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      if (!authError && authUser?.user) {
        avatar_url = authUser.user.user_metadata?.avatar_url || undefined;
        username = authUser.user.user_metadata?.username || (authUser.user.email ? authUser.user.email.split('@')[0] : "Usuario") || "Usuario";
      }
    } catch {/* no-op */ }

    const membership = await this.membershipService.getMembershipById(
      user.membership_id
    );
    if (!membership) throw new Error("No se pudo obtener la membresía");

    return {
      id: user.id!,
      email: user.email,
      name: user.name,
      username: username ?? null,
      coin_amount: user.coin_amount,
      avatar_url: avatar_url ?? null,
      membership: {
        id: membership.id,
        name: membership.name,
        startDate: user.membership_start_date!,
        endDate: user.membership_end_date!,
        features: membership.features,
      },
    };
  }
}
