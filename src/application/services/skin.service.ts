import { Skin } from '../../domain/interfaces/skin.interface';
import { GetUserSkinsResponseDto, SkinResponseDto } from '../../infrastructure/dtos/skin/get-user-skins.dto';
import { ISkinRepository } from '../../domain/repositories/skin.repository';

export class SkinService {
  constructor(private readonly skinRepository: ISkinRepository) {}

  async getUserSkins(userId: string): Promise<GetUserSkinsResponseDto> {
    if (!userId) {
      return {
        success: false,
        data: [],
        message: 'ID de usuario no proporcionado'
      };
    }
    try {
      const skins = await this.skinRepository.getUserSkins(userId);

      const skinResponses: SkinResponseDto[] = skins.map((skin) => {
        const response: SkinResponseDto = {
          id: skin.id,
          name: skin.name,
          price: skin.price ? { amount: skin.price, currency: 'coins' } : null,
          createdAt: skin.createdAt
        };

        if (skin.description) response.description = skin.description;
        if (skin.imageUrl) response.imageUrl = skin.imageUrl;
        if (skin.previewLight) response.previewLight = skin.previewLight;
        if (skin.previewDark) response.previewDark = skin.previewDark;
        if (skin.roomId) response.roomId = skin.roomId;
        if (skin.textureSet) response.textureSet = skin.textureSet;
        if (skin.includedInPlan) response.includedInPlan = skin.includedInPlan;

        return response;
      });

      return {
        success: true,
        data: skinResponses
      };
    } catch (error) {
      console.error('Error al obtener los skins del usuario:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Error al obtener los skins del usuario'
      };
    }
  }

  async getDefaultSkins(): Promise<Skin[]> {
    try {
      return await this.skinRepository.getDefaultSkins();
    } catch (error) {
      console.error('Error al obtener skins por defecto:', error);
      return [];
    }
  }

  async getSkinById(skinId: string): Promise<Skin | null> {
    try {
      return await this.skinRepository.findById(skinId);
    } catch (error) {
      console.error('Error al obtener el skin:', error);
      return null;
    }
  }

  async getCompatibleSkins(roomId: string): Promise<Skin[]> {
    return this.skinRepository.getCompatibleSkins(roomId);
  }

  async createSkin(skin: Omit<Skin, 'id' | 'createdAt'>): Promise<Skin> {
    return await this.skinRepository.create(skin);
  }

  async updateSkin(skinId: string, skin: Partial<Skin>): Promise<Skin> {
    try {
      const existingSkin = await this.getSkinById(skinId);
      if (!existingSkin) {
        throw new Error('Skin no encontrado');
      }

      if (skin.name !== undefined && skin.name.trim().length === 0) {
        throw new Error('El nombre del skin no puede estar vacío');
      }

      if (skin.price !== undefined && skin.price < 0) {
        throw new Error('El precio no puede ser negativo');
      }

      return await this.skinRepository.update(skinId, skin);
    } catch (error) {
      console.error('Error al actualizar el skin:', error);
      throw error;
    }
  }

  async deleteSkin(skinId: string): Promise<boolean> {
    try {
      await this.skinRepository.delete(skinId);
      return true;
    } catch (error) {
      console.error('Error al eliminar el skin:', error);
      return false;
    }
  }

  async addCompatibleRoom(skinId: string, roomId: string): Promise<Skin> {
    return await this.skinRepository.addCompatibleRoom(skinId, roomId);
  }

  async removeCompatibleRoom(skinId: string, roomId: string): Promise<Skin> {
    return await this.skinRepository.removeCompatibleRoom(skinId, roomId);
  }

}