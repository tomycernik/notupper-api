export interface Room {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  modelUrl?: string;
  isDefault: boolean;
  price?: number;
  includedInPlan?: string;
  compatibleSkins?: string[];
  active?: boolean;
  createdAt: Date;
}