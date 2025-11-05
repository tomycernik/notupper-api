export interface Room {
  id: string;
  name: string;
  description?: string;
  defaultTexture?: string | null;
  textureApplied?: string | null;
  imageUrl?: string;
  modelUrl?: string;
  isDefault: boolean;
  price?: number;
  includedInPlan?: string;
  roomEngineId: string;
  compatibleSkins?: string[];
  active?: boolean;
  createdAt: Date;
}