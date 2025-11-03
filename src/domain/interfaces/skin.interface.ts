export interface Skin {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  previewLight?: string;
  previewDark?: string;
  price?: number;
  includedInPlan?: string;
  createdAt: string;
  roomId?: string;
  textureSet?: Record<string, any>;
}