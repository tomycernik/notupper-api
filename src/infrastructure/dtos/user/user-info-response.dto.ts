import { IMembershipFeature } from "../../../domain/interfaces/membership.interface";

export interface UserInfoResponseDto {
  id: string;
  email: string;
  name: string;
  coin_amount: number;
  avatar_url?: string | null | undefined;
  membership: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    features: IMembershipFeature[];
  };
}