import { IMembershipFeature } from "@domain/interfaces/membership.interface";
import { RoomResponseDto } from "@infrastructure/dtos/room/get-user-rooms.dto";

export interface UserInfoResponseDto {
  id: string;
  email: string;
  name: string;
  coin_amount: number;
  membership: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    features: IMembershipFeature[];
  };
  rooms: RoomResponseDto[];
}