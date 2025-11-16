import { Badge } from "@domain/models/badge.model";

export interface UserProfileResponseDto {
  id: string;
  email: string;
  name: string;
  coin_amount: number;
  membership: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    features: any[];
  };
  badges: Badge[];
}
