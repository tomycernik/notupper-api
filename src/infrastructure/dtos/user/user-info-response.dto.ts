export interface UserInfoResponseDto {
  id: string;
  email: string;
  name: string;
  username?: string | null;
  coin_amount: number;
  avatar_url?: string | null | undefined;
}