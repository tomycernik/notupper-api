import { Badge } from "@domain/models/badge.model";

export interface UserProfileResponseDto {
  id: string;
  email: string;
  name: string;
  coin_amount: number;
  badges: Badge[];
}
