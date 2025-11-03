export interface SkinResponseDto {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  previewLight?: string;
  previewDark?: string;
  roomId?: string;
  textureSet?: Record<string, any>;
  price?: {
    amount: number;
    currency: string;
  } | null;
  includedInPlan?: string | null;
  createdAt: string;
}

export interface GetUserSkinsResponseDto {
  success: boolean;
  data: SkinResponseDto[];
  message?: string;
}