export interface RoomResponseDto {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  model_url?: string;
  texture_default?: string;
  texture_applied?: string | null;
  price?: {
    amount: number;
    currency: string;
  } | null;
  included_in_plan?: string | null;
  active: boolean;
  compatible_textures: string[];
  created_at: string;
}

export interface GetUserRoomsResponseDto {
  success: boolean;
  data: RoomResponseDto[];
  message?: string;
}