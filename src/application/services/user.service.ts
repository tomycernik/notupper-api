import { IUser } from "@domain/interfaces/user.interface";
import { IUserRepository } from "@domain/repositories/user.repository";
import { RoomResponseDto } from "@infrastructure/dtos/room/get-user-rooms.dto";
import { LoginDTO } from "@infrastructure/dtos/user/login.dto";
import { RegisterUserDTO } from "@infrastructure/dtos/user/register-user.dto";
import { UserInfoResponseDto } from "@infrastructure/dtos/user/user-info-response.dto";
import { MembershipService } from "@application/services/membership.service";
import { RoomService } from "@application/services/room.service";

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private membershipService: MembershipService,
    private roomService: RoomService
  ) {}

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

    const membership = await this.membershipService.getMembershipById(
      user.membership_id
    );
    if (!membership) throw new Error("No se pudo obtener la membresía");

    const roomsResponse = await this.roomService.getUserRooms(userId);
    const rooms: RoomResponseDto[] = roomsResponse.data;

    return {
      id: user.id!,
      email: user.email,
      name: user.name,
      coin_amount: user.coin_amount,
      membership: {
        id: membership.id,
        name: membership.name,
        startDate: user.membership_start_date!,
        endDate: user.membership_end_date!,
        features: membership.features,
      },
      rooms,
    };
  }
}
